import { Request, Response, NextFunction } from 'express';
import { dashboardService } from './dashboard.service';
import { sendSuccess } from '../../utils/response';

export class DashboardController {
  async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await dashboardService.getSummary();
      sendSuccess(res, summary);
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();