import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/services/api-client'; // Sesuaikan path ini (tadi kamu pakai @/services/api-client)
import { useAuthStore } from '@/features/auth/stores/auth.store';
import type { Notification } from '../types/notification.types';

const NOTIFICATIONS_QUERY_KEY = ['notifications'];

export const useNotifications = () => {
  const queryClient = useQueryClient();
  const { accessToken } = useAuthStore();
  const [reconnectTrigger, setReconnectTrigger] = useState(0);

  // 1. Fetch data awal - DITAMBAHKAN PENGAMAN ARRAY
  const query = useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: async (): Promise<Notification[]> => {
      try {
        const response = await apiClient.get('/notifications');
        // Pastikan kita mengambil bagian array-nya saja
        const result = response.data?.data || response.data;
        return Array.isArray(result) ? result : [];
      } catch (error) {
        return []; // Jika gagal, kembalikan array kosong agar tidak crash
      }
    },
    enabled: !!accessToken,
  });

  // 2. Set up SSE (Real-time) - MEMAKAI TOKEN DI URL
  useEffect(() => {
    if (!accessToken) return;

    const baseURL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';
    // Penting: Token dikirim lewat URL karena EventSource tidak bisa kirim Header
    const eventSource = new EventSource(`${baseURL}/notifications/stream?token=${accessToken}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'NEW_NOTIFICATION') {
          queryClient.setQueryData<Notification[]>(NOTIFICATIONS_QUERY_KEY, (oldData) => {
            if (!oldData || !Array.isArray(oldData)) return [data.payload];
            return [data.payload, ...oldData];
          });
        }
      } catch (error) {
        console.error('Error parsing SSE message', error);
      }
    };

    eventSource.onerror = (error) => {
      // Kita sembunyikan error SSE agar tidak merusak konsol saat dev
      eventSource.close();
      
      // Coba konek ulang setelah 10 detik
      setTimeout(() => setReconnectTrigger(prev => prev + 1), 10000);
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
        if (!oldData || !Array.isArray(oldData)) return [];
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
        if (!oldData || !Array.isArray(oldData)) return [];
        return oldData.map((notif) => ({ ...notif, isRead: true }));
      });
    },
  });

  // --- PERBAIKAN LOGIKA UNREAD COUNT (BARIS 108) ---
  const notifications = Array.isArray(query.data) ? query.data : [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return {
    notifications,
    isLoading: query.isLoading,
    isError: query.isError,
    unreadCount,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
  };
};