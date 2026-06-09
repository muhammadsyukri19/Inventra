/**
 * Express type augmentation.
 *
 * Extends the Express Request interface with custom properties
 * injected by auth middleware.
 */

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
