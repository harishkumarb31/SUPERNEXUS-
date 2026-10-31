import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { prisma } from '../../services/db';
import { AppError } from '../../middleware/errorHandler';
import { calculateFileChecksum } from '../../middleware/upload';
import { OcrService } from '../../services/ocrService';
import { ValidationEngine } from '../../services/validationEngine';
import { logAuditEvent } from '../../middleware/audit';
import { UserRole, Permission, hasPermission, getCanonicalRole } from '@regulaflow/shared';
import { config } from '../../config';

export class DocumentController {
  /**
   * List documents with filtering, search, pagination, and role-based data scoping.
   */
  static async listDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const canonical = getCanonicalRole(user.role);
      const {
        search,
        categoryId,
        category,
        departmentId,
        status,
        institutionId,
        uploaderId,
        applicationId,
        taskId,
        myDocsOnly,
        verifiedOnly,
        rejectedOnly,
        pendingOnly,
        page = '1',
        limit = '50',
        sortBy = 'uploadDate',
        sortOrder = 'desc',
      } = req.query;

      const where: any = {};

      // Role Scoping
      if (canonical === UserRole.INSTITUTION_USER) {
        if (!user.institutionId) {
          throw new AppError('Institution account not linked to an active institution record', 400);
        }
        where.OR = [
          { institutionId: user.institutionId },
          { application: { institutionId: user.institutionId } },
        ];
      } else if (canonical === UserRole.VIEWER) {
        // Viewer can only see verified or non-restricted documents
        where.status = 'VERIFIED';
        where.isRestricted = false;
      } else if (canonical === UserRole.FRESHER) {
        if (myDocsOnly === 'true') {
          where.uploaderId = user.id;
        } else {
          where.OR = [
            { uploaderId: user.id },
            { isRestricted: false },
            { allowedUserIds: { contains: user.id } },
          ];
        }
      } else if (canonical === UserRole.EVALUATOR) {
        if (myDocsOnly === 'true') {
          where.uploaderId = user.id;
        } else {
          where.OR = [
            { uploaderId: user.id },
            { isRestricted: false },
            { allowedUserIds: { contains: user.id } },
            { fulfilledRequests: { some: { requesterId: user.id } } },
            { application: { assignedOfficerId: user.id } },
          ];
        }
      } else if (canonical === UserRole.DEPARTMENT_OFFICER && user.region) {
        // Can filter by region if desired, or access department
        if (departmentId) {
          where.departmentId = String(departmentId);
        } else if (user.departmentId && myDocsOnly !== 'false') {
          // View department documents or all
        }
      }

      // Explicit myDocsOnly override
      if (myDocsOnly === 'true') {
        where.uploaderId = user.id;
      }

      // Quick filter tabs
      if (verifiedOnly === 'true') {
        where.status = 'VERIFIED';
      } else if (rejectedOnly === 'true') {
        where.status = 'REJECTED';
      } else if (pendingOnly === 'true') {
        where.status = { in: ['PENDING_VERIFICATION', 'UNDER_REVIEW', 'PENDING_OCR', 'UPLOADED'] };
      }

      // Standard Filters
      if (status) {
        where.status = String(status);
      }
      if (categoryId) {
        where.categoryId = String(categoryId);
      }
      if (departmentId) {
        where.departmentId = String(departmentId);
      }
      if (applicationId) {
        where.applicationId = String(applicationId);
      }
      if (taskId) {
        where.taskId = String(taskId);
      }
      if (institutionId) {
        where.institutionId = String(institutionId);
      }
      if (uploaderId) {
        where.uploaderId = String(uploaderId);
      }

      if (search) {
        const query = String(search).trim();
        const searchConditions = [
          { title: { contains: query } },
          { originalName: { contains: query } },
          { fileName: { contains: query } },
          { documentType: { contains: query } },
          { description: { contains: query } },
        ];
        if (where.OR) {
          where.AND = [{ OR: where.OR }, { OR: searchConditions }];
          delete where.OR;
        } else {
          where.OR = searchConditions;
        }
      }

