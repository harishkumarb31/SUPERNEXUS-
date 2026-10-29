import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../services/db';
import { AppError } from '../../middleware/errorHandler';
import { runComplianceAndDeadlineJob } from '../../jobs/scheduler';
import { logAuditEvent } from '../../middleware/audit';
import { ComplianceStatus, UserRole } from '@regulaflow/shared';

export class ComplianceController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { status, type, institutionId } = req.query;

      const where: any = {};
      if (user.role === UserRole.INSTITUTION_USER) {
        where.institutionId = user.institutionId;
      } else if (institutionId) {
        where.institutionId = String(institutionId);
      }

      if (status) where.status = String(status);
      if (type) where.obligationType = String(type);

      const items = await prisma.complianceObligation.findMany({
        where,
        include: {
          institution: { select: { id: true, name: true, code: true, region: true } },
          application: { select: { id: true, applicationNumber: true, currentStage: true } },
          evidenceDocument: { select: { id: true, originalName: true, status: true } },
        },
        orderBy: { dueDate: 'asc' },
      });

      // Calculate summary metrics
      const activeCount = items.filter((i) => i.status === ComplianceStatus.ACTIVE).length;
      const dueSoonCount = items.filter((i) => i.status === ComplianceStatus.DUE_SOON).length;
      const overdueCount = items.filter((i) => i.status === ComplianceStatus.OVERDUE).length;
      const completedCount = items.filter((i) => i.status === ComplianceStatus.COMPLETED).length;

      return res.json({
        success: true,
        data: {
          items,
          metrics: {
            total: items.length,
            active: activeCount,
            dueSoon: dueSoonCount,
            overdue: overdueCount,
            completed: completedCount,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { institutionId, applicationId, obligationType, title, description, dueDate, warningDays } = req.body;

      const instId = user.role === UserRole.INSTITUTION_USER ? user.institutionId : institutionId;
      if (!instId) {
        throw new AppError('institutionId is required', 400);
      }

      const obligation = await prisma.complianceObligation.create({
        data: {
          institutionId: instId,
          applicationId: applicationId || null,
          obligationType,
          title,
          description,
          dueDate: new Date(dueDate),
          warningDays: warningDays ? parseInt(warningDays, 10) : 30,
          status: ComplianceStatus.ACTIVE,
        },
      });

      await logAuditEvent({
        req,
        action: 'COMPLIANCE_CREATE',
        entityType: 'ComplianceObligation',
        entityId: obligation.id,
        reason: `Created compliance obligation: ${title}`,
      });

      return res.status(201).json({ success: true, data: obligation });
    } catch (err) {
      next(err);
    }
  }

  static async resolve(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { evidenceDocumentId, completionNotes } = req.body;

      const updated = await prisma.complianceObligation.update({
        where: { id },
        data: {
          status: ComplianceStatus.COMPLETED,
          evidenceDocumentId: evidenceDocumentId || null,
          completionNotes: completionNotes || 'Compliance requirement satisfied and validated',
          completedAt: new Date(),
        },
      });

      await logAuditEvent({
        req,
        action: 'COMPLIANCE_RESOLVE',
        entityType: 'ComplianceObligation',
        entityId: id,
        reason: `Marked compliance item as completed: ${updated.title}`,
      });

      return res.json({ success: true, message: 'Compliance marked as fulfilled', data: updated });
    } catch (err) {
      next(err);
    }
  }

  static async triggerCheck(req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await runComplianceAndDeadlineJob();
      return res.json({
        success: true,
        message: 'Compliance evaluation and deadline check completed',
        data: summary,
      });
    } catch (err) {
      next(err);
    }
  }
}
