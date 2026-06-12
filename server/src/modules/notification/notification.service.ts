import { prisma } from '../../config/database';

export class NotificationService {
  async getAll(userId: string) {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(id: string) {
    return await prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
  }
}
export const notificationService = new NotificationService();