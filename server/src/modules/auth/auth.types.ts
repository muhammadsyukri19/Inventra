/**
 * Auth module type definitions.
 */

export interface RegisterInput {
  name: string;
  email: string;
  username: string;
  password: string;
  roleId: string;
}

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
  status: string;
  lastLoginAt: Date | null;
  createdAt: Date;
}
