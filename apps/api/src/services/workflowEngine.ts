import { ApplicationStage, UserRole } from '@regulaflow/shared';
import { prisma } from './db';
import { AppError } from '../middleware/errorHandler';
import { logAuditEvent } from '../middleware/audit';

// Valid transitions mapping: fromStage -> array of allowed toStages
export const VALID_TRANSITIONS: Record<ApplicationStage, ApplicationStage[]> = {
  [ApplicationStage.DRAFT]: [ApplicationStage.SUBMITTED],
  [ApplicationStage.SUBMITTED]: [ApplicationStage.UNDER_SCRUTINY, ApplicationStage.CLOSED],
  [ApplicationStage.UNDER_SCRUTINY]: [
    ApplicationStage.DEFICIENCY_RAISED,
    ApplicationStage.AWAITING_EVC,
    ApplicationStage.UNDER_REVIEW,
    ApplicationStage.CLOSED,
  ],
  [ApplicationStage.DEFICIENCY_RAISED]: [
    ApplicationStage.RETURNED_FOR_CORRECTION,
    ApplicationStage.UNDER_SCRUTINY,
  ],
  [ApplicationStage.RETURNED_FOR_CORRECTION]: [ApplicationStage.RESUBMITTED],
  [ApplicationStage.RESUBMITTED]: [ApplicationStage.UNDER_SCRUTINY],
  [ApplicationStage.AWAITING_EVC]: [ApplicationStage.UNDER_REVIEW, ApplicationStage.DEFICIENCY_RAISED],
  [ApplicationStage.UNDER_REVIEW]: [
    ApplicationStage.AWAITING_DECISION,
    ApplicationStage.DEFICIENCY_RAISED,
    ApplicationStage.CLOSED,
  ],
  [ApplicationStage.AWAITING_DECISION]: [
    ApplicationStage.APPROVED,
    ApplicationStage.REJECTED,
    ApplicationStage.UNDER_REVIEW,
  ],
  [ApplicationStage.APPROVED]: [ApplicationStage.CLOSED],
  [ApplicationStage.REJECTED]: [ApplicationStage.CLOSED],
  [ApplicationStage.CLOSED]: [],
};

// Role permissions mapping for executing transitions
export const STAGE_PERMISSIONS: Partial<Record<ApplicationStage, UserRole[]>> = {
  [ApplicationStage.SUBMITTED]: [UserRole.INSTITUTION_USER, UserRole.SYSTEM_ADMIN],
  [ApplicationStage.UNDER_SCRUTINY]: [
    UserRole.REGIONAL_OFFICER,
    UserRole.BUREAU_OFFICER,
    UserRole.SYSTEM_ADMIN,
  ],
  [ApplicationStage.DEFICIENCY_RAISED]: [
    UserRole.REGIONAL_OFFICER,
    UserRole.BUREAU_OFFICER,
    UserRole.SYSTEM_ADMIN,
  ],
  [ApplicationStage.RETURNED_FOR_CORRECTION]: [
    UserRole.REGIONAL_OFFICER,
    UserRole.BUREAU_OFFICER,
    UserRole.SYSTEM_ADMIN,
  ],
  [ApplicationStage.RESUBMITTED]: [UserRole.INSTITUTION_USER, UserRole.SYSTEM_ADMIN],
  [ApplicationStage.AWAITING_EVC]: [
    UserRole.REGIONAL_OFFICER,
    UserRole.BUREAU_OFFICER,
    UserRole.SYSTEM_ADMIN,
  ],
  [ApplicationStage.UNDER_REVIEW]: [
    UserRole.REGIONAL_OFFICER,
    UserRole.BUREAU_OFFICER,
    UserRole.COMMITTEE_MEMBER,
    UserRole.SYSTEM_ADMIN,
  ],
  [ApplicationStage.AWAITING_DECISION]: [UserRole.BUREAU_OFFICER, UserRole.SYSTEM_ADMIN],
  [ApplicationStage.APPROVED]: [UserRole.BUREAU_OFFICER, UserRole.SYSTEM_ADMIN],
  [ApplicationStage.REJECTED]: [UserRole.BUREAU_OFFICER, UserRole.SYSTEM_ADMIN],
  [ApplicationStage.CLOSED]: [UserRole.BUREAU_OFFICER, UserRole.SYSTEM_ADMIN],
};

