import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../services/db';
import { AppError } from '../../middleware/errorHandler';
import { logAuditEvent } from '../../middleware/audit';

export class TaskController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { status, type, priority, assignedToId } = req.query;

      const where: any = {};

      if (status) where.status = String(status);
      if (type) where.type = String(type);
      if (priority) where.priority = String(priority);

      // Scoping: Freshers and Evaluators see their own assigned tasks
      if (['FRESHER', 'EVALUATOR', 'COMMITTEE_MEMBER'].includes(user.role)) {
        where.assignedToId = user.id;
      } else if (user.role === 'DEPARTMENT_OFFICER' || user.role === 'REGIONAL_OFFICER') {
        if (assignedToId) {
          where.assignedToId = String(assignedToId);
        } else {
          // See tasks assigned to them or created by them or in their department
          where.OR = [
            { assignedToId: user.id },
            { assignedById: user.id },
            { assignedTo: { departmentId: user.departmentId || undefined } },
          ];
        }
      } else if (assignedToId) {
        where.assignedToId = String(assignedToId);
      }

      const tasks = await prisma.userTask.findMany({
        where,
        include: {
          assignedTo: {
            select: { id: true, fullName: true, email: true, role: true, designation: true },
          },
          assignedBy: {
            select: { id: true, fullName: true, email: true },
          },
          application: {
            select: {
              id: true,
              applicationNumber: true,
              currentStage: true,
              institution: { select: { name: true, code: true } },
            },
          },
        },
        orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
      });

      return res.json({ success: true, data: tasks });
    } catch (err) {
      next(err);
    }
  }

  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const where: any = {};

      if (['FRESHER', 'EVALUATOR', 'COMMITTEE_MEMBER'].includes(user.role)) {
        where.assignedToId = user.id;
      } else if (user.role === 'DEPARTMENT_OFFICER' || user.role === 'REGIONAL_OFFICER') {
        where.OR = [
          { assignedToId: user.id },
          { assignedById: user.id },
        ];
      }

      const [total, pending, inProgress, completed, urgent] = await Promise.all([
        prisma.userTask.count({ where }),
        prisma.userTask.count({ where: { ...where, status: 'PENDING' } }),
        prisma.userTask.count({ where: { ...where, status: 'IN_PROGRESS' } }),
        prisma.userTask.count({ where: { ...where, status: 'COMPLETED' } }),
        prisma.userTask.count({ where: { ...where, priority: 'URGENT', status: { not: 'COMPLETED' } } }),
      ]);

      return res.json({
        success: true,
        data: {
          total,
          pending,
          inProgress,
          completed,
          urgent,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { title, description, type, priority, dueDate, assignedToId, applicationId } = req.body;

      if (!title || !assignedToId) {
        throw new AppError('Title and assigned user are required', 400);
      }

      const task = await prisma.userTask.create({
        data: {
          title,
          description,
          type: type || 'VERIFICATION',
          priority: priority || 'NORMAL',
          dueDate: dueDate ? new Date(dueDate) : null,
          assignedToId,
          assignedById: user.id,
          applicationId: applicationId || null,
        },
        include: {
          assignedTo: { select: { fullName: true, email: true } },
        },
      });

      await logAuditEvent({
        req,
        actorId: user.id,
        actorEmail: user.email,
        actorRole: user.role,
        action: 'TASK_ASSIGN',
        entityType: 'UserTask',
        entityId: task.id,
        reason: `Task assigned: ${title}`,
      });

      return res.status(201).json({ success: true, data: task });
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user!;
      const { status, progress, remarks } = req.body;

      const existing = await prisma.userTask.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new AppError('Task not found', 404);
      }

      // Check permission: assigned user or manager/admin
      const isAssigned = existing.assignedToId === user.id;
      const isManager = ['SUPER_ADMIN', 'ADMIN', 'SYSTEM_ADMIN', 'BUREAU_OFFICER', 'DEPARTMENT_OFFICER', 'REGIONAL_OFFICER'].includes(user.role);

      if (!isAssigned && !isManager) {
        throw new AppError('Forbidden: Cannot update task assigned to another user', 403);
      }

      const data: any = {};
      if (status) data.status = status;
      if (typeof progress === 'number') data.progress = Math.min(100, Math.max(0, progress));
      if (status === 'COMPLETED') data.progress = 100;

      const updated = await prisma.userTask.update({
        where: { id },
        data,
      });

      return res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }
}
