import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/services/api-client'; // Pastikan path ini benar sesuai file sebelumnya
import { useAuthStore } from '@/features/auth/stores/auth.store';
import type { Notification } from '../types/notification.types';

const NOTIFICATIONS_QUERY_KEY = ['notifications'];

export const useNotifications = () => {
  const queryClient = useQueryClient();
  const { accessToken } = useAuthStore();
  const [reconnectTrigger, setReconnectTrigger] = useState(0);

  // 1. Fetch data awal dengan pengaman yang lebih kuat
  const query = useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: async (): Promise<Notification[]> => {
      try {
        const response = await apiClient.get('/notifications');
        
        // PENTING: Menyesuaikan dengan helper sendSuccess (response.data.data)
        const result = response.data?.data || response.data;
        
        const actualArray = Array.isArray(result) ? result : [];
        console.log("HOOK: Notifikasi Berhasil Ditarik", actualArray.length, "pesan");
        return actualArray;
      } catch (error) {
        console.error("HOOK: Gagal tarik notifikasi", error);
        return [];
      }
    },
    enabled: true,
    refetchInterval: 30000, // Cek ulang setiap 30 detik (backup jika SSE putus)
  });

  // 2. Set up SSE (Real-time) dengan token di URL
  useEffect(() => {
    if (!accessToken) return;

    const baseURL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';
    const eventSource = new EventSource(`${baseURL}/notifications/stream?token=${accessToken}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("SSE: Pesan baru diterima", data);

        if (data.type === 'NEW_NOTIFICATION' || data.id) {
          // Masukkan data baru ke cache React Query agar UI otomatis update
          queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
        }
      } catch (error) {
        // Abaikan jika data bukan JSON valid
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      // Auto-reconnect setelah 15 detik jika gagal
      setTimeout(() => setReconnectTrigger(prev => prev + 1), 15000);
    };

    return () => eventSource.close();
  }, [accessToken, queryClient, reconnectTrigger]);

  // 3. Mark as read - Update local cache agar instan (Optimistic Update)
  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.patch(`/notifications/${id}/read`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData<Notification[]>(NOTIFICATIONS_QUERY_KEY, (oldData) => {
        if (!oldData) return [];
        return oldData.map((notif) =>
          notif.id === id ? { ...notif, isRead: true } : notif
        );
      });
    },
  });

  // 4. Mark all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await apiClient.patch(`/notifications/read-all`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
  });

  // --- LOGIKA DATA PENGAMAN ---
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