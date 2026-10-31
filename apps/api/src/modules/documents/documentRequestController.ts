import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../services/db';
import { AppError } from '../../middleware/errorHandler';
import { logAuditEvent } from '../../middleware/audit';
import { UserRole, Permission, hasPermission, getCanonicalRole } from '@regulaflow/shared';

export class DocumentRequestController {
  /**
   * Create a new document request (typically invoked by an Employee/Evaluator/Fresher
   * who finds a required document missing from their assigned task).
   */
  static async createRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const {
        title,
        categoryId,
        categoryName,
        description,
        reason,
        priority = 'NORMAL',
        requiredByDate,
        applicationId,
        taskId,
        departmentId,
      } = req.body;

      if (!title || !title.trim()) {
        throw new AppError('Document title is required for a document request.', 400);
      }
      if (!reason || !reason.trim()) {
        throw new AppError('A valid operational justification/reason is required.', 400);
      }

      // Generate request number
      const count = await prisma.documentRequest.count();
      const requestNumber = `DOC-REQ-2026-${String(count + 1).padStart(4, '0')}`;

      // Find user's department if not explicitly specified
      let resolvedDeptId = departmentId || user.departmentId;

      // If taskId is provided, verify task exists
      let taskTitle = '';
      if (taskId) {
        const task = await prisma.userTask.findUnique({ where: { id: taskId } });
        if (task) {
          taskTitle = task.title;
          if (!resolvedDeptId && task.applicationId) {
            const app = await prisma.application.findUnique({
              where: { id: task.applicationId },
            });
            if (app) resolvedDeptId = resolvedDeptId || app.assignedOfficerId;
          }
        }
      }

      // Create DocumentRequest record
      const docRequest = await prisma.documentRequest.create({
        data: {
          requestNumber,
          title: title.trim(),
          categoryId: categoryId || null,
          categoryName: categoryName || 'General Document',
          description: description?.trim() || null,
          reason: reason.trim(),
          priority: ['LOW', 'NORMAL', 'HIGH', 'URGENT'].includes(priority) ? priority : 'NORMAL',
          requiredByDate: requiredByDate ? new Date(requiredByDate) : null,
          status: 'SUBMITTED',
          requesterId: user.id,
          departmentId: resolvedDeptId || null,
          applicationId: applicationId || null,
          taskId: taskId || null,
        },
        include: {
          requester: {
            select: { id: true, fullName: true, email: true, role: true, designation: true },
          },
          department: true,
          task: true,
        },
      });

      // Log Audit Event
      await logAuditEvent({
        req,
        action: 'DOCUMENT_REQUEST_CREATED',
        entityType: 'DocumentRequest',
        entityId: docRequest.id,
        reason: `Employee ${user.fullName} created document request ${requestNumber} for "${title}"`,
      });

      // Notification Payload
      const meta = {
        requestId: docRequest.id,
        requestNumber: docRequest.requestNumber,
        title: docRequest.title,
        requesterName: user.fullName,
        department: docRequest.department?.name || 'Regulatory Operations',
        taskTitle: taskTitle || docRequest.task?.title || null,
        priority: docRequest.priority,
        requiredByDate: docRequest.requiredByDate,
      };

      // Disseminate Notifications to Super Admin, Admin, and HR/Department Officers
      const notificationPromises: Promise<any>[] = [];

      // 1. Super Admins
      const superAdmins = await prisma.user.findMany({
        where: {
          role: { in: [UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN] },
          active: true,
        },
        select: { id: true },
      });
      for (const sa of superAdmins) {
        notificationPromises.push(
          prisma.notification.create({
            data: {
              userId: sa.id,
              category: 'DOCUMENT_REQUEST',
              severity: docRequest.priority === 'URGENT' || docRequest.priority === 'HIGH' ? 'WARNING' : 'INFO',
              title: `New Document Request: ${docRequest.requestNumber} (${docRequest.priority})`,
              message: `${user.fullName} requested missing document "${docRequest.title}".`,
              link: `/documents?tab=requests&id=${docRequest.id}`,
              metadataJson: JSON.stringify(meta),
            },
          })
        );
      }

