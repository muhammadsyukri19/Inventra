import { Request, Response, NextFunction } from 'express';
import { notificationService } from './notification.service';
import { sendSuccess } from '../../utils/response';

export class NotificationController {
  // Mengambil semua notifikasi milik user yang sedang login
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const notifications = await notificationService.getAll(userId);
      
      // PERBAIKAN: Langsung kirim array 'notifications'
      // sendSuccess akan membungkusnya menjadi { success: true, data: [notifications] }
      sendSuccess(res, notifications); 
      
    } catch (error) {
      next(error);
    }
  }

  // Menandai satu notifikasi sebagai "Sudah Dibaca"
  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await notificationService.markAsRead(id as string);
      
      sendSuccess(res, {
        message: 'Notifikasi ditandai sebagai terbaca'
      });
    } catch (error) {
      next(error);
    }
  }

  // Endpoint kosong untuk stream (agar error SSE di konsol hilang)
  async stream(req: Request, res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    
    // Kirim data awal kosong
    res.write('data: {"connected": true}\n\n');

    // Jaga koneksi tetap terbuka (SSE sederhana)
    const keepAlive = setInterval(() => {
      res.write(': keep-alive\n\n');
    }, 30000);

    req.on('close', () => clearInterval(keepAlive));
  }
}

export const notificationController = new NotificationController();