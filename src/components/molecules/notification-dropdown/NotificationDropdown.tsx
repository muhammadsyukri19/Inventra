'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Check, Package, AlertTriangle, Info, Loader2 } from 'lucide-react';
import { Button } from '@/components/atoms/button';
import { Typography } from '@/components/atoms/typography';
import { useNotifications } from '@/features/notification/hooks/useNotifications';
import { cn } from '@/utils/cn';

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Ambil data dari hook
  const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } = useNotifications();

  // Menutup dropdown saat klik di luar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'STOCK_CRITICAL':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'STOCK_EMPTY':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'RESTOCK_RECOMMENDATION':
        return <Package className="h-5 w-5 text-indigo-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* TOMBOL LONCENG */}
      <Button
        variant="ghost"
        size="icon"
        className="relative hover:bg-slate-100 rounded-full transition-all"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-6 w-6 text-slate-600" />
        
        {/* BADGE MERAH */}
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4.5 min-w-[18px] px-1 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white animate-in zoom-in">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {/* ISI DROPDOWN */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 origin-top-right rounded-2xl border border-slate-100 bg-white shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between border-b border-slate-50 px-5 py-4 bg-slate-50/50">
            <Typography variant="body" className="font-bold text-slate-800">
              Notifikasi
            </Typography>
            {unreadCount > 0 && (
              <button
                className="text-[11px] font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                onClick={() => markAllAsRead()}
              >
                <Check className="h-3 w-3" /> Tandai semua dibaca
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-50">
            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                <p className="text-xs">Memuat pesan...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="mb-3 h-10 w-10 text-slate-200" />
                <Typography variant="body-sm" color="secondary">
                  Belum ada notifikasi baru
                </Typography>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    markAsRead(notif.id);
                    // setIsOpen(false); // Opsional: tutup setelah klik
                  }}
                  className={cn(
                    "flex cursor-pointer gap-3 p-4 transition-all hover:bg-slate-50",
                    !notif.isRead ? "bg-blue-50/40" : ""
                  )}
                >
                  <div className="mt-1 flex-shrink-0">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm leading-tight mb-1",
                      !notif.isRead ? "font-bold text-slate-900" : "font-medium text-slate-600"
                    )}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-2 block uppercase tracking-tight">
                      {new Date(notif.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.createdAt).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  {!notif.isRead && (
                    <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>
          
          <a 
            href="/notifications" 
            className="block py-3 text-center text-xs font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 transition-colors border-t border-slate-100"
            onClick={() => setIsOpen(false)}
          >
            Lihat Semua Riwayat
          </a>
        </div>
      )}
    </div>
  );
}