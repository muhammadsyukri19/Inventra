import bcrypt from 'bcryptjs';
import { prisma } from '../../config/database';
import { ConflictError, NotFoundError } from '../../utils/errors';
import type { CreateUserPayload, UpdateUserPayload, UserResponse } from './user.types';
import type { Prisma } from '@prisma/client';

export class UserService {
  /**
   * Helper to format user response without sensitive data
   */
  private formatUserResponse(user: any): UserResponse {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      status: user.status,
      role: {
        id: user.role.id,
        name: user.role.name,
      },
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Find all users
   */
  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    roleId?: string;
    status?: any;
  }) {
    const { page = 1, limit = 10, search, roleId, status } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (roleId) where.roleId = roleId;
    if (status) where.status = status;

    const [total, data] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: { role: true },
        orderBy: { name: 'asc' },
      }),
    ]);

    return { total, data: data.map(this.formatUserResponse) };
  }

  /**
   * Find user by ID
   */
  async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!user) {
      throw new NotFoundError('Pengguna tidak ditemukan');
    }

    return this.formatUserResponse(user);
  }

  /**
   * Create a new user
   */
  async create(data: CreateUserPayload) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new ConflictError('Email sudah digunakan');
    }

    const role = await prisma.role.findUnique({ where: { id: data.roleId } });
    if (!role) {
      throw new NotFoundError('Role tidak ditemukan');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        name: data.name,
        passwordHash,
        roleId: data.roleId,
        status: data.status ?? 'PENDING',
      },
      include: { role: true },
    });

    return this.formatUserResponse(user);
  }

  /**
   * Update an existing user
   */
  async update(id: string, data: UpdateUserPayload) {
    await this.findById(id);

    if (data.email) {
      const existing = await prisma.user.findFirst({
        where: { email: data.email, id: { not: id } },
      });

      if (existing) {
        throw new ConflictError('Email sudah digunakan oleh pengguna lain');
      }
    }

    if (data.roleId) {
      const role = await prisma.role.findUnique({ where: { id: data.roleId } });
      if (!role) {
        throw new NotFoundError('Role tidak ditemukan');
      }
    }

    const updateData: any = { ...data };

    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
      delete updateData.password;
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      include: { role: true },
    });

    return this.formatUserResponse(user);
  }

  /**
   * Update status
   */
  async updateStatus(id: string, status: any) {
    await this.findById(id);

    const user = await prisma.user.update({
      where: { id },
      data: { status },
      include: { role: true },
    });

    return this.formatUserResponse(user);
  }
}

export const userService = new UserService();
