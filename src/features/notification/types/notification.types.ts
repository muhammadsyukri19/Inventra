export type NotificationType = 'STOCK_CRITICAL' | 'STOCK_EMPTY' | 'RESTOCK_RECOMMENDATION';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  referenceId?: string | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}
