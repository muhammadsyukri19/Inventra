import type { Request, Response, NextFunction } from 'express';
import { userService } from './user.service';
import { sendSuccess } from '../../utils/response';
import { buildPaginationMeta } from '../../utils/pagination';
import { prisma } from '../../config/database';

export class UserController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string);
      const roleId = req.query.roleId as string;
      const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;

      const { total, data } = await userService.findAll({ page, limit, search, roleId, isActive });
      const meta = buildPaginationMeta(total, page, limit);

      sendSuccess(res, {
        data,
        meta,
        message: 'Berhasil mengambil data pengguna',
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.findById((req.params.id as string));
      sendSuccess(res, {
        data: user,
        message: 'Berhasil mengambil detail pengguna',
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.create(req.body);
      sendSuccess(res, {
        data: user,
        message: 'Pengguna berhasil ditambahkan',
        statusCode: 201,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.update((req.params.id as string), req.body);
      sendSuccess(res, {
        data: user,
        message: 'Data pengguna berhasil diupdate',
      });
    } catch (error) {
      next(error);
    }
  }

  async toggleActive(req: Request, res: Response, next: NextFunction) {
    try {
      const isActive = req.body.isActive;
      const user = await userService.toggleActive((req.params.id as string), isActive);
      sendSuccess(res, {
        data: user,
        message: `Pengguna berhasil di${isActive ? 'aktifkan' : 'nonaktifkan'}`,
      });
    } catch (error) {
      next(error);
    }
  }

  async getRoles(req: Request, res: Response, next: NextFunction) {
    try {
      const roles = await prisma.role.findMany({
        orderBy: { name: 'asc' },
      });
      sendSuccess(res, {
        data: roles,
        message: 'Berhasil mengambil data role',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
