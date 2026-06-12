import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

// Dashboard hanya boleh diakses user yang sudah login
router.use(authMiddleware);

router.get('/summary', dashboardController.getSummary);

export default router;