import { prisma } from '../../config/database';
import { NotFoundError } from '../../utils/errors';
import type { CreateSupplierPayload, UpdateSupplierPayload } from './supplier.types';
import type { Prisma } from '@prisma/client';

export class SupplierService {
  /**
   * Find all suppliers
   */
  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }) {
    const { page = 1, limit = 10, search, isActive } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.SupplierWhereInput = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { contactPerson: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [total, data] = await Promise.all([
      prisma.supplier.count({ where }),
      prisma.supplier.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
    ]);

    return { total, data };
  }

  /**
   * Find supplier by ID
   */
  async findById(id: string) {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
    });

    if (!supplier) {
      throw new NotFoundError('Supplier tidak ditemukan');
    }

    return supplier;
  }

  /**
   * Create a new supplier
   */
  async create(data: CreateSupplierPayload) {
    return prisma.supplier.create({ data });
  }

  /**
   * Update an existing supplier
   */
  async update(id: string, data: UpdateSupplierPayload) {
    await this.findById(id);

    return prisma.supplier.update({
      where: { id },
      data,
    });
  }

  /**
   * Soft delete / Toggle active status
   * Kita sebaiknya tidak menghapus supplier secara permanen karena terikat dengan produk
   */
  async toggleActive(id: string, isActive: boolean) {
    await this.findById(id);

    return prisma.supplier.update({
      where: { id },
      data: { isActive },
    });
  }
}

export const supplierService = new SupplierService();
