import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../services/db';
import { ROLE_PERMISSIONS, UserRole, Permission } from '@regulaflow/shared';

export class AdminController {
  static async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await prisma.user.findMany({
        include: {
          institution: { select: { name: true, code: true, region: true } },
          department: { select: { name: true, code: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.json({
        success: true,
        data: users.map((u) => ({
          id: u.id,
          email: u.email,
          fullName: u.fullName,
          role: u.role,
          designation: u.designation,
          phone: u.phone,
          region: u.region,
          departmentId: u.departmentId,
          departmentName: u.department?.name,
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

  static async listDepartments(req: Request, res: Response, next: NextFunction) {
    try {
      const departments = await prisma.department.findMany({
        include: {
          _count: {
            select: { users: true },
          },
          users: {
            select: { id: true, fullName: true, role: true, designation: true },
          },
        },
        orderBy: { name: 'asc' },
      });

      return res.json({ success: true, data: departments });
    } catch (err) {
      next(err);
    }
  }

  static async getRolesAndPermissions(req: Request, res: Response, next: NextFunction) {
    try {
      const roles = Object.values(UserRole).map((role) => ({
        role,
        permissions: ROLE_PERMISSIONS[role] || [],
        permissionCount: (ROLE_PERMISSIONS[role] || []).length,
      }));

      const allPermissions = Object.values(Permission);

      return res.json({
        success: true,
        data: {
          roles,
          allPermissions,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getSecurityStats(req: Request, res: Response, next: NextFunction) {
    try {
      const [totalUsers, activeUsers, auditCount, escalationsCount, recentAudits] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { active: true } }),
        prisma.auditEvent.count(),
        prisma.escalationEvent.count(),
        prisma.auditEvent.findMany({
          take: 10,
          orderBy: { timestamp: 'desc' },
        }),
      ]);

      const usersByRole = await prisma.user.groupBy({
        by: ['role'],
        _count: { id: true },
      });

      return res.json({
        success: true,
        data: {
          totalUsers,
          activeUsers,
          auditCount,
          escalationsCount,
          usersByRole: usersByRole.map((r) => ({ role: r.role, count: r._count.id })),
          recentAudits,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getSystemHealth(req: Request, res: Response, next: NextFunction) {
    try {
      const [appCount, userCount, instCount, auditCount, deptCount, taskCount] = await Promise.all([
        prisma.application.count(),
        prisma.user.count(),
        prisma.institution.count(),
        prisma.auditEvent.count(),
        prisma.department.count(),
        prisma.userTask.count(),
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
            departments: deptCount,
            tasks: taskCount,
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


