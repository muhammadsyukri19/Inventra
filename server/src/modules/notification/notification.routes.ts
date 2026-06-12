import { Router } from 'express';
import { notificationController } from './notification.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

// Semua route ini harus login dulu
router.use(authMiddleware);

// Alamat: GET /api/v1/notifications
router.get('/', notificationController.getAll);

// Alamat: GET /api/v1/notifications/stream (Untuk menghilangkan error console)
router.get('/stream', notificationController.stream);

// Alamat: PATCH /api/v1/notifications/:id/read
router.patch('/:id/read', notificationController.markAsRead);

export default router;