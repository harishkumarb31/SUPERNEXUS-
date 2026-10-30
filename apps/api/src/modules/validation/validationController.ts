import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../services/db';
import { ValidationEngine } from '../../services/validationEngine';
import { AppError } from '../../middleware/errorHandler';
import { logAuditEvent } from '../../middleware/audit';

export class ValidationController {
  static async runValidation(req: Request, res: Response, next: NextFunction) {
    try {
      const { applicationId } = req.body;
      if (!applicationId) throw new AppError('applicationId is required', 400);

      const findings = await ValidationEngine.validateApplication(applicationId);

      await logAuditEvent({
        req,
        action: 'VALIDATION_EXECUTE',
        entityType: 'Application',
        entityId: applicationId,
        reason: `Triggered deterministic validation rules. New findings created: ${findings.length}`,
      });

      return res.json({
        success: true,
        message: `Validation complete. ${findings.length} new finding(s) detected.`,
        data: findings,
      });
    } catch (err) {
      next(err);
    }
  }

  static async listFindings(req: Request, res: Response, next: NextFunction) {
    try {
      const { applicationId, status, severity } = req.query;

      const where: any = {};
      if (applicationId) where.applicationId = String(applicationId);
      if (status) where.status = String(status);
      if (severity) where.severity = String(severity);

      const findings = await prisma.validationFinding.findMany({
        where,
        include: {
          application: { select: { applicationNumber: true, institution: { select: { name: true } } } },
          document: { select: { originalName: true, documentType: true } },
          resolvedByUser: { select: { fullName: true } },
        },
        orderBy: { detectedAt: 'desc' },
      });

      return res.json({ success: true, data: findings });
    } catch (err) {
      next(err);
    }
  }

  static async resolveFinding(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, resolutionNotes } = req.body;
      const user = req.user!;

      const finding = await prisma.validationFinding.findUnique({ where: { id } });
      if (!finding) throw new AppError('Finding not found', 404);

      const updated = await prisma.validationFinding.update({
        where: { id },
        data: {
          status: status || 'RESOLVED',
          resolutionNotes: resolutionNotes || 'Resolved after review',
          resolutionDate: new Date(),
          resolvedByUserId: user.id,
        },
      });

      await logAuditEvent({
        req,
        action: 'DEFICIENCY_RESOLVED',
        entityType: 'ValidationFinding',
        entityId: id,
        beforeState: { status: finding.status },
        afterState: { status: updated.status, resolutionNotes },
        reason: `Officer resolved finding ${finding.ruleCode}`,
      });

      return res.json({
        success: true,
        message: `Finding marked as ${updated.status}`,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }
}

