import type { Request, Response, NextFunction } from 'express';
import { categoryService } from './category.service';
import { sendSuccess } from '../../utils/response';
import { buildPaginationMeta } from '../../utils/pagination';

export class CategoryController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string);

      const { total, data } = await categoryService.findAll({ page, limit, search });
      const meta = buildPaginationMeta(total, page, limit);

      sendSuccess(res, {
        data,
        meta,
        message: 'Berhasil mengambil data kategori',
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await categoryService.findById((req.params.id as string));
      sendSuccess(res, {
        data: category,
        message: 'Berhasil mengambil detail kategori',
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await categoryService.create(req.body);
      sendSuccess(res, {
        data: category,
        message: 'Kategori berhasil dibuat',
        statusCode: 201,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await categoryService.update((req.params.id as string), req.body);
      sendSuccess(res, {
        data: category,
        message: 'Kategori berhasil diupdate',
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await categoryService.delete((req.params.id as string));
      sendSuccess(res, {
        data: null,
        message: 'Kategori berhasil dihapus',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const categoryController = new CategoryController();