export interface TransitionContext {
  applicationId: string;
  targetStage: ApplicationStage;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  reason?: string;
  comments?: string;
}

export class WorkflowEngine {
  static async transition(context: TransitionContext) {
    const { applicationId, targetStage, actorId, actorName, actorRole, reason, comments } = context;

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        institution: true,
        documents: true,
      },
    });

    if (!application) {
      throw new AppError('Application not found', 404);
    }

    const currentStage = application.currentStage as ApplicationStage;

    // 1. Verify that transition is allowed by state machine
    const allowed = VALID_TRANSITIONS[currentStage] || [];
    if (!allowed.includes(targetStage)) {
      throw new AppError(
        `Invalid workflow stage transition: Cannot move from '${currentStage}' to '${targetStage}'. Allowed destinations: [${allowed.join(', ')}]`,
        400
      );
    }

    // 2. Verify actor role permission for target stage
    const permittedRoles = STAGE_PERMISSIONS[targetStage] || [];
    if (permittedRoles.length > 0 && !permittedRoles.includes(actorRole)) {
      throw new AppError(
        `Role '${actorRole}' is not authorized to transition application to stage '${targetStage}'. Authorized roles: [${permittedRoles.join(', ')}]`,
        403
      );
    }

    // 3. Mandatory document checks if transitioning from DRAFT to SUBMITTED
    if (targetStage === ApplicationStage.SUBMITTED) {
      if (application.documents.length === 0) {
        throw new AppError(
          'Cannot submit application without mandatory supporting documents (Land Lease Deed, Safety NOC, Undertaking).',
          400
        );
      }
    }

    // 4. Update application state atomically in transaction
    const updated = await prisma.$transaction(async (tx) => {
      const app = await tx.application.update({
        where: { id: applicationId },
        data: {
          currentStage: targetStage,
          submissionDate:
            targetStage === ApplicationStage.SUBMITTED && !application.submissionDate
              ? new Date()
              : application.submissionDate,
          lastResubmissionDate:
            targetStage === ApplicationStage.RESUBMITTED ? new Date() : application.lastResubmissionDate,
          scrutinyRemarks: comments || application.scrutinyRemarks,
        },
        include: {
          institution: true,
          assignedOfficer: true,
        },
      });

      // Record stage history
      await tx.applicationStageHistory.create({
        data: {
          applicationId,
          fromStage: currentStage,
          toStage: targetStage,
          action: `TRANSITION_${currentStage}_TO_${targetStage}`,
          actorId,
          actorName,
          actorRole,
          reason: reason || comments || `Transitioned to ${targetStage}`,
          timestamp: new Date(),
        },
      });

      // Generate in-app notifications
      const notifMessage = `Application ${app.applicationNumber} transitioned from ${currentStage} to ${targetStage}. Reason: ${reason || 'Status update'}`;

      if (app.assignedOfficerId && actorId !== app.assignedOfficerId) {
        await tx.notification.create({
          data: {
            userId: app.assignedOfficerId,
            applicationId,
            institutionId: app.institutionId,
            category: 'APPLICATION_STATUS',
            severity: 'INFO',
            title: `Application Status Changed: ${targetStage}`,
            message: notifMessage,
            link: `/applications/${applicationId}`,
          },
        });
      }

      // Notify institution users
      const instUsers = await tx.user.findMany({
        where: { institutionId: app.institutionId, role: UserRole.INSTITUTION_USER },
      });

      for (const u of instUsers) {
        if (u.id !== actorId) {
          await tx.notification.create({
            data: {
              userId: u.id,
              applicationId,
              institutionId: app.institutionId,
              category: 'APPLICATION_STATUS',
              severity: targetStage === ApplicationStage.DEFICIENCY_RAISED ? 'WARNING' : 'INFO',
              title: `Update on Application ${app.applicationNumber}`,
              message: notifMessage,
              link: `/applications/${applicationId}`,
            },
          });
        }
      }

      return app;
    });

    // 5. Log audit event
    await logAuditEvent({
      actorId,
      actorRole,
      action: 'STAGE_TRANSITION',
      entityType: 'Application',
      entityId: applicationId,
      beforeState: { stage: currentStage },
      afterState: { stage: targetStage },
      reason: reason || comments,
    });

    return updated;
  }
}