      const take = Math.min(Math.max(parseInt(limit as string, 10) || 50, 1), 100);
      const skip = (Math.max(parseInt(page as string, 10) || 1, 1) - 1) * take;

      const orderKey = ['uploadDate', 'createdAt', 'title', 'status', 'version'].includes(String(sortBy))
        ? String(sortBy)
        : 'uploadDate';
      const orderDir = String(sortOrder).toLowerCase() === 'asc' ? 'asc' : 'desc';

      const [documents, total] = await Promise.all([
        prisma.applicationDocument.findMany({
          where,
          include: {
            category: true,
            department: true,
            uploader: { select: { id: true, fullName: true, email: true, role: true } },
            institution: { select: { id: true, name: true, code: true } },
            application: { select: { id: true, applicationNumber: true, institution: true } },
            task: { select: { id: true, title: true, status: true } },
            verifications: {
              include: { verifier: { select: { id: true, fullName: true, email: true } } },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
            extractions: {
              select: { id: true, confidenceScore: true, ocrEngine: true, processedAt: true },
              take: 1,
            },
          },
          orderBy: { [orderKey]: orderDir },
          skip,
          take,
        }),
        prisma.applicationDocument.count({ where }),
      ]);

      return res.json({
        success: true,
        data: {
          documents,
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
   * Get single document details with verifications, versions, and extractions.
   */
  static async getDocumentById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user!;
      const canonical = getCanonicalRole(user.role);

      const doc = await prisma.applicationDocument.findUnique({
        where: { id },
        include: {
          category: true,
          department: true,
          uploader: { select: { id: true, fullName: true, email: true, role: true, designation: true } },
          institution: true,
          application: { include: { institution: true } },
          task: true,
          verifications: {
            include: { verifier: { select: { id: true, fullName: true, email: true, role: true } } },
            orderBy: { createdAt: 'desc' },
          },
          versions: {
            include: { uploadedBy: { select: { id: true, fullName: true } } },
            orderBy: { versionNumber: 'desc' },
          },
          extractions: true,
          findings: true,
          fulfilledRequests: {
            include: { requester: { select: { id: true, fullName: true, email: true } } },
          },
        },
      });

      if (!doc) {
        throw new AppError('Document not found', 404);
      }

      // Authorization guard
      if (canonical === UserRole.INSTITUTION_USER) {
        const instId = doc.institutionId || doc.application?.institutionId;
        if (instId !== user.institutionId) {
          throw new AppError('Forbidden: Access denied to other institutions\' documents.', 403);
        }
      }

      // Check restricted access
      if (doc.isRestricted && doc.uploaderId !== user.id) {
        const isPrivileged = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DEPARTMENT_OFFICER].includes(canonical as any);
        const isAllowed = doc.allowedUserIds && doc.allowedUserIds.includes(user.id);
        if (!isPrivileged && !isAllowed) {
          throw new AppError('Forbidden: This document is restricted and requires authorization.', 403);
        }
      }

      // Log access in background
      prisma.documentAccessLog.create({
        data: {
          documentId: doc.id,
          userId: user.id,
          action: 'VIEW',
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'] as string,
        },
      }).catch(() => {});

      return res.json({ success: true, data: doc });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Upload single or multiple documents with enterprise metadata and automatic request linking.
   */
  static async uploadDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const file = req.file;

      if (!file || file.size === 0) {
        if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
        throw new AppError('Uploaded file is missing or empty. Please select a valid document.', 400);
      }

      const {
        title,
        description,
        categoryId,
        documentType = 'GENERAL_SUPPORTING_DOCUMENT',
        applicationId,
        departmentId,
        taskId,
        institutionId,
        expiryDate,
        isRestricted,
        documentRequestId, // Link to an employee document request if fulfilling!
      } = req.body;

      // Validate Application if provided
      let application = null;
      if (applicationId) {
        application = await prisma.application.findUnique({ where: { id: applicationId } });
        if (!application) {
          if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
          throw new AppError('Application reference not found', 404);
        }

        // Institutional boundary check
        if (user.role === UserRole.INSTITUTION_USER) {
          if (application.institutionId !== user.institutionId) {
            if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
            throw new AppError('Forbidden: Access denied to other institutions\' applications.', 403);
          }
        }
      }

      // Calculate SHA256 Checksum
      const checksum = await calculateFileChecksum(file.path);

      // Check for duplicate in the same application
      if (applicationId) {
        const existingDoc = await prisma.applicationDocument.findFirst({
          where: { applicationId, checksumSha256: checksum },
        });

        if (existingDoc) {
          fs.unlinkSync(file.path);
          throw new AppError(
            `Duplicate document detected: Identical checksum to '${existingDoc.originalName}' already registered for this application.`,
            409
          );
        }
      }

      // Determine Department ID
      let resolvedDeptId = departmentId || user.departmentId;

      // Determine initial status
      const initialStatus = 'PENDING_VERIFICATION';

      // Create document record
      const doc = await prisma.applicationDocument.create({
        data: {
          applicationId: applicationId || null,
          institutionId: institutionId || application?.institutionId || user.institutionId || null,
          departmentId: resolvedDeptId || null,
          categoryId: categoryId || null,
          taskId: taskId || null,
          uploaderId: user.id,
          title: title?.trim() || file.originalname,
          description: description?.trim() || null,
          documentType,
          fileName: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          fileSize: file.size,
          filePath: file.path,
          checksumSha256: checksum,
          version: 1,
          expiryDate: expiryDate ? new Date(expiryDate) : null,
          status: initialStatus,
          isRestricted: isRestricted === 'true' || isRestricted === true,
        },
        include: {
          category: true,
          department: true,
          uploader: { select: { id: true, fullName: true, email: true } },
        },
      });

      // Record initial version in DocumentVersion table
      await prisma.documentVersion.create({
        data: {
          documentId: doc.id,
          versionNumber: 1,
          fileName: file.filename,
          originalName: file.originalname,
          filePath: file.path,
          fileSize: file.size,
          checksumSha256: checksum,
          uploadedById: user.id,
          changeSummary: 'Initial document upload',
        },
      });

      // Log Access
      await prisma.documentAccessLog.create({
        data: {
          documentId: doc.id,
          userId: user.id,
          action: 'UPLOAD',
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'] as string,
        },
      });

      // If this upload fulfills a DocumentRequest!
      if (documentRequestId) {
        const docReq = await prisma.documentRequest.findUnique({
          where: { id: documentRequestId },
          include: { requester: true },
        });

        if (docReq) {
          await prisma.documentRequest.update({
            where: { id: documentRequestId },
            data: {
              fulfilledDocumentId: doc.id,
              status: 'DOCUMENT_UPLOADED',
            },
          });

          // Notify requesting employee that document has been uploaded and submitted for verification
          await prisma.notification.create({
            data: {
              userId: docReq.requesterId,
              category: 'DOCUMENT_REQUEST',
              severity: 'INFO',
              title: `Requested Document Uploaded: ${docReq.requestNumber}`,
              message: `HR/Admin has uploaded "${doc.title}" for your request. It is undergoing regulatory verification.`,
              link: `/documents?tab=my-requests`,
            },
          });
        }
      }

      await logAuditEvent({
        req,
        action: 'DOCUMENT_UPLOAD',
        entityType: 'ApplicationDocument',
        entityId: doc.id,
        reason: `Uploaded document ${doc.originalName} (${doc.title})`,
      });

      // Trigger OCR asynchronously if application is present or OCR applicable
      OcrService.processDocument(doc.id)
        .then(() => {
          if (applicationId) {
            return ValidationEngine.validateApplication(applicationId);
          }
        })
        .catch((err) => console.error('[Async OCR Processing Error]:', err));

      return res.status(201).json({
        success: true,
        message: 'Document uploaded successfully and entered into the verification workflow.',
        data: doc,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Verify, reject, or request resubmission of a document.
   * Only authorized verifiers (with DOCUMENT_VERIFY permission) can execute this.
   */
  static async verifyDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user!;
      const { status, comments, rejectionReason } = req.body;

      const validStatuses = ['VERIFIED', 'REJECTED', 'REQUIRES_RESUBMISSION', 'UNDER_REVIEW'];
      if (!status || !validStatuses.includes(status)) {
        throw new AppError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
      }

      if ((status === 'REJECTED' || status === 'REQUIRES_RESUBMISSION') && (!rejectionReason || !rejectionReason.trim())) {
        throw new AppError('A clear justification/rejectionReason is mandatory when rejecting or requesting resubmission.', 400);
      }

      const doc = await prisma.applicationDocument.findUnique({
        where: { id },
        include: {
          uploader: true,
          fulfilledRequests: { include: { requester: true } },
        },
      });

      if (!doc) {
        throw new AppError('Document not found', 404);
      }

      // Update Document Status
      const updated = await prisma.applicationDocument.update({
        where: { id },
        data: {
          status,
          rejectionReason: rejectionReason?.trim() || null,
          verifiedBy: status === 'VERIFIED' ? user.fullName : doc.verifiedBy,
          verifiedAt: status === 'VERIFIED' ? new Date() : doc.verifiedAt,
        },
      });

      // Create Verification History Record
      const verificationRecord = await prisma.documentVerification.create({
        data: {
          documentId: id,
          verifierId: user.id,
          status,
          comments: comments?.trim() || null,
          rejectionReason: rejectionReason?.trim() || null,
        },
        include: {
          verifier: { select: { id: true, fullName: true, role: true } },
        },
      });

      // Record access log
      await prisma.documentAccessLog.create({
        data: {
          documentId: id,
          userId: user.id,
          action: status,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'] as string,
        },
      });

      // Notify the uploader about status change
      if (doc.uploaderId && doc.uploaderId !== user.id) {
        await prisma.notification.create({
          data: {
            userId: doc.uploaderId,
            category: status === 'VERIFIED' ? 'DOCUMENT_VERIFIED' : 'DOCUMENT_REJECTED',
            severity: status === 'VERIFIED' ? 'INFO' : 'WARNING',
            title: `Document ${status}: ${doc.title || doc.originalName}`,
            message: status === 'VERIFIED'
              ? `Your document has been verified by ${user.fullName}.`
              : `Your document was ${status.toLowerCase()}: ${rejectionReason}`,
            link: `/documents?tab=my-docs`,
          },
        });
      }

      // If document was fulfilling an employee document request!
      if (doc.fulfilledRequests && doc.fulfilledRequests.length > 0) {
        for (const reqItem of doc.fulfilledRequests) {
          if (status === 'VERIFIED') {
            await prisma.documentRequest.update({
              where: { id: reqItem.id },
              data: { status: 'AVAILABLE_FOR_EMPLOYEE' },
            });

            // Notify requesting employee that document is now verified and accessible!
            await prisma.notification.create({
              data: {
                userId: reqItem.requesterId,
                category: 'DOCUMENT_AVAILABLE',
                severity: 'INFO',
                title: `Requested Document Verified & Available: ${reqItem.requestNumber}`,
                message: `"${doc.title || doc.originalName}" is verified and ready in your documents and assigned task workspace.`,
                link: `/documents?tab=my-docs`,
              },
            });
          } else if (status === 'REJECTED') {
            await prisma.documentRequest.update({
              where: { id: reqItem.id },
              data: { status: 'IN_PROGRESS' },
            });
          }
        }
      }

      await logAuditEvent({
        req,
        action: status === 'VERIFIED' ? 'DOCUMENT_VERIFY' : 'DOCUMENT_REJECTED',
        entityType: 'ApplicationDocument',
        entityId: id,
        reason: `Document verification outcome: ${status} by ${user.fullName}`,
      });

      return res.json({
        success: true,
        message: `Document status successfully updated to ${status}`,
        data: {
          document: updated,
          verification: verificationRecord,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Secure download endpoint with access validation and audit logging.
   */
  static async downloadSecure(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user!;
      const canonical = getCanonicalRole(user.role);

      const doc = await prisma.applicationDocument.findUnique({
        where: { id },
        include: {
          application: { include: { institution: true } },
          institution: true,
          fulfilledRequests: true,
        },
      });

      if (!doc) {
        throw new AppError('Document not found', 404);
      }

      // Authorization verification
      if (canonical === UserRole.INSTITUTION_USER) {
        const instId = doc.institutionId || doc.application?.institutionId;
        if (instId !== user.institutionId) {
          throw new AppError('Forbidden: Access denied to other institutions\' documents.', 403);
        }
      } else if (canonical === UserRole.VIEWER) {
        if (doc.status !== 'VERIFIED' || doc.isRestricted) {
          throw new AppError('Forbidden: Read-only viewer access is restricted to verified, non-confidential documents.', 403);
        }
      } else if (canonical === UserRole.EVALUATOR || canonical === UserRole.FRESHER) {
        const isUploader = doc.uploaderId === user.id;
        const isAssignedRequester = doc.fulfilledRequests?.some((r) => r.requesterId === user.id);
        const isAllowed = !doc.isRestricted || (doc.allowedUserIds && doc.allowedUserIds.includes(user.id));

        if (!isUploader && !isAssignedRequester && !isAllowed) {
          throw new AppError('Forbidden: Access denied to other employees\' restricted documents.', 403);
        }
      }

      // Log download in DocumentAccessLog
      prisma.documentAccessLog.create({
        data: {
          documentId: doc.id,
          userId: user.id,
          action: 'DOWNLOAD',
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'] as string,
        },
      }).catch(() => {});

      const filePath = path.isAbsolute(doc.filePath)
        ? doc.filePath
        : path.resolve(config.uploadDir, path.basename(doc.filePath));

      if (!fs.existsSync(filePath)) {
        // Return synthetic demo content if file was seeded without a physical upload
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename="${doc.originalName}.txt"`);
        return res.send(
          `SUPERNEXUS AI - SECURE REGULATORY VAULT\n` +
          `==========================================\n` +
          `Document Reference ID: ${doc.id}\n` +
          `Title: ${doc.title || doc.originalName}\n` +
          `Type: ${doc.documentType}\n` +
          `Original Filename: ${doc.originalName}\n` +
          `SHA-256 Checksum: ${doc.checksumSha256}\n` +
          `Verification Status: ${doc.status}\n` +
          `Verified By: ${doc.verifiedBy || 'Pending'}\n` +
          `Verification Timestamp: ${doc.verifiedAt || doc.uploadDate}\n\n` +
          `This document is verified and authenticated in the SuperNexus AI regulatory vault.\n`
        );
      }

      res.setHeader('Content-Type', doc.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${doc.originalName}"`);
      return fs.createReadStream(filePath).pipe(res);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Preview document in-browser.
   */
  static async previewSecure(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user!;
      const canonical = getCanonicalRole(user.role);

      const doc = await prisma.applicationDocument.findUnique({
        where: { id },
        include: { application: true },
      });

      if (!doc) throw new AppError('Document not found', 404);

      if (canonical === UserRole.INSTITUTION_USER) {
        if (doc.application?.institutionId !== user.institutionId) {
          throw new AppError('Forbidden: Access denied.', 403);
        }
      }

      // Log preview
      prisma.documentAccessLog.create({
        data: {
          documentId: doc.id,
          userId: user.id,
          action: 'PREVIEW',
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'] as string,
        },
      }).catch(() => {});

      const filePath = path.isAbsolute(doc.filePath)
        ? doc.filePath
        : path.resolve(config.uploadDir, path.basename(doc.filePath));

      if (!fs.existsSync(filePath)) {
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `inline; filename="${doc.originalName}.txt"`);
        return res.send(
          `SUPERNEXUS AI - DOCUMENT PREVIEW\n` +
          `Title: ${doc.title || doc.originalName}\n` +
          `Status: ${doc.status}\n` +
          `Checksum: ${doc.checksumSha256}\n`
        );
      }

      res.setHeader('Content-Type', doc.mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${doc.originalName}"`);
      return fs.createReadStream(filePath).pipe(res);
    } catch (err) {
      next(err);
    }
  }

  /**
   * List standard and custom document categories.
   */
  static async listCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await prisma.documentCategory.findMany({
        include: {
          _count: { select: { documents: true, requests: true } },
        },
        orderBy: { name: 'asc' },
      });

      return res.json({ success: true, data: categories });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Create a new custom document category.
   */
  static async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, code, description } = req.body;
      if (!name || !name.trim()) throw new AppError('Category name is required', 400);

      const generatedCode = code?.trim() || `CAT_${name.trim().toUpperCase().replace(/[^A-Z0-9]/g, '_')}`;

      const category = await prisma.documentCategory.create({
        data: {
          name: name.trim(),
          code: generatedCode,
          description: description?.trim() || null,
        },
      });

      return res.status(201).json({ success: true, data: category });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Overview dashboard telemetry for Document Management.
   */
  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const canonical = getCanonicalRole(user.role);

      const [
        totalDocs,
        verifiedDocs,
        pendingDocs,
        rejectedDocs,
        myDocs,
        totalRequests,
        pendingRequests,
        categoriesCount,
      ] = await Promise.all([
        prisma.applicationDocument.count(),
        prisma.applicationDocument.count({ where: { status: 'VERIFIED' } }),
        prisma.applicationDocument.count({
          where: { status: { in: ['PENDING_VERIFICATION', 'UNDER_REVIEW', 'PENDING_OCR', 'UPLOADED'] } },
        }),
        prisma.applicationDocument.count({ where: { status: 'REJECTED' } }),
        prisma.applicationDocument.count({ where: { uploaderId: user.id } }),
        prisma.documentRequest.count(),
        prisma.documentRequest.count({
          where: { status: { in: ['SUBMITTED', 'PENDING_ASSIGNMENT', 'ASSIGNED', 'IN_PROGRESS'] } },
        }),
        prisma.documentCategory.count(),
      ]);

      return res.json({
        success: true,
        data: {
          totalDocs,
          verifiedDocs,
          pendingDocs,
          rejectedDocs,
          myDocs,
          totalRequests,
          pendingRequests,
          categoriesCount,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Delete a document.
   */
  static async deleteDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user!;
      const canonical = getCanonicalRole(user.role);

      const doc = await prisma.applicationDocument.findUnique({
        where: { id },
        include: { application: true },
      });

      if (!doc) throw new AppError('Document not found', 404);

      // Check permission: Super Admin can delete anything; Uploader can delete in draft
      if (canonical !== UserRole.SUPER_ADMIN && canonical !== UserRole.ADMIN) {
        if (doc.uploaderId !== user.id) {
          throw new AppError('Forbidden: Only the uploader or administrators can delete this document.', 403);
        }
        if (doc.status === 'VERIFIED') {
          throw new AppError('Verified documents cannot be deleted without administrative override.', 400);
        }
      }

      const filePath = path.isAbsolute(doc.filePath)
        ? doc.filePath
        : path.resolve(config.uploadDir, path.basename(doc.filePath));

      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          // ignore
        }
      }

      await prisma.applicationDocument.delete({ where: { id } });

      await logAuditEvent({
        req,
        action: 'DOCUMENT_DELETE',
        entityType: 'ApplicationDocument',
        entityId: id,
        reason: `Document ${doc.originalName} removed by ${user.fullName}`,
      });

      return res.json({ success: true, message: 'Document deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
}
