import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../services/db';
import { AppError } from '../../middleware/errorHandler';
import { logAuditEvent } from '../../middleware/audit';
import { EVCStatus, UserRole } from '@regulaflow/shared';

export class EvcController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { applicationId, status } = req.query;

      const where: any = {};
      if (applicationId) where.applicationId = String(applicationId);
      if (status) where.status = String(status);

      const activities = await prisma.eVCActivity.findMany({
        where,
        include: {
          application: {
            include: {
              institution: { select: { id: true, name: true, code: true, city: true, state: true } },
            },
          },
        },
        orderBy: { scheduledDate: 'asc' },
      });

      return res.json({ success: true, data: activities });
    } catch (err) {
      next(err);
    }
  }

  static async schedule(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        applicationId,
        committeeType,
        scheduledDate,
        venueOrMode,
        chairmanName,
        members,
        checklist,
      } = req.body;

      if (!applicationId || !scheduledDate || !chairmanName) {
        throw new AppError('applicationId, scheduledDate, and chairmanName are required', 400);
      }

      const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: { institution: true },
      });

      if (!application) throw new AppError('Application not found', 404);

      // Check for scheduling conflict: same chairman on same day
      const targetDate = new Date(scheduledDate);
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      const conflict = await prisma.eVCActivity.findFirst({
        where: {
          chairmanName,
          status: { in: [EVCStatus.SCHEDULED, EVCStatus.IN_PROGRESS] },
          scheduledDate: { gte: startOfDay, lte: endOfDay },
        },
      });

      if (conflict) {
        throw new AppError(
          `Scheduling Conflict: Chairman '${chairmanName}' is already assigned to another EVC activity on ${targetDate.toLocaleDateString('en-IN')}. Please select an alternate date or expert.`,
          409
        );
      }

      const activity = await prisma.eVCActivity.create({
        data: {
          applicationId,
          committeeType: committeeType || 'EXPERT_VISITING_COMMITTEE',
          scheduledDate: targetDate,
          venueOrMode: venueOrMode || 'PHYSICAL_INSPECTION',
          status: EVCStatus.SCHEDULED,
          chairmanName,
          membersJson: JSON.stringify(members || [{ name: chairmanName, role: 'Chairman' }]),
          checklistJson: JSON.stringify(
            checklist || [
              { item: 'Instructional laboratories GIS verification', status: 'PENDING' },
              { item: 'Fire hydrants and emergency exits inspection', status: 'PENDING' },
              { item: 'Barrier-free environment for differently-abled', status: 'PENDING' },
              { item: 'Faculty biometric attendance & Aadhaar authentication', status: 'PENDING' },
            ]
          ),
        },
      });

      // Update application stage to AWAITING_EVC if under scrutiny
      if (application.currentStage === 'UNDER_SCRUTINY') {
        await prisma.application.update({
          where: { id: applicationId },
          data: { currentStage: 'AWAITING_EVC' },
        });
      }

      await logAuditEvent({
        req,
        action: 'EVC_SCHEDULED',
        entityType: 'EVCActivity',
        entityId: activity.id,
        reason: `EVC inspection scheduled for ${targetDate.toLocaleDateString('en-IN')}`,
      });

      return res.status(201).json({
        success: true,
        message: 'EVC inspection scheduled successfully',
        data: activity,
      });
    } catch (err) {
      next(err);
    }
  }

  static async submitReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { observations, recommendation, checklist } = req.body;

      const activity = await prisma.eVCActivity.findUnique({
        where: { id },
        include: { application: true },
      });

      if (!activity) throw new AppError('EVC activity not found', 404);

      const updated = await prisma.eVCActivity.update({
        where: { id },
        data: {
          status: EVCStatus.COMPLETED,
          observations,
          recommendation,
          checklistJson: checklist ? JSON.stringify(checklist) : activity.checklistJson,
          completedAt: new Date(),
        },
      });

      // Move application to UNDER_REVIEW
      await prisma.application.update({
        where: { id: activity.applicationId },
        data: { currentStage: 'UNDER_REVIEW' },
      });

      await logAuditEvent({
        req,
        action: 'EVC_COMPLETED',
        entityType: 'EVCActivity',
        entityId: id,
        afterState: { recommendation, observations },
        reason: 'EVC committee submitted final inspection observations',
      });

      return res.json({
        success: true,
        message: 'EVC inspection findings recorded. Application moved to UNDER_REVIEW.',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }
}
