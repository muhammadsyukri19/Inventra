import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import * as notificationController from './notification.controller';

const router = Router();

// Endpoint for SSE (Server-Sent Events) - must come before /:id to avoid route collision
// IMPORTANT: Use authMiddleware. We will pass token via query string if headers are not possible with standard EventSource
router.get('/stream', (req, res, next) => {
  // Simple custom auth extractor for SSE because EventSource in browser can't send Auth headers easily
  const token = req.query.token as string;
  if (token) {
    req.headers.authorization = `Bearer ${token}`;
  }
  next();
}, authMiddleware, notificationController.streamNotifications);

router.use(authMiddleware);

router.get('/', notificationController.getUserNotifications);
router.patch('/read-all', notificationController.markAllAsRead);
router.patch('/:id/read', notificationController.markAsRead);

export default router;
