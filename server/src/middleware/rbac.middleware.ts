import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';
import type { UserRole } from '../types/common.types';

/**
 * Role-Based Access Control (RBAC) middleware.
 *
 * Restricts route access to users with specified roles.
 * Must be used after authMiddleware to ensure req.user exists.
 *
 * @param allowedRoles - Array of roles permitted to access the route
 */
export function rbacMiddleware(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError('Authentication required'));
      return;
    }

    const userRole = req.user.role as UserRole;

    if (!allowedRoles.includes(userRole)) {
      next(
        new ForbiddenError(
          `Access denied. Required roles: ${allowedRoles.join(', ')}`
        )
      );
      return;
    }

    next();
  };
}
