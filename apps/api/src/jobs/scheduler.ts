import cron from 'node-cron';
import { prisma } from '../services/db';
import { ComplianceStatus } from '@regulaflow/shared';

export async function runComplianceAndDeadlineJob() {
  const now = new Date();
  const summary = {
    obligationsChecked: 0,
    dueSoonFlagged: 0,
    overdueFlagged: 0,
    escalationsCreated: 0,
    notificationsSent: 0,
  };

  try {
    // 1. Check Compliance Obligations
    const obligations = await prisma.complianceObligation.findMany({
      where: {
        status: { in: [ComplianceStatus.ACTIVE, ComplianceStatus.DUE_SOON] },
      },
      include: {
        institution: {
          include: {
            users: true,
          },
        },
      },
    });

    summary.obligationsChecked = obligations.length;

    for (const ob of obligations) {
      const dueTime = new Date(ob.dueDate).getTime();
      const diffMs = dueTime - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) {
        // OVERDUE
        await prisma.complianceObligation.update({
          where: { id: ob.id },
          data: { status: ComplianceStatus.OVERDUE },
        });
        summary.overdueFlagged++;

        // Trigger Escalation if not already triggered
        const existingEsc = await prisma.escalationEvent.findFirst({
          where: { complianceId: ob.id, resolved: false },
        });

        if (!existingEsc) {
          await prisma.escalationEvent.create({
            data: {
              complianceId: ob.id,
              applicationId: ob.applicationId,
              triggerRule: 'ESC_OVERDUE_COMPLIANCE',
              severity: 'CRITICAL',
              escalatedToRole: 'BUREAU_OFFICER',
              message: `Compliance obligation '${ob.title}' for institution ${ob.institution.name} is OVERDUE by ${Math.abs(diffDays)} days.`,
            },
          });
          summary.escalationsCreated++;
        }

        // Notify institution users
        for (const user of ob.institution.users) {
          const existingNotif = await prisma.notification.findFirst({
            where: {
              userId: user.id,
              title: { contains: `OVERDUE: ${ob.title}` },
            },
          });

          if (!existingNotif) {
            await prisma.notification.create({
              data: {
                userId: user.id,
                institutionId: ob.institutionId,
                category: 'COMPLIANCE_REMINDER',
                severity: 'CRITICAL',
                title: `OVERDUE: ${ob.title}`,
                message: `The deadline for ${ob.title} has passed on ${new Date(ob.dueDate).toLocaleDateString('en-IN')}. Please submit compliance evidence immediately.`,
                link: '/compliance',
              },
            });
            summary.notificationsSent++;
          }
        }
      } else if (diffDays <= ob.warningDays && ob.status !== ComplianceStatus.DUE_SOON) {
        // DUE SOON
        await prisma.complianceObligation.update({
          where: { id: ob.id },
          data: { status: ComplianceStatus.DUE_SOON },
        });
        summary.dueSoonFlagged++;

        // Notify users
        for (const user of ob.institution.users) {
          const existingNotif = await prisma.notification.findFirst({
            where: {
              userId: user.id,
              title: { contains: `Upcoming: ${ob.title}` },
            },
          });

          if (!existingNotif) {
            await prisma.notification.create({
              data: {
                userId: user.id,
                institutionId: ob.institutionId,
                category: 'COMPLIANCE_REMINDER',
                severity: 'WARNING',
                title: `Upcoming: ${ob.title}`,
                message: `${ob.title} is due in ${diffDays} calendar days (${new Date(ob.dueDate).toLocaleDateString('en-IN')}).`,
                link: '/compliance',
              },
            });
            summary.notificationsSent++;
          }
        }
      }
    }

    // 2. Check Overdue Applications
    const openApps = await prisma.application.findMany({
      where: {
        deadlineDate: { lt: now },
        currentStage: {
          notIn: ['APPROVED', 'REJECTED', 'CLOSED'],
        },
      },
    });

    for (const app of openApps) {
      if (app.priority !== 'URGENT') {
        await prisma.application.update({
          where: { id: app.id },
          data: { priority: 'URGENT' },
        });
      }
    }
  } catch (err) {
    console.error('[Scheduler Execution Error]:', err);
  }

  return summary;
}

export function startScheduler() {
  console.log('[Scheduler] Background Compliance & Escalation job scheduled to run every 10 minutes.');
  // Run every 10 minutes
  cron.schedule('*/10 * * * *', async () => {
    await runComplianceAndDeadlineJob();
  });
}
