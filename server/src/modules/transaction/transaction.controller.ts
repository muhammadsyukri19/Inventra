import type { Request, Response, NextFunction } from 'express';
import { transactionService } from './transaction.service';
import { sendSuccess } from '../../utils/response';
import { buildPaginationMeta } from '../../utils/pagination';

export class TransactionController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string);
      const type = (req.query.type as 'IN' | 'OUT' | undefined);
      const startDate = (req.query.startDate as string);
      const endDate = (req.query.endDate as string);

      const { total, data } = await transactionService.findAll({ 
        page, limit, search, type, startDate, endDate 
      });
      
      const meta = buildPaginationMeta(total, page, limit);

      sendSuccess(res, {
        data,
        meta,
        message: 'Berhasil mengambil data transaksi',
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const transaction = await transactionService.findById((req.params.id as string));
      sendSuccess(res, {
        data: transaction,
        message: 'Berhasil mengambil detail transaksi',
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const transaction = await transactionService.create(req.body, userId);
      sendSuccess(res, {
        data: transaction,
        message: `Transaksi ${req.body.type} berhasil dibuat`,
        statusCode: 201,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const transactionController = new TransactionController();
