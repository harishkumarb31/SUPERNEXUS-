import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../services/db';
import { UserRole } from '@regulaflow/shared';
import { logAuditEvent } from '../../middleware/audit';

export class ReportController {
  static async getDashboardMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const whereApp: any = {};
      const whereCompliance: any = {};

      if (user.role === UserRole.INSTITUTION_USER) {
        whereApp.institutionId = user.institutionId;
        whereCompliance.institutionId = user.institutionId;
      } else if (user.role === UserRole.REGIONAL_OFFICER && user.region) {
        whereApp.institution = { region: user.region };
        whereCompliance.institution = { region: user.region };
      }

      const [
        totalApplications,
        pendingScrutiny,
        deficienciesRaised,
        awaitingEVC,
        approved,
        rejected,
        overdueCompliance,
        dueSoonCompliance,
        openFindingsCount,
      ] = await Promise.all([
        prisma.application.count({ where: whereApp }),
        prisma.application.count({ where: { ...whereApp, currentStage: 'UNDER_SCRUTINY' } }),
        prisma.application.count({ where: { ...whereApp, currentStage: 'DEFICIENCY_RAISED' } }),
        prisma.application.count({ where: { ...whereApp, currentStage: 'AWAITING_EVC' } }),
        prisma.application.count({ where: { ...whereApp, currentStage: 'APPROVED' } }),
        prisma.application.count({ where: { ...whereApp, currentStage: 'REJECTED' } }),
        prisma.complianceObligation.count({ where: { ...whereCompliance, status: 'OVERDUE' } }),
        prisma.complianceObligation.count({ where: { ...whereCompliance, status: 'DUE_SOON' } }),
        prisma.validationFinding.count({
          where: {
            status: { in: ['OPEN', 'CONFIRMED'] },
            ...(user.role === UserRole.INSTITUTION_USER && user.institutionId
              ? { application: { institutionId: user.institutionId } }
              : {}),
          },
        }),
      ]);

      return res.json({
        success: true,
        data: {
          totalApplications,
          pendingScrutiny,
          deficienciesRaised,
          awaitingEVC,
          approved,
          rejected,
          overdueCompliance,
          dueSoonCompliance,
          openFindingsCount,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getStageDistribution(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const where: any = {};

      if (user.role === UserRole.INSTITUTION_USER) {
        where.institutionId = user.institutionId;
      } else if (user.role === UserRole.REGIONAL_OFFICER && user.region) {
        where.institution = { region: user.region };
      }

      const apps = await prisma.application.findMany({
        where,
        select: { currentStage: true },
      });

      const counts: Record<string, number> = {};
      for (const a of apps) {
        counts[a.currentStage] = (counts[a.currentStage] || 0) + 1;
      }

      const result = Object.entries(counts).map(([stage, count]) => ({
        stage,
        count,
      }));

      return res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async getRegionalPendency(req: Request, res: Response, next: NextFunction) {
    try {
      const institutions = await prisma.institution.findMany({
        include: {
          applications: {
            select: { currentStage: true },
          },
        },
      });

      const regionalData: Record<string, { total: number; pending: number; approved: number }> = {};

      for (const inst of institutions) {
        const region = inst.region || 'OTHER';
        if (!regionalData[region]) {
          regionalData[region] = { total: 0, pending: 0, approved: 0 };
        }

        for (const app of inst.applications) {
          regionalData[region].total++;
          if (app.currentStage === 'APPROVED') {
            regionalData[region].approved++;
          } else if (app.currentStage !== 'CLOSED' && app.currentStage !== 'REJECTED') {
            regionalData[region].pending++;
          }
        }
      }

      const result = Object.entries(regionalData).map(([region, val]) => ({
        region,
        ...val,
      }));

      return res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async exportCsv(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const where: any = {};

      if (user.role === UserRole.INSTITUTION_USER) {
        where.institutionId = user.institutionId;
      } else if (user.role === UserRole.REGIONAL_OFFICER && user.region) {
        where.institution = { region: user.region };
      }

      const apps = await prisma.application.findMany({
        where,
        include: { institution: true, assignedOfficer: true },
      });

      let csv = 'Application Number,Institution Name,Institution Code,Region,Category,Stage,Priority,Officer,Submission Date,Deadline\n';

      for (const a of apps) {
        csv += `"${a.applicationNumber}","${a.institution.name}","${a.institution.code}","${a.institution.region}","${a.category}","${a.currentStage}","${a.priority}","${a.assignedOfficer?.fullName || 'Unassigned'}","${a.submissionDate ? a.submissionDate.toISOString().split('T')[0] : ''}","${a.deadlineDate ? a.deadlineDate.toISOString().split('T')[0] : ''}"\n`;
      }

      await logAuditEvent({
        req,
        action: 'REPORT_EXPORT',
        entityType: 'Application',
        reason: 'User exported applications report to CSV format',
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="regulaflow_applications_report.csv"');
      return res.send(csv);
    } catch (err) {
      next(err);
    }
  }
}
