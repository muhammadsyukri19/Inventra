import { useState, useRef, useEffect } from 'react';
import { Bell, Check, Package, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/atoms/button';
import { Typography } from '@/components/atoms/typography';
import { useNotifications } from '@/features/notification/hooks/useNotifications';
import { cn } from '@/utils/cn';
import type { Notification } from '@/features/notification/types/notification.types';

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const getIcon = (type: string) => {
    switch (type) {
      case 'STOCK_CRITICAL':
        return <AlertTriangle className="h-5 w-5 text-danger-500" />;
      case 'STOCK_EMPTY':
        return <AlertTriangle className="h-5 w-5 text-danger-600" />;
      case 'RESTOCK_RECOMMENDATION':
        return <Package className="h-5 w-5 text-primary-500" />;
      default:
        return <Info className="h-5 w-5 text-info-500" />;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    // Future: Add routing based on notification.referenceId
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        aria-label="Notifikasi"
        onClick={toggleDropdown}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-surface">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 origin-top-right rounded-lg border border-border-default bg-surface shadow-lg ring-1 ring-black/5 focus:outline-none z-50 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between border-b border-border-default px-4 py-3">
            <Typography variant="body" weight="semibold">
              Notifikasi
            </Typography>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-1 text-xs text-primary-600 hover:text-primary-700"
                onClick={() => markAllAsRead()}
              >
                <Check className="mr-1 h-3 w-3" />
                Tandai semua dibaca
              </Button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="mb-2 h-8 w-8 text-text-tertiary opacity-20" />
                <Typography variant="body-sm" color="tertiary">
                  Belum ada notifikasi baru
                </Typography>
              </div>
            ) : (
              <ul className="divide-y divide-border-default">
                {notifications.map((notif) => (
                  <li
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={cn(
                      "flex cursor-pointer gap-3 p-4 transition-colors hover:bg-surface-hover",
                      !notif.isRead ? "bg-primary-50/50 dark:bg-primary-900/10" : ""
                    )}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <Typography
                        variant="body-sm"
                        weight={!notif.isRead ? 'semibold' : 'medium'}
                        className={!notif.isRead ? 'text-text-primary' : 'text-text-secondary'}
                      >
                        {notif.title}
                      </Typography>
                      <Typography variant="body-sm" color="tertiary" className="line-clamp-2">
                        {notif.message}
                      </Typography>
                      <Typography variant="caption" color="tertiary" className="block pt-1 text-[10px]">
                        {new Date(notif.createdAt).toLocaleString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Typography>
                    </div>
                    {!notif.isRead && (
                      <div className="flex-shrink-0 pt-2">
                        <div className="h-2 w-2 rounded-full bg-primary-500" />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="border-t border-border-default p-2">
            <Button variant="ghost" className="w-full justify-center text-sm" onClick={() => setIsOpen(false)}>
              Tutup
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
