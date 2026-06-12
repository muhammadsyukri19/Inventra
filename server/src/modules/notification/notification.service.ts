import { Notification, NotificationType } from '@prisma/client';
import { prisma } from '../../config/database';
import { Response } from 'express';

export interface CreateNotificationDTO {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  referenceId?: string;
}

// Store active SSE connections
interface ClientConnection {
  userId: string;
  response: Response;
}

class NotificationService {
  private clients: ClientConnection[] = [];

  /**
   * Adds a new client connection for SSE
   */
  public addClient(userId: string, response: Response): void {
    // Remove existing connections for the same user if any (optional, depends on multi-device strategy)
    this.clients = this.clients.filter(client => client.userId !== userId);
    this.clients.push({ userId, response });

    // Send an initial ping so the client knows it's connected
    response.write(`data: ${JSON.stringify({ type: 'PING', message: 'Connected to notification stream' })}\n\n`);

    // Handle client disconnect
    response.on('close', () => {
      this.removeClient(userId);
    });
  }

  /**
   * Removes a client connection
   */
  public removeClient(userId: string): void {
    this.clients = this.clients.filter(client => client.userId !== userId);
  }

  /**
   * Sends a real-time event to a specific user
   */
  private sendEventToUser(userId: string, data: any): void {
    const client = this.clients.find(c => c.userId === userId);
    if (client) {
      client.response.write(`data: ${JSON.stringify(data)}\n\n`);
    }
  }

  /**
   * Sends a real-time event to all connected users
   */
  public sendEventToAll(data: any): void {
    this.clients.forEach(client => {
      client.response.write(`data: ${JSON.stringify(data)}\n\n`);
    });
  }

  /**
   * Retrieves notifications for a user
   */
  public async getUserNotifications(userId: string): Promise<Notification[]> {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to recent 50
    });
  }

  /**
   * Creates a new notification and pushes to the client via SSE
   */
  public async createNotification(data: CreateNotificationDTO): Promise<Notification> {
    const notification = await prisma.notification.create({
      data,
    });

    // Push the notification to the specific user via SSE
    this.sendEventToUser(data.userId, {
      type: 'NEW_NOTIFICATION',
      payload: notification,
    });

    return notification;
  }

  /**
   * Marks a single notification as read
   */
  public async markAsRead(notificationId: string, userId: string): Promise<Notification> {
    return prisma.notification.update({
      where: {
        id: notificationId,
        userId: userId, // Ensure user owns the notification
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * Marks all notifications as read for a user
   */
  public async markAllAsRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }
}

export const notificationService = new NotificationService();
