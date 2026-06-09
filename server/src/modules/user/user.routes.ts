import { Router } from 'express';
import { userController } from './user.controller';
import { validate } from '../../middleware/validation.middleware';
import { authMiddleware } from '../../middleware/auth.middleware';
import { rbacMiddleware } from '../../middleware/rbac.middleware';
import { createUserSchema, updateUserSchema, getUserSchema } from './user.schema';
import { z } from 'zod';

const router = Router();

const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'ACTIVE', 'REJECTED', 'INACTIVE'])
});

// Public routes
router.get('/roles', userController.getRoles);

// Protect all user routes - Only Admin can manage users
router.use(authMiddleware, rbacMiddleware('admin'));

router.get('/', userController.getAll);
router.get('/:id', validate(getUserSchema, 'params'), userController.getById);

router.post(
  '/',
  validate(createUserSchema),
  userController.create
);

router.put(
  '/:id',
  validate(getUserSchema, 'params'),
  validate(updateUserSchema, 'body'),
  userController.update
);

router.patch(
  '/:id/status',
  validate(getUserSchema, 'params'),
  validate(updateStatusSchema, 'body'),
  userController.updateStatus
);

export default router;
