import { prisma } from '../../config/database';
import { ConflictError, NotFoundError } from '../../utils/errors';
import type { CreateCategoryPayload, UpdateCategoryPayload } from './category.types';
import type { Prisma } from '@prisma/client';

export class CategoryService {
  /**
   * Find all categories with optional pagination and search
   */
  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const { page = 1, limit = 10, search } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.CategoryWhereInput = search
      ? { name: { contains: search, mode: 'insensitive' } }
      : {};

    const [total, data] = await Promise.all([
      prisma.category.count({ where }),
      prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
    ]);

    return { total, data };
  }

  /**
   * Find category by ID
   */
  async findById(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundError('Kategori tidak ditemukan');
    }

    return category;
  }

  /**
   * Create a new category
   */
  async create(data: CreateCategoryPayload) {
    const existing = await prisma.category.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      throw new ConflictError('Kategori dengan nama tersebut sudah ada');
    }

    return prisma.category.create({ data });
  }

  /**
   * Update an existing category
   */
  async update(id: string, data: UpdateCategoryPayload) {
    await this.findById(id);

    if (data.name) {
      const existing = await prisma.category.findFirst({
        where: { name: data.name, id: { not: id } },
      });

      if (existing) {
        throw new ConflictError('Kategori dengan nama tersebut sudah ada');
      }
    }

    return prisma.category.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a category
   */
  async delete(id: string) {
    await this.findById(id);

    // Check if category has products
    const productCount = await prisma.product.count({
      where: { categoryId: id },
    });

    if (productCount > 0) {
      throw new ConflictError('Tidak dapat menghapus kategori yang masih memiliki produk');
    }

    await prisma.category.delete({
      where: { id },
    });
  }
}

export const categoryService = new CategoryService();
