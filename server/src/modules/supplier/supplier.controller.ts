import type { Request, Response, NextFunction } from 'express';
import { supplierService } from './supplier.service';
import { sendSuccess } from '../../utils/response';
import { buildPaginationMeta } from '../../utils/pagination';

export class SupplierController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string);
      const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;

      const { total, data } = await supplierService.findAll({ page, limit, search, isActive });
      const meta = buildPaginationMeta(total, page, limit);

      sendSuccess(res, {
        data,
        meta,
        message: 'Berhasil mengambil data supplier',
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const supplier = await supplierService.findById((req.params.id as string));
      sendSuccess(res, {
        data: supplier,
        message: 'Berhasil mengambil detail supplier',
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const supplier = await supplierService.create(req.body);
      sendSuccess(res, {
        data: supplier,
        message: 'Supplier berhasil dibuat',
        statusCode: 201,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const supplier = await supplierService.update((req.params.id as string), req.body);
      sendSuccess(res, {
        data: supplier,
        message: 'Supplier berhasil diupdate',
      });
    } catch (error) {
      next(error);
    }
  }

  async toggleActive(req: Request, res: Response, next: NextFunction) {
    try {
      const isActive = req.body.isActive;
      const supplier = await supplierService.toggleActive((req.params.id as string), isActive);
      sendSuccess(res, {
        data: supplier,
        message: `Supplier berhasil di${isActive ? 'aktifkan' : 'nonaktifkan'}`,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const supplierController = new SupplierController();
