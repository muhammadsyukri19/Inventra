import { Router } from 'express';
import { analyticsController } from './analytics.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { rbacMiddleware } from '../../middleware/rbac.middleware';

const router = Router();

// Protect all analytics endpoints with authentication
router.use(authMiddleware);

// Get role-specific dashboard data (endpoints slices)
router.get('/dashboard/owner', rbacMiddleware('owner', 'admin'), analyticsController.getOwnerDashboard);
router.get('/dashboard/staff', rbacMiddleware('staff_gudang', 'admin'), analyticsController.getStaffDashboard);
router.get('/dashboard/admin', rbacMiddleware('admin'), analyticsController.getAdminDashboard);

// Get role-specific dashboard data (legacy compatibility)
router.get('/dashboard-role', analyticsController.getDashboardRole);

export default router;

