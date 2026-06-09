'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../stores/auth.store';
import * as authService from '../services/auth.service';
import { ROUTES } from '@/constants/routes';

/**
 * Auth hooks.
 *
 * Provides React Query hooks for authentication operations.
 * Integrates with Zustand auth store for state management.
 */

const AUTH_QUERY_KEYS = {
  me: ['auth', 'me'] as const,
};

/**
 * Hook for login mutation.
 */
export function useLogin() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: authService.loginUser,
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      router.push(ROUTES.DASHBOARD);
    },
  });
}

/**
 * Hook for register mutation.
 */
export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: authService.registerUser,
    onSuccess: () => {
      router.push(ROUTES.LOGIN);
    },
  });
}

/**
 * Hook for logout mutation.
 */
export function useLogout() {
  const router = useRouter();
  const { clearAuth } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.logoutUser,
    onSettled: () => {
      clearAuth();
      queryClient.clear();
      router.push(ROUTES.LOGIN);
    },
  });
}

/**
 * Hook for fetching current user profile.
 */
export function useCurrentUser() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: AUTH_QUERY_KEYS.me,
    queryFn: authService.getCurrentUser,
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
