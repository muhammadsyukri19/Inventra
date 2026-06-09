import { Router } from 'express';
import { validate } from '../../middleware/validation.middleware';
import { authMiddleware } from '../../middleware/auth.middleware';
import { loginSchema, refreshTokenSchema } from './auth.schema';
import * as authController from './auth.controller';

/**
 * Auth routes.
 *
 * POST /auth/login     - Login user
 * POST /auth/refresh   - Refresh access token
 * POST /auth/logout    - Logout user (requires auth)
 * GET  /auth/me        - Get current user profile (requires auth)
 */

const router = Router();

router.post('/login', validate(loginSchema), authController.loginHandler);
router.post('/refresh', validate(refreshTokenSchema), authController.refreshHandler);
router.post('/logout', authMiddleware, authController.logoutHandler);
router.get('/me', authMiddleware, authController.meHandler);

export default router;
