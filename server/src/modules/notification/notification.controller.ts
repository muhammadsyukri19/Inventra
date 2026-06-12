import { Request, Response, NextFunction } from 'express';
import { notificationService } from './notification.service';
import { sendSuccess } from '../../utils/response';

/**
 * Endpoint to subscribe to real-time Server-Sent Events
 */
export const streamNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    // Important for CORS if needed, though usually handled by cors middleware
    // res.setHeader('Access-Control-Allow-Origin', '*'); 

    // Send an immediate flush to establish the connection
    res.flushHeaders();

    // Register this client in the service
    notificationService.addClient(userId, res);

    // Keep the connection alive by sending a comment ping every 30 seconds
    const intervalId = setInterval(() => {
      res.write(': keepalive\n\n');
    }, 30000);

    // Cleanup on client disconnect
    req.on('close', () => {
      clearInterval(intervalId);
      notificationService.removeClient(userId);
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all notifications for the current user
 */
export const getUserNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const notifications = await notificationService.getUserNotifications(userId);
    
    sendSuccess(res, notifications);
  } catch (error) {
    next(error);
  }
};

/**
 * Mark a single notification as read
 */
export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;
    
    const notification = await notificationService.markAsRead(id, userId);
    
    sendSuccess(res, notification);
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    
    await notificationService.markAllAsRead(userId);
    
    sendSuccess(res, null);
  } catch (error) {
    next(error);
  }
};

