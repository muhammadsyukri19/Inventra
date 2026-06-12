'use client';

import { useState, useEffect } from 'react';
import { Typography } from '@/components/atoms/typography';
import { Button } from '@/components/atoms/button';
import { Card } from '@/components/atoms/card';
import { EmptyState } from '@/components/molecules/empty-state';
import { 
  Bell, 
  CheckCheck, 
  AlertCircle, 
  PackageSearch, 
  Clock,
  Trash2,
  Loader2
} from 'lucide-react';
import apiClient from '@/services/api-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { formatDate } from '@/utils/formatDate';

export default function NotificationsPage() {
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS);
      setNotifications(response.data.data || []);
    } catch (error) {
      console.error("Gagal memuat notifikasi:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await apiClient.patch(`${API_ENDPOINTS.NOTIFICATIONS}/${id}/read`);
      fetchNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6 animate-fade-in p-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Typography variant="h1" className="text-slate-900 font-bold">Notifikasi Sistem</Typography>
          <Typography variant="body" color="secondary">Pantau peringatan stok dan aktivitas sistem</Typography>
        </div>
        {notifications.length > 0 && (
          <Button variant="ghost" className="text-primary-600 font-bold flex gap-2">
            <CheckCheck className="w-5 h-5" /> Tandai Semua Terbaca
          </Button>
        )}
      </div>

      <Card padding="none" className="bg-white border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-primary-500 w-10 h-10 mb-4" />
            <Typography variant="body">Memuat pemberitahuan...</Typography>
          </div>
        ) : notifications.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {notifications.map((item) => (
              <div 
                key={item.id} 
                className={`p-5 flex items-start gap-4 transition-all hover:bg-slate-50 ${!item.isRead ? 'bg-primary-50/30' : ''}`}
              >
                <div className={`p-3 rounded-full flex-shrink-0 ${
                  item.type === 'STOCK_CRITICAL' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-yellow-600'
                }`}>
                  <AlertCircle className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <Typography variant="h4" className={`font-bold ${!item.isRead ? 'text-slate-900' : 'text-slate-600'}`}>
                      {item.title}
                    </Typography>
                    <div className="flex items-center gap-1 text-slate-400 text-xs">
                      <Clock className="w-3 h-3" />
                      {formatDate(item.createdAt)}
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm mt-1 leading-relaxed">
                    {item.message}
                  </p>
                  
                  {!item.isRead && (
                    <button 
                      onClick={() => markAsRead(item.id)}
                      className="mt-3 text-xs font-bold text-primary-600 hover:underline"
                    >
                      Tandai sudah dibaca
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-24">
            <EmptyState
              icon={<Bell className="h-16 w-16 text-slate-200" />}
              title="Kotak Masuk Kosong"
              description="Anda belum memiliki pemberitahuan baru saat ini."
            />
          </div>
        )}
      </Card>
    </div>
  );
}