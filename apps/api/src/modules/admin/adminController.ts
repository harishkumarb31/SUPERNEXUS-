import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../services/db';

export class AdminController {
  static async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await prisma.user.findMany({
        include: { institution: { select: { name: true, code: true, region: true } } },
        orderBy: { createdAt: 'desc' },
      });

      return res.json({
        success: true,
        data: users.map((u) => ({
          id: u.id,
          email: u.email,
          fullName: u.fullName,
          role: u.role,
          phone: u.phone,
          region: u.region,
          institutionId: u.institutionId,
          institutionName: u.institution?.name,
          active: u.active,
          createdAt: u.createdAt,
        })),
      });
    } catch (err) {
      next(err);
    }
  }

  static async listInstitutions(req: Request, res: Response, next: NextFunction) {
    try {
      const institutions = await prisma.institution.findMany({
        include: {
          _count: {
            select: { applications: true, complianceItems: true, users: true },
          },
        },
        orderBy: { name: 'asc' },
      });

      return res.json({ success: true, data: institutions });
    } catch (err) {
      next(err);
    }
  }

  static async getSystemHealth(req: Request, res: Response, next: NextFunction) {
    try {
      const [appCount, userCount, instCount, auditCount] = await Promise.all([
        prisma.application.count(),
        prisma.user.count(),
        prisma.institution.count(),
        prisma.auditEvent.count(),
      ]);

      return res.json({
        success: true,
        data: {
          status: 'HEALTHY',
          uptimeSeconds: Math.floor(process.uptime()),
          nodeVersion: process.version,
          database: 'CONNECTED',
          stats: {
            applications: appCount,
            users: userCount,
            institutions: instCount,
            auditEvents: auditCount,
          },
          timestamp: new Date().toISOString(),
        },
      });
    } catch (err) {
      next(err);
    }
  }
}