      // 2. Administrators
      const admins = await prisma.user.findMany({
        where: {
          role: { in: [UserRole.ADMIN, UserRole.BUREAU_OFFICER] },
          active: true,
        },
        select: { id: true },
      });
      for (const adm of admins) {
        notificationPromises.push(
          prisma.notification.create({
            data: {
              userId: adm.id,
              category: 'DOCUMENT_REQUEST',
              severity: 'INFO',
              title: `Document Request: ${docRequest.requestNumber}`,
              message: `${user.fullName} needs "${docRequest.title}" for scrutiny task.`,
              link: `/documents?tab=requests&id=${docRequest.id}`,
              metadataJson: JSON.stringify(meta),
            },
          })
        );
      }

      // 3. Department Officers (HR / Department Officer)
      const deptOfficers = await prisma.user.findMany({
        where: {
          role: { in: [UserRole.DEPARTMENT_OFFICER, UserRole.REGIONAL_OFFICER] },
          active: true,
        },
        select: { id: true, departmentId: true },
      });
      for (const off of deptOfficers) {
        notificationPromises.push(
          prisma.notification.create({
            data: {
              userId: off.id,
              category: 'DOCUMENT_REQUEST',
              severity: 'WARNING',
              title: `Department Request: ${docRequest.requestNumber}`,
              message: `Action required: Upload missing file "${docRequest.title}" requested by ${user.fullName}.`,
              link: `/documents?tab=requests&id=${docRequest.id}`,
              metadataJson: JSON.stringify(meta),
            },
          })
        );
      }

      // 4. Confirmation notification to the requesting Employee
      notificationPromises.push(
        prisma.notification.create({
          data: {
            userId: user.id,
            category: 'DOCUMENT_REQUEST',
            severity: 'INFO',
            title: `Request Submitted: ${docRequest.requestNumber}`,
            message: `Your request for "${docRequest.title}" was routed to HR and Administration.`,
            link: `/documents?tab=my-requests`,
            metadataJson: JSON.stringify(meta),
          },
        })
      );

      await Promise.allSettled(notificationPromises);

