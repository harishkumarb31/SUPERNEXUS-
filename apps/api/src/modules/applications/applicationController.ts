import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../../services/db';
import { AppError } from '../../middleware/errorHandler';
import { WorkflowEngine } from '../../services/workflowEngine';
import { ValidationEngine } from '../../services/validationEngine';
import { logAuditEvent } from '../../middleware/audit';
import { ApplicationStage, UserRole } from '@regulaflow/shared';

const createApplicationSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  academicYear: z.string().default('2026-2027'),
  priority: z.enum(['NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  programmesData: z.any().optional(),
  infrastructureData: z.any().optional(),
  facultyData: z.any().optional(),
  financialData: z.any().optional(),
});

const transitionSchema = z.object({
  targetStage: z.nativeEnum(ApplicationStage),
  reason: z.string().optional(),
  comments: z.string().optional(),
});

const assignOfficerSchema = z.object({
  officerId: z.string().uuid('Valid officer ID required'),
});

export class ApplicationController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      if (!user.institutionId) {
        throw new AppError('Only registered institution users can create applications.', 403);
      }

      const body = createApplicationSchema.parse(req.body);

      // Generate unique application number: AICTE/2026-27/APP-XXXXX
      const count = await prisma.application.count();
      const appNumber = `AICTE/2026-27/APP-${String(count + 101).padStart(5, '0')}`;

      // Deadline: 30 days from creation
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 30);

      const application = await prisma.application.create({
        data: {
          applicationNumber: appNumber,
          category: body.category,
          academicYear: body.academicYear,
          priority: body.priority,
          institutionId: user.institutionId,
          currentStage: ApplicationStage.DRAFT,
          deadlineDate: deadline,
          programmesData: body.programmesData ? JSON.stringify(body.programmesData) : null,
          infrastructureData: body.infrastructureData ? JSON.stringify(body.infrastructureData) : null,
          facultyData: body.facultyData ? JSON.stringify(body.facultyData) : null,
          financialData: body.financialData ? JSON.stringify(body.financialData) : null,
        },
        include: {
          institution: true,
        },
      });

      await logAuditEvent({
        req,
        action: 'APPLICATION_CREATE',
        entityType: 'Application',
        entityId: application.id,
        afterState: { applicationNumber: appNumber, stage: 'DRAFT' },
        reason: 'Institution user initiated new approval application draft',
      });

      return res.status(201).json({
        success: true,
        message: 'Draft application created successfully',
        data: application,
      });
    } catch (err) {
      next(err);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { stage, region, category, priority, search, page = '1', limit = '10' } = req.query;

      const pageNum = Math.max(1, parseInt(page as string, 10));
      const take = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
      const skip = (pageNum - 1) * take;

      const where: any = {};

      // Role and jurisdiction scoping
      if (user.role === UserRole.INSTITUTION_USER) {
        where.institutionId = user.institutionId;
      } else if (user.role === UserRole.REGIONAL_OFFICER && user.region) {
        where.institution = { region: user.region };
      }

      // Query filters
      if (stage) where.currentStage = stage;
      if (category) where.category = category;
      if (priority) where.priority = priority;
      if (region && user.role !== UserRole.INSTITUTION_USER) {
        where.institution = { ...where.institution, region };
      }

      if (search) {
        const s = String(search).trim();
        where.OR = [
          { applicationNumber: { contains: s } },
          { institution: { name: { contains: s } } },
          { institution: { code: { contains: s } } },
        ];
      }

      const [applications, total] = await Promise.all([
        prisma.application.findMany({
          where,
          include: {
            institution: true,
            assignedOfficer: {
              select: { id: true, fullName: true, email: true, region: true },
            },
            documents: {
              select: { id: true, documentType: true, status: true },
            },
            findings: {
              where: { status: { in: ['OPEN', 'CONFIRMED'] } },
              select: { id: true, severity: true, ruleCode: true },
            },
          },
          orderBy: { updatedAt: 'desc' },
          skip,
          take,
        }),
        prisma.application.count({ where }),
      ]);

      return res.json({
        success: true,
        data: {
          applications,
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

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const application = await prisma.application.findUnique({
        where: { id },
        include: {
          institution: true,
          assignedOfficer: {
            select: { id: true, fullName: true, email: true, phone: true, region: true },
          },
          documents: {
            include: {
              extractions: true,
            },
          },
          findings: {
            include: {
              resolvedByUser: { select: { fullName: true } },
            },
            orderBy: { detectedAt: 'desc' },
          },
          complianceItems: true,
          evcActivities: true,
          stageHistory: {
            orderBy: { timestamp: 'asc' },
          },
        },
      });

      if (!application) {
        throw new AppError('Application not found', 404);
      }

      return res.json({
        success: true,
        data: application,
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateDraft(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user!;

      const app = await prisma.application.findUnique({ where: { id } });
      if (!app) throw new AppError('Application not found', 404);

      if (app.currentStage !== ApplicationStage.DRAFT && app.currentStage !== ApplicationStage.RETURNED_FOR_CORRECTION) {
        throw new AppError('Only draft or returned applications can be modified.', 400);
      }

      const body = req.body;
      const updated = await prisma.application.update({
        where: { id },
        data: {
          category: body.category || app.category,
          priority: body.priority || app.priority,
          programmesData: body.programmesData ? JSON.stringify(body.programmesData) : app.programmesData,
          infrastructureData: body.infrastructureData ? JSON.stringify(body.infrastructureData) : app.infrastructureData,
          facultyData: body.facultyData ? JSON.stringify(body.facultyData) : app.facultyData,
          financialData: body.financialData ? JSON.stringify(body.financialData) : app.financialData,
        },
      });

      await logAuditEvent({
        req,
        action: 'APPLICATION_UPDATE',
        entityType: 'Application',
        entityId: id,
        reason: 'Application data updated by user',
      });

      return res.json({ success: true, message: 'Application updated', data: updated });
    } catch (err) {
      next(err);
    }
  }

  static async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user!;

      // 1. Run deterministic validation
      await ValidationEngine.validateApplication(id);

      // 2. Perform workflow transition to SUBMITTED
      const updated = await WorkflowEngine.transition({
        applicationId: id,
        targetStage: ApplicationStage.SUBMITTED,
        actorId: user.id,
        actorName: user.fullName,
        actorRole: user.role,
        reason: 'Final institutional submission for AICTE statutory review',
      });

      return res.json({
        success: true,
        message: 'Application submitted successfully for statutory AICTE review',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  static async transition(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user!;
      const { targetStage, reason, comments } = transitionSchema.parse(req.body);

      const updated = await WorkflowEngine.transition({
        applicationId: id,
        targetStage,
        actorId: user.id,
        actorName: user.fullName,
        actorRole: user.role,
        reason,
        comments,
      });

      return res.json({
        success: true,
        message: `Application stage transitioned to ${targetStage}`,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  static async assignOfficer(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { officerId } = assignOfficerSchema.parse(req.body);

      const officer = await prisma.user.findUnique({ where: { id: officerId } });
      if (!officer) {
        throw new AppError('Assigned officer not found', 404);
      }

      const updated = await prisma.application.update({
        where: { id },
        data: { assignedOfficerId: officerId },
        include: { assignedOfficer: true },
      });

      // Notify officer
      await prisma.notification.create({
        data: {
          userId: officerId,
          applicationId: id,
          institutionId: updated.institutionId,
          category: 'APPLICATION_STATUS',
          severity: 'INFO',
          title: `Application Assigned: ${updated.applicationNumber}`,
          message: `You have been assigned as the scrutiny officer for application ${updated.applicationNumber}.`,
          link: `/applications/${id}`,
        },
      });

      await logAuditEvent({
        req,
        action: 'OFFICER_ASSIGNMENT',
        entityType: 'Application',
        entityId: id,
        afterState: { assignedOfficerId: officerId, officerName: officer.fullName },
        reason: `Application assigned to officer ${officer.fullName}`,
      });

      return res.json({
        success: true,
        message: `Application assigned to ${officer.fullName}`,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }
}

