import type { Request, Response, NextFunction } from 'express';
import { analyticsService } from './analytics.service';
import { sendSuccess } from '../../utils/response';

export class AnalyticsController {
  /**
   * Get analytics dashboard depending on the active user role
   */
  async getDashboardRole(req: Request, res: Response, next: NextFunction) {
    try {
      const userRole = req.user?.role;
      if (!userRole) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      // Check if a specific role was requested (Admin can inspect other dashboards if needed)
      // otherwise default to user's own role
      const targetRole = (req.query.role as string) || userRole;
      
      // If the user is not an admin, they cannot request a different role's dashboard
      if (userRole !== 'admin' && targetRole !== userRole) {
        res.status(403).json({ success: false, message: 'Forbidden' });
        return;
      }

      const data = await analyticsService.getDashboardData(targetRole);

      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Owner (BI & Predictive Analytics) dashboard data
   */
  async getOwnerDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getDashboardData('owner');
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Staff (Warehouse Operations & Stock Health) dashboard data
   */
  async getStaffDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getDashboardData('staff_gudang');
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Admin (Auditing & System Health) dashboard data
   */
  async getAdminDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getDashboardData('admin');
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }
}

export const analyticsController = new AnalyticsController();

