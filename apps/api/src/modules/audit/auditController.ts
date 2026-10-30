import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../services/db';
import { UserRole } from '@regulaflow/shared';

export class AuditController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { action, entityType, entityId, page = '1', limit = '20' } = req.query;

      const pageNum = Math.max(1, parseInt(page as string, 10));
      const take = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
      const skip = (pageNum - 1) * take;

      const where: any = {};
      if (action) where.action = String(action);
      if (entityType) where.entityType = String(entityType);
      if (entityId) where.entityId = String(entityId);

      // Scoping: Institution users only see events they created or for their apps
      if (user.role === UserRole.INSTITUTION_USER) {
        where.actorId = user.id;
      }

      const [events, total] = await Promise.all([
        prisma.auditEvent.findMany({
          where,
          include: {
            user: { select: { fullName: true, email: true, role: true } },
          },
          orderBy: { timestamp: 'desc' },
          skip,
          take,
        }),
        prisma.auditEvent.count({ where }),
      ]);

      return res.json({
        success: true,
        data: {
          events,
          pagination: {
            total,
            page: pageNum,
            limit: take,
            totalPages: Math.ceil(total / take),
          },
        },
      });
    } catch (err) {
      next(err);
    }
  }
}

