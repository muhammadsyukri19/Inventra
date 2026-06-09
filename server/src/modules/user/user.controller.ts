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
      const status = req.query.status as string;

      const { total, data } = await userService.findAll({ page, limit, search, roleId, status });
      const meta = buildPaginationMeta(total, page, limit);

      sendSuccess(res, data, 200, meta);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.findById((req.params.id as string));
      sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.create(req.body);
      sendSuccess(res, user, 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.update((req.params.id as string), req.body);
      sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const status = req.body.status;
      const user = await userService.updateStatus((req.params.id as string), status);
      sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }

  async getRoles(req: Request, res: Response, next: NextFunction) {
    try {
      const roles = await prisma.role.findMany({
        orderBy: { name: 'asc' },
      });
      sendSuccess(res, roles);
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
