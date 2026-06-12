import { prisma } from '../../config/database';
import { ConflictError, NotFoundError } from '../../utils/errors';
import type { CreateProductPayload, UpdateProductPayload, ProductResponse } from './product.types';
import type { Prisma } from '@prisma/client';

export class ProductService {
  /**
   * Helper to format product response, converting Decimal to number
   */
  private formatProductResponse(product: ProductResponse & { price: unknown; costPrice: unknown }): ProductResponse {
    return {
      ...product,
      price: Number(product.price),
      costPrice: Number(product.costPrice),
    };
  }

  /**
   * Find all products
   */
  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    supplierId?: string;
    isActive?: boolean;
    stockStatus?: 'low' | 'out' | 'safe';
  }) {
    const { page = 1, limit = 10, search, categoryId, supplierId, isActive, stockStatus } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};
    
    if (search) {
      where.OR = [
        { sku: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) where.categoryId = categoryId;
    if (supplierId) where.supplierId = supplierId;
    if (isActive !== undefined) where.isActive = isActive;

    if (stockStatus) {
      if (stockStatus === 'out') {
        where.inventory = { currentStock: 0 };
      } else if (stockStatus === 'low') {
        const lowStockIds = await prisma.$queryRaw<{ product_id: string }[]>`
          SELECT product_id FROM inventories
          WHERE current_stock > 0 AND current_stock <= reorder_point
        `;
        where.id = { in: lowStockIds.map((r) => r.product_id) };
      } else if (stockStatus === 'safe') {
        const safeIds = await prisma.$queryRaw<{ product_id: string }[]>`
          SELECT product_id FROM inventories
          WHERE current_stock > reorder_point
        `;
        where.id = { in: safeIds.map((r) => r.product_id) };
      }
    }

    const [total, data] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: { select: { id: true, name: true } },
          supplier: { select: { id: true, name: true } },
          inventory: {
            select: {
              currentStock: true,
              minStock: true,
              maxStock: true,
              reorderPoint: true,
              safetyStock: true,
            }
          }
        },
        orderBy: { name: 'asc' },
      }),
    ]);

    return { total, data: data.map(this.formatProductResponse) };
  }

  /**
   * Find product by ID
   */
  async findById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true } },
        inventory: true,
      },
    });

    if (!product) {
      throw new NotFoundError('Produk tidak ditemukan');
    }

    return this.formatProductResponse(product);
  }

  /**
   * Find product by SKU (Used for Scanner Validation)
   */
  async findBySku(sku: string) {
    const product = await prisma.product.findUnique({
      where: { sku },
      include: {
        category: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true } },
        inventory: {
          select: {
            currentStock: true,
            minStock: true,
            maxStock: true,
            reorderPoint: true,
            safetyStock: true,
          }
        },
      },
    });

    if (!product) {
      throw new NotFoundError(`Produk dengan SKU "${sku}" tidak ditemukan`);
    }

    return this.formatProductResponse(product);
  }

  /**
   * Create a new product and its initial inventory record
   */
  async create(data: CreateProductPayload) {
    const existing = await prisma.product.findUnique({
      where: { sku: data.sku },
    });

    if (existing) {
      throw new ConflictError('SKU sudah digunakan');
    }

    // Verify category exists
    const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
    if (!category) throw new NotFoundError('Kategori tidak ditemukan');

    // Verify supplier if provided
    if (data.supplierId) {
      const supplier = await prisma.supplier.findUnique({ where: { id: data.supplierId } });
      if (!supplier) throw new NotFoundError('Supplier tidak ditemukan');
    }

    // Extract inventory settings
    const { minStock, maxStock, leadTimeDays, ...productData } = data;

    // Use transaction to create product and inventory together
    const result = await prisma.$transaction(async (tx: any) => {
      const product = await tx.product.create({
        data: productData,
      });

      // Calculate initial safety stock (simplified: just max - min, normally involves std dev of demand)
      const safetyStock = maxStock > minStock ? Math.floor((maxStock - minStock) * 0.2) : 0;
      
      // ROP = (Avg Daily Sales * Lead Time) + Safety Stock. Since brand new, Avg Daily Sales = 0.
      const reorderPoint = safetyStock;

      const inventory = await tx.inventory.create({
        data: {
          productId: product.id,
          currentStock: 0,
          minStock,
          maxStock,
          leadTimeDays,
          safetyStock,
          reorderPoint,
        }
      });

      return { product, inventory };
    });

    return this.findById(result.product.id);
  }

  /**
   * Update an existing product
   */
  async update(id: string, data: UpdateProductPayload) {
    await this.findById(id);

    if (data.sku) {
      const existing = await prisma.product.findFirst({
        where: { sku: data.sku, id: { not: id } },
      });

      if (existing) {
        throw new ConflictError('SKU sudah digunakan oleh produk lain');
      }
    }

    if (data.categoryId) {
      const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
      if (!category) throw new NotFoundError('Kategori tidak ditemukan');
    }

    if (data.supplierId) {
      const supplier = await prisma.supplier.findUnique({ where: { id: data.supplierId } });
      if (!supplier) throw new NotFoundError('Supplier tidak ditemukan');
    }

    await prisma.product.update({
      where: { id },
      data,
    });

    return this.findById(id);
  }

  /**
   * Toggle active status
   */
  async toggleActive(id: string, isActive: boolean) {
    await this.findById(id);

    await prisma.product.update({
      where: { id },
      data: { isActive },
    });

    return this.findById(id);
  }
}

export const productService = new ProductService();
