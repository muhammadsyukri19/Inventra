import type { Request, Response, NextFunction } from 'express';
import { inventoryService } from './inventory.service';
import { sendSuccess } from '../../utils/response';
import { buildPaginationMeta } from '../../utils/pagination';

export class InventoryController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string);

      const { total, data } = await inventoryService.findAll({ page, limit, search });
      const meta = buildPaginationMeta(total, page, limit);

      sendSuccess(res, {
        data,
        meta,
        message: 'Berhasil mengambil data inventori',
      });
    } catch (error) {
      next(error);
    }
  }

  async getByProductId(req: Request, res: Response, next: NextFunction) {
    try {
      const inventory = await inventoryService.findByProductId(req.params.productId as string);
      sendSuccess(res, {
        data: inventory,
        message: 'Berhasil mengambil detail inventori',
      });
    } catch (error) {
      next(error);
    }
  }

  async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const inventory = await inventoryService.updateSettings(req.params.productId as string, req.body);
      sendSuccess(res, {
        data: inventory,
        message: 'Pengaturan inventori berhasil diupdate',
      });
    } catch (error) {
      next(error);
    }
  }

  async adjustStock(req: Request, res: Response, next: NextFunction) {
    try {
      // req.user is guaranteed to exist because of authMiddleware
      const userId = req.user!.id; 
      const inventory = await inventoryService.adjustStock(req.params.productId as string, req.body, userId);
      sendSuccess(res, {
        data: inventory,
        message: 'Stok berhasil disesuaikan',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const inventoryController = new InventoryController();
