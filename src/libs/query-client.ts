import { QueryClient } from '@tanstack/react-query';

/**
 * TanStack Query client configuration.
 *
 * Centralized QueryClient with sensible defaults for the application.
 */

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (garbage collection)
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
