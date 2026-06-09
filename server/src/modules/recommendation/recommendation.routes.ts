import { Router } from 'express';
import { RecommendationController } from './recommendation.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { rbacMiddleware } from '../../middleware/rbac.middleware';

const router = Router();
const controller = new RecommendationController();

// Harus login untuk akses rekomendasi
router.use(authMiddleware);

// Ambil list rekomendasi
router.get('/', controller.getPendingRecommendations);

// Trigger kalkulasi (Hanya Admin yang bisa trigger manual)
router.post('/trigger', rbacMiddleware('admin'), controller.triggerPrediction);

export default router;
