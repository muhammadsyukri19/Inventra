import { Router } from 'express';
import { analyticsController } from './analytics.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

// Protect all analytics endpoints with authentication
router.use(authMiddleware);

// Get role-specific dashboard data
router.get('/dashboard-role', analyticsController.getDashboardRole);

export default router;
