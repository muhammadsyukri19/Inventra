import { env } from './env';

/**
 * JWT configuration constants.
 *
 * Centralizes all JWT-related settings derived from environment variables.
 */
export const JWT_CONFIG = {
  ACCESS_SECRET: env.JWT_ACCESS_SECRET,
  REFRESH_SECRET: env.JWT_REFRESH_SECRET,
  ACCESS_EXPIRY: env.JWT_ACCESS_EXPIRY,
  REFRESH_EXPIRY: env.JWT_REFRESH_EXPIRY,
} as const;