      return res.status(201).json({
        success: true,
        message: 'Document request successfully submitted and notifications dispatched.',
        data: docRequest,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * List document requests based on user role and filters.
   */
  static async listRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const canonical = getCanonicalRole(user.role);
      const {
        status,
        priority,
        departmentId,
        assignedToId,
        myRequestsOnly,
        search,
        page = '1',
        limit = '50',
      } = req.query;

      const where: any = {};

      // Role Scoping
      if (
        canonical === UserRole.EVALUATOR ||
        canonical === UserRole.FRESHER ||
        myRequestsOnly === 'true'
      ) {
        where.requesterId = user.id;
      } else if (canonical === UserRole.VIEWER) {
        // Viewer can see authorized requests or empty
        where.status = { not: 'REJECTED' };
      } else if (canonical === UserRole.DEPARTMENT_OFFICER) {
        // Department Officer can see department requests or all if not filtered
        if (departmentId) {
          where.departmentId = String(departmentId);
        } else if (user.departmentId) {
          where.OR = [
            { departmentId: user.departmentId },
            { assignedToId: user.id },
            { requesterId: user.id },
          ];
        }
      }

      // Additional Filters
      if (status) {
        where.status = String(status);
      }
      if (priority) {
        where.priority = String(priority);
      }
      if (assignedToId) {
        where.assignedToId = String(assignedToId);
      }
      if (search) {
        const query = String(search).trim();
        where.OR = [
          { title: { contains: query } },
          { requestNumber: { contains: query } },
          { reason: { contains: query } },
        ];
      }

      const take = Math.min(Math.max(parseInt(limit as string, 10) || 50, 1), 100);
      const skip = (Math.max(parseInt(page as string, 10) || 1, 1) - 1) * take;

      const [requests, total] = await Promise.all([
        prisma.documentRequest.findMany({
          where,
          include: {
            requester: {
              select: { id: true, fullName: true, email: true, role: true, designation: true },
            },
            assignedTo: {
              select: { id: true, fullName: true, email: true, role: true, designation: true },
            },
            department: true,
            category: true,
            task: { select: { id: true, title: true, status: true, progress: true } },
            application: { select: { id: true, applicationNumber: true, institution: true } },
            fulfilledDocument: {
              select: { id: true, fileName: true, originalName: true, status: true, uploadDate: true },
            },
            assignments: {
              include: {
                assignedTo: { select: { id: true, fullName: true, email: true } },
                assignedBy: { select: { id: true, fullName: true, email: true } },
              },
              orderBy: { timestamp: 'desc' },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take,
        }),
        prisma.documentRequest.count({ where }),
      ]);

      return res.json({
        success: true,
        data: {
          requests,
          total,
          page: parseInt(page as string, 10) || 1,
          limit: take,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get single document request details.
   */
  static async getRequestById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user!;
      const canonical = getCanonicalRole(user.role);

      const docRequest = await prisma.documentRequest.findUnique({
        where: { id },
        include: {
          requester: {
            select: { id: true, fullName: true, email: true, role: true, designation: true },
          },
          assignedTo: {
            select: { id: true, fullName: true, email: true, role: true, designation: true },
          },
          department: true,
          category: true,
          task: true,
          application: { include: { institution: true } },
          fulfilledDocument: {
            include: {
              uploader: { select: { id: true, fullName: true, email: true } },
              verifications: {
                include: { verifier: { select: { id: true, fullName: true } } },
                orderBy: { createdAt: 'desc' },
              },
            },
          },
          assignments: {
            include: {
              assignedTo: { select: { id: true, fullName: true, email: true } },
              assignedBy: { select: { id: true, fullName: true, email: true } },
            },
            orderBy: { timestamp: 'desc' },
          },
        },
      });

      if (!docRequest) {
        throw new AppError('Document request not found', 404);
      }

      // Confidentiality check for junior roles
      if (
        (canonical === UserRole.EVALUATOR || canonical === UserRole.FRESHER) &&
        docRequest.requesterId !== user.id
      ) {
        throw new AppError('Forbidden: Access denied to other employees\' document requests.', 403);
      }

      return res.json({ success: true, data: docRequest });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Assign a document request to an HR officer or Administrator.
   */
  static async assignRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user!;
      const { assignedToId, notes } = req.body;

      if (!assignedToId) {
        throw new AppError('assignedToId is required', 400);
      }

      const docRequest = await prisma.documentRequest.findUnique({ where: { id } });
      if (!docRequest) throw new AppError('Document request not found', 404);

      const targetUser = await prisma.user.findUnique({ where: { id: assignedToId } });
      if (!targetUser) throw new AppError('Assignee user not found', 404);

      // Update request
      const updated = await prisma.documentRequest.update({
        where: { id },
        data: {
          assignedToId,
          status: docRequest.status === 'SUBMITTED' ? 'ASSIGNED' : docRequest.status,
        },
        include: {
          requester: true,
          assignedTo: true,
        },
      });

      // Record assignment history
      await prisma.documentRequestAssignment.create({
        data: {
          requestId: id,
          assignedById: user.id,
          assignedToId,
          notes: notes?.trim() || null,
        },
      });

      // Notify the assignee
      await prisma.notification.create({
        data: {
          userId: assignedToId,
          category: 'DOCUMENT_REQUEST',
          severity: 'INFO',
          title: `Document Request Assigned: ${docRequest.requestNumber}`,
          message: `${user.fullName} assigned you to fulfill "${docRequest.title}" for ${updated.requester.fullName}.`,
          link: `/documents?tab=requests&id=${id}`,
        },
      });

      await logAuditEvent({
        req,
        action: 'DOCUMENT_REQUEST_ASSIGNED',
        entityType: 'DocumentRequest',
        entityId: id,
        reason: `Request assigned to ${targetUser.fullName} by ${user.fullName}`,
      });

      return res.json({
        success: true,
        message: `Request successfully assigned to ${targetUser.fullName}`,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Update request status (e.g. IN_PROGRESS, REJECTED, CLOSED).
   */
  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user!;
      const { status, rejectionReason, clarificationNotes } = req.body;

      const validStatuses = [
        'SUBMITTED',
        'PENDING_ASSIGNMENT',
        'ASSIGNED',
        'IN_PROGRESS',
        'DOCUMENT_UPLOADED',
        'AVAILABLE_FOR_EMPLOYEE',
        'REJECTED',
        'CLOSED',
      ];

      if (!status || !validStatuses.includes(status)) {
        throw new AppError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
      }

      if (status === 'REJECTED' && (!rejectionReason || !rejectionReason.trim())) {
        throw new AppError('A clear justification/rejectionReason is mandatory when rejecting a document request.', 400);
      }

      const docRequest = await prisma.documentRequest.findUnique({
        where: { id },
        include: { requester: true },
      });
      if (!docRequest) throw new AppError('Document request not found', 404);

      const updated = await prisma.documentRequest.update({
        where: { id },
        data: {
          status,
          rejectionReason: rejectionReason?.trim() || docRequest.rejectionReason,
          clarificationNotes: clarificationNotes?.trim() || docRequest.clarificationNotes,
        },
      });

      // Notify requesting employee
      let message = `Your document request ${docRequest.requestNumber} status changed to ${status}.`;
      if (status === 'REJECTED') {
        message = `Your request ${docRequest.requestNumber} for "${docRequest.title}" was declined: ${rejectionReason}`;
      } else if (status === 'AVAILABLE_FOR_EMPLOYEE') {
        message = `Good news! Requested document "${docRequest.title}" is verified and now available in your documents.`;
      }

      await prisma.notification.create({
        data: {
          userId: docRequest.requesterId,
          category: status === 'REJECTED' ? 'DOCUMENT_REJECTED' : 'DOCUMENT_AVAILABLE',
          severity: status === 'REJECTED' ? 'WARNING' : 'INFO',
          title: `Request ${docRequest.requestNumber} Update`,
          message,
          link: `/documents?tab=my-requests`,
        },
      });

      await logAuditEvent({
        req,
        action: 'DOCUMENT_REQUEST_STATUS_UPDATED',
        entityType: 'DocumentRequest',
        entityId: id,
        reason: `Status changed from ${docRequest.status} to ${status} by ${user.fullName}`,
      });

      return res.json({
        success: true,
        message: `Request status updated to ${status}`,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Request statistics summary.
   */
  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const [
        total,
        submitted,
        assigned,
        inProgress,
        available,
        rejected,
        closed,
        urgent,
      ] = await Promise.all([
        prisma.documentRequest.count(),
        prisma.documentRequest.count({ where: { status: 'SUBMITTED' } }),
        prisma.documentRequest.count({ where: { status: 'ASSIGNED' } }),
        prisma.documentRequest.count({ where: { status: 'IN_PROGRESS' } }),
        prisma.documentRequest.count({ where: { status: 'AVAILABLE_FOR_EMPLOYEE' } }),
        prisma.documentRequest.count({ where: { status: 'REJECTED' } }),
        prisma.documentRequest.count({ where: { status: 'CLOSED' } }),
        prisma.documentRequest.count({ where: { priority: 'URGENT', status: { notIn: ['CLOSED', 'REJECTED', 'AVAILABLE_FOR_EMPLOYEE'] } } }),
      ]);

      return res.json({
        success: true,
        data: {
          total,
          submitted,
          assigned,
          inProgress,
          available,
          rejected,
          closed,
          pending: submitted + assigned + inProgress,
          urgent,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}

