import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/libs/api-client';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import type { Notification } from '../types/notification.types';

const NOTIFICATIONS_QUERY_KEY = ['notifications'];

export const useNotifications = () => {
  const queryClient = useQueryClient();
  const { accessToken } = useAuthStore();
  const [reconnectTrigger, setReconnectTrigger] = useState(0);

  // 1. Fetch initial notifications
  const query = useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: async (): Promise<Notification[]> => {
      const response = await apiClient.get('/notifications');
      return response.data.data;
    },
    enabled: !!accessToken,
  });

  // 2. Set up SSE for real-time updates
  useEffect(() => {
    if (!accessToken) return;

    const baseURL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';
    const eventSource = new EventSource(`${baseURL}/notifications/stream?token=${accessToken}`, {
      withCredentials: true,
    });

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'NEW_NOTIFICATION') {
          // Add new notification to cache
          queryClient.setQueryData<Notification[]>(NOTIFICATIONS_QUERY_KEY, (oldData) => {
            if (!oldData) return [data.payload];
            return [data.payload, ...oldData];
          });
        }
      } catch (error) {
        console.error('Error parsing SSE message', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE Error:', error);
      eventSource.close();

      const currentToken = useAuthStore.getState().accessToken;

      // Trigger automatic token validation and refresh via interceptor
      apiClient.get('/notifications')
        .then(() => {
          // Reconnect only if token didn't change (transient error, not 401 expiration)
          if (useAuthStore.getState().accessToken === currentToken) {
            setTimeout(() => {
              setReconnectTrigger(prev => prev + 1);
            }, 5000);
          }
        })
        .catch((err) => {
          console.error('Failed to reconnect notification stream:', err);
        });
    };

    return () => {
      eventSource.close();
    };
  }, [accessToken, queryClient, reconnectTrigger]);

  // 3. Mark single as read
  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.patch(`/notifications/${id}/read`);
      return response.data.data as Notification;
    },
    onSuccess: (updatedNotification) => {
      queryClient.setQueryData<Notification[]>(NOTIFICATIONS_QUERY_KEY, (oldData) => {
        if (!oldData) return [];
        return oldData.map((notif) =>
          notif.id === updatedNotification.id ? { ...notif, isRead: true } : notif
        );
      });
    },
  });

  // 4. Mark all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.patch(`/notifications/read-all`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.setQueryData<Notification[]>(NOTIFICATIONS_QUERY_KEY, (oldData) => {
        if (!oldData) return [];
        return oldData.map((notif) => ({ ...notif, isRead: true }));
      });
    },
  });

  return {
    notifications: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    unreadCount: (query.data ?? []).filter((n) => !n.isRead).length,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
  };
};
