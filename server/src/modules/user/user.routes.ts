import { Router } from 'express';
import { userController } from './user.controller';
import { validate } from '../../middleware/validation.middleware';
import { authMiddleware } from '../../middleware/auth.middleware';
import { rbacMiddleware } from '../../middleware/rbac.middleware';
import { createUserSchema, updateUserSchema, getUserSchema } from './user.schema';
import { z } from 'zod';

const router = Router();

const toggleActiveSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({ isActive: z.boolean() }),
});

// Protect all user routes - Only Admin can manage users
router.use(authMiddleware, rbacMiddleware('admin'));

router.get('/roles', userController.getRoles);

router.get('/', userController.getAll);
router.get('/:id', validate(getUserSchema), userController.getById);

router.post(
  '/',
  validate(createUserSchema),
  userController.create
);

router.put(
  '/:id',
  validate(updateUserSchema),
  userController.update
);

router.patch(
  '/:id/status',
  validate(toggleActiveSchema),
  userController.toggleActive
);

export default router;
