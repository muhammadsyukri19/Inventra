/**
 * Auth module type definitions.
 */

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: {
    id: string;
    name: string;
  };
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
}
