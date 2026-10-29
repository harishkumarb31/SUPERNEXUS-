import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../services/db';
import { AppError } from '../../middleware/errorHandler';

export class NotificationController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { unreadOnly } = req.query;

      const where: any = {
        OR: [{ userId: user.id }],
      };

      if (user.institutionId) {
        where.OR.push({ institutionId: user.institutionId });
      }

      if (unreadOnly === 'true') {
        where.read = false;
      }

      const [notifications, unreadCount] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: 50,
        }),
        prisma.notification.count({
          where: { ...where, read: false },
        }),
      ]);

      return res.json({
        success: true,
        data: {
          notifications,
          unreadCount,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const updated = await prisma.notification.update({
        where: { id },
        data: { read: true },
      });

      return res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  static async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;

      const where: any = {
        OR: [{ userId: user.id }],
      };

      if (user.institutionId) {
        where.OR.push({ institutionId: user.institutionId });
      }

      await prisma.notification.updateMany({
        where,
        data: { read: true },
      });

      return res.json({ success: true, message: 'All notifications marked as read' });
    } catch (err) {
      next(err);
    }
  }

  static async listEscalations(req: Request, res: Response, next: NextFunction) {
    try {
      const escalations = await prisma.escalationEvent.findMany({
        orderBy: { createdAt: 'desc' },
      });

      return res.json({ success: true, data: escalations });
    } catch (err) {
      next(err);
    }
  }
}
