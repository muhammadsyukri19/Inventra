import { prisma } from '../../config/database';
import { BadRequestError, NotFoundError } from '../../utils/errors';
import type { UpdateInventorySettingsPayload, AdjustStockPayload } from './inventory.types';
import type { Prisma } from '@prisma/client';

export class InventoryService {
  /**
   * Find all inventories with their products
   */
  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    stockStatus?: 'low' | 'out' | 'safe';
  }) {
    const { page = 1, limit = 10, search, stockStatus } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.InventoryWhereInput = {};
    
    if (search) {
      where.product = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
        ]
      };
    }

    if (stockStatus) {
      if (stockStatus === 'out') {
        where.currentStock = 0;
      } else if (stockStatus === 'low') {
        // Prisma cannot compare two columns directly in a where clause,
        // so we use $queryRaw to find product IDs where 0 < current_stock <= reorder_point
        const lowStockProductIds = await prisma.$queryRaw<{ product_id: string }[]>`
          SELECT "product_id" FROM "inventories"
          WHERE "current_stock" > 0 AND "current_stock" <= "reorder_point"
        `;
        where.productId = { in: lowStockProductIds.map(r => r.product_id) };
      } else if (stockStatus === 'safe') {
        // Safe stock means current_stock > reorder_point
        const safeProductIds = await prisma.$queryRaw<{ product_id: string }[]>`
          SELECT "product_id" FROM "inventories"
          WHERE "current_stock" > "reorder_point"
        `;
        where.productId = { in: safeProductIds.map(r => r.product_id) };
      }
    }

    const [total, data] = await Promise.all([
      prisma.inventory.count({ where }),
      prisma.inventory.findMany({
        where,
        skip,
        take: limit,
        include: {
          product: { select: { id: true, sku: true, name: true, unit: true, category: { select: { name: true } } } },
        },
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    return { total, data };
  }

  /**
   * Find inventory by product ID
   */
  async findByProductId(productId: string) {
    const inventory = await prisma.inventory.findUnique({
      where: { productId },
      include: {
        product: { select: { id: true, sku: true, name: true } },
      },
    });

    if (!inventory) {
      throw new NotFoundError('Data inventori tidak ditemukan untuk produk ini');
    }

    return inventory;
  }

  /**
   * Update inventory settings (min, max, lead time, ROP)
   */
  async updateSettings(productId: string, data: UpdateInventorySettingsPayload) {
    await this.findByProductId(productId);

    return prisma.inventory.update({
      where: { productId },
      data,
    });
  }

  /**
   * Manually adjust stock (creates a StockMovement)
   * This is separate from transaction-based stock movements.
   */
  async adjustStock(productId: string, data: AdjustStockPayload, userId: string) {
    const inventory = await this.findByProductId(productId);

    if (data.movementType === 'OUT' && inventory.currentStock < data.quantity) {
      throw new BadRequestError('Stok tidak mencukupi untuk dikeluarkan');
    }

    let stockAfter = inventory.currentStock;

    if (data.movementType === 'IN') {
      stockAfter += data.quantity;
    } else if (data.movementType === 'OUT') {
      stockAfter -= data.quantity;
    } else if (data.movementType === 'ADJUSTMENT') {
      // For ADJUSTMENT, quantity could be negative or positive depending on UI convention,
      // but usually we pass the literal difference. E.g. -5 means lost stock.
      stockAfter += data.quantity;
      if (stockAfter < 0) {
        throw new BadRequestError('Penyesuaian menyebabkan stok negatif');
      }
    }

    // Use transaction to ensure consistency
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update inventory
      const updatedInventory = await tx.inventory.update({
        where: { productId },
        data: {
          currentStock: stockAfter,
          ...(data.movementType === 'IN' ? { lastRestockAt: new Date() } : {}),
        },
      });

      // 2. Create stock movement record
      await tx.stockMovement.create({
        data: {
          productId,
          movementType: data.movementType,
          quantity: Math.abs(data.quantity),
          stockBefore: inventory.currentStock,
          stockAfter,
          reason: data.reason || 'Manual Adjustment',
          createdById: userId,
        },
      });

      return updatedInventory;
    });

    return result;
  }
}

export const inventoryService = new InventoryService();
