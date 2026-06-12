import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Auth store (Zustand).
 *
 * Manages authentication state with persistent storage in localStorage.
 * Provides actions for setting, refreshing, and clearing auth state.
 */

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  username?: string;
  role: string; // 'admin' | 'staff_gudang' | 'owner'
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
}

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
} satisfies Omit<AuthState, 'setAuth' | 'setTokens' | 'clearAuth'>;

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initialState,

      setAuth: (user, accessToken, refreshToken) =>
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        }),

      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),

      clearAuth: () => set(initialState),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
