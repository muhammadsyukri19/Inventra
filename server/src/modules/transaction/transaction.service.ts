import { prisma } from '../../config/database';
import { BadRequestError, NotFoundError } from '../../utils/errors';
import type { CreateTransactionPayload, TransactionResponse } from './transaction.types';
import type { Prisma } from '@prisma/client';

export class TransactionService {
  /**
   * Helper to format transaction response with proper number casting for Decimals
   */
  private formatTransactionResponse(transaction: any): TransactionResponse {
    return {
      ...transaction,
      totalAmount: Number(transaction.totalAmount),
      items: transaction.items?.map((item: any) => ({
        ...item,
        unitPrice: Number(item.unitPrice),
        subtotal: Number(item.subtotal),
      })),
    };
  }

  /**
   * Generate a unique transaction code
   */
  private async generateTransactionCode(type: 'IN' | 'OUT'): Promise<string> {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    const prefix = `TRX-${type}-${dateStr}-`;

    const lastTransaction = await prisma.transaction.findFirst({
      where: { transactionCode: { startsWith: prefix } },
      orderBy: { transactionCode: 'desc' },
    });

    let sequence = 1;
    if (lastTransaction) {
      const lastSeqStr = lastTransaction.transactionCode.replace(prefix, '');
      sequence = parseInt(lastSeqStr, 10) + 1;
    }

    return `${prefix}${sequence.toString().padStart(4, '0')}`;
  }

  /**
   * Find all transactions
   */
  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    type?: 'IN' | 'OUT';
    startDate?: string;
    endDate?: string;
  }) {
    const { page = 1, limit = 10, search, type, startDate, endDate } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.TransactionWhereInput = {};
    
    if (search) {
      where.transactionCode = { contains: search, mode: 'insensitive' };
    }

    if (type) where.type = type;

    if (startDate && endDate) {
      where.transactionDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (startDate) {
      where.transactionDate = { gte: new Date(startDate) };
    } else if (endDate) {
      where.transactionDate = { lte: new Date(endDate) };
    }

    const [total, data] = await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        include: {
          createdBy: { select: { id: true, name: true } },
          items: {
            include: {
              product: { select: { sku: true, name: true } }
            }
          }
        },
        orderBy: { transactionDate: 'desc' },
      }),
    ]);

    return { total, data: data.map(tx => this.formatTransactionResponse(tx)) };
  }

  /**
   * Find transaction by ID
   */
  async findById(id: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true } },
        items: {
          include: {
            product: { select: { sku: true, name: true, unit: true } }
          }
        }
      },
    });

    if (!transaction) {
      throw new NotFoundError('Transaksi tidak ditemukan');
    }

    return this.formatTransactionResponse(transaction);
  }

  /**
   * Create a new transaction (IN or OUT)
   * Handles creating the transaction, items, updating inventory, and logging stock movements
   * all within a single database transaction.
   */
  async create(payload: CreateTransactionPayload, userId: string) {
    // --- PERBAIKAN: NORMALISASI DATA DARI MIDDLEWARE VALIDASI ---
    // Jika data dibungkus dalam properti 'body' oleh Zod, kita keluarkan isinya.
    const data = (payload as any).body ? (payload as any).body : payload;

    // Pastikan items ada sebelum diproses (mencegah error .map() undefined)
    if (!data.items || !Array.isArray(data.items)) {
      throw new BadRequestError('Daftar item produk (items) tidak valid atau kosong');
    }
    // -------------------------------------------------------------

    // Basic validation to check for duplicates in the items list
    const productIds = data.items.map((i: any) => i.productId);
    const uniqueProductIds = new Set(productIds);
    if (productIds.length !== uniqueProductIds.size) {
      throw new BadRequestError('Terdapat produk duplikat dalam daftar transaksi');
    }

    // Verify all products exist
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { inventory: true }
    });

    if (products.length !== productIds.length) {
      throw new NotFoundError('Satu atau lebih produk tidak ditemukan');
    }

    // Map products for quick access
    const productMap = new Map(products.map(p => [p.id, p]));

    // Validation for OUT transactions: ensure sufficient stock
    if (data.type === 'OUT') {
      for (const item of data.items) {
        const product = productMap.get(item.productId);
        const currentStock = product?.inventory?.currentStock ?? 0;
        
        if (currentStock < item.quantity) {
          throw new BadRequestError(
            `Stok tidak mencukupi untuk produk ${product?.name}. Sisa: ${currentStock}, Diminta: ${item.quantity}`
          );
        }
      }
    }

    // Calculate subtotal and total
    let totalAmount = 0;
    const itemsData = data.items.map((item: any) => {
      const subtotal = item.quantity * item.unitPrice;
      totalAmount += subtotal;
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal,
      };
    });

    // Generate transaction code
    const transactionCode = await this.generateTransactionCode(data.type);

    // Run everything in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Transaction header
      const transaction = await tx.transaction.create({
        data: {
          transactionCode,
          type: data.type,
          createdById: userId,
          notes: data.notes,
          totalAmount,
        }
      });

      // 2. Create Transaction Items
      await tx.transactionItem.createMany({
        data: itemsData.map((item: any) => ({
          ...item,
          transactionId: transaction.id,
        })),
      });

      // 3. Update Inventory & Create Stock Movements
      for (const item of data.items) {
        const product = productMap.get(item.productId)!;
        const currentStock = product.inventory?.currentStock ?? 0;
        
        const stockAfter = data.type === 'IN' 
          ? currentStock + item.quantity 
          : currentStock - item.quantity;

        // Create or update inventory
        if (product.inventory) {
          await tx.inventory.update({
            where: { productId: product.id },
            data: {
              currentStock: stockAfter,
              ...(data.type === 'IN' ? { lastRestockAt: new Date() } : {})
            }
          });
        } else {
          // Fallback if inventory record didn't exist for some reason
          await tx.inventory.create({
            data: {
              productId: product.id,
              currentStock: stockAfter,
              ...(data.type === 'IN' ? { lastRestockAt: new Date() } : {})
            }
          });
        }

        // Create stock movement
        await tx.stockMovement.create({
          data: {
            productId: product.id,
            transactionId: transaction.id,
            movementType: data.type,
            quantity: item.quantity,
            stockBefore: currentStock,
            stockAfter,
            createdById: userId,
          }
        });
      }

      return transaction;
    });

    return this.findById(result.id);
  }
}

export const transactionService = new TransactionService();