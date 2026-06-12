import { Request, Response, NextFunction } from 'express';
import { dashboardService } from './dashboard.service';
import { sendSuccess } from '../../utils/response';

export class DashboardController {
  async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      // 1. Memanggil service yang sekarang sudah berisi angka ringkasan + chartData
      const summary = await dashboardService.getSummary();
      
      // 2. Mengirimkan semuanya ke Frontend
      // Helper sendSuccess akan membungkusnya menjadi { success: true, data: summary }
      sendSuccess(res, summary);
    } catch (error) {
      // Jika ada error (database mati dll), lempar ke middleware error handler
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();