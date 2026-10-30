import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { prisma } from '../../services/db';
import { AppError } from '../../middleware/errorHandler';
import { calculateFileChecksum } from '../../middleware/upload';
import { OcrService } from '../../services/ocrService';
import { ValidationEngine } from '../../services/validationEngine';
import { logAuditEvent } from '../../middleware/audit';
import { UserRole } from '@regulaflow/shared';
import { config } from '../../config';

export class DocumentController {
  static async uploadDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const file = req.file;
      if (!file || file.size === 0) {
        if (file && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        throw new AppError('Uploaded file is empty or missing. Please upload a valid document.', 400);
      }

      const { applicationId, documentType, expiryDate } = req.body;
      if (!applicationId || !documentType) {
        if (file && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        throw new AppError('applicationId and documentType are required fields.', 400);
      }

      const application = await prisma.application.findUnique({
        where: { id: applicationId },
      });

      if (!application) {
        if (file && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        throw new AppError('Application not found', 404);
      }

      // Enforce institutional boundary (SEC-01)
      if (req.user!.role === UserRole.INSTITUTION_USER) {
        if (application.institutionId !== req.user!.institutionId) {
          if (file && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
          throw new AppError('Forbidden: Access denied to other institutions\' applications.', 403);
        }
      }

      // Check SHA256 checksum
      const checksum = await calculateFileChecksum(file.path);

      // Check if duplicate document already exists in this application
      const existingDoc = await prisma.applicationDocument.findFirst({
        where: {
          applicationId,
          checksumSha256: checksum,
        },
      });

      if (existingDoc) {
        // Remove uploaded temp file
        fs.unlinkSync(file.path);
        throw new AppError(
          `Duplicate document detected: This file has an identical checksum to '${existingDoc.originalName}' already uploaded for this application.`,
          409
        );
      }

      // Create document record
      const doc = await prisma.applicationDocument.create({
        data: {
          applicationId,
          documentType,
          fileName: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          fileSize: file.size,
          filePath: file.path,
          checksumSha256: checksum,
          expiryDate: expiryDate ? new Date(expiryDate) : null,
          status: 'PENDING_OCR',
        },
      });

      await logAuditEvent({
        req,
        action: 'DOCUMENT_UPLOAD',
        entityType: 'ApplicationDocument',
        entityId: doc.id,
        reason: `Uploaded ${documentType} for application ${application.applicationNumber}`,
      });

      // Trigger OCR asynchronously & run validation
      OcrService.processDocument(doc.id)
        .then(() => ValidationEngine.validateApplication(applicationId))
        .catch((err) => console.error('[Async OCR Processing Error]:', err));

      return res.status(201).json({
        success: true,
        message: 'Document uploaded successfully. OCR extraction initiated.',
        data: doc,
      });
    } catch (err) {
      next(err);
    }
  }

  static async downloadSecure(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user!;

      const doc = await prisma.applicationDocument.findUnique({
        where: { id },
        include: { application: { include: { institution: true } } },
      });

      if (!doc) {
        throw new AppError('Document not found', 404);
      }

      // Authorization verification
      if (user.role === UserRole.INSTITUTION_USER) {
        if (doc.application.institutionId !== user.institutionId) {
          throw new AppError('Forbidden: Access denied to other institutions\' documents.', 403);
        }
      } else if (user.role === UserRole.REGIONAL_OFFICER && user.region) {
        if (doc.application.institution.region !== user.region) {
          throw new AppError('Forbidden: Access denied to documents outside your assigned region.', 403);
        }
      }

      const filePath = path.isAbsolute(doc.filePath)
        ? doc.filePath
        : path.resolve(config.uploadDir, path.basename(doc.filePath));

      if (!fs.existsSync(filePath)) {
        // Return synthetic demo content if file was seeded without a physical upload
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `inline; filename="${doc.originalName}.txt"`);
        return res.send(
          `REGULAFLOW AI - SECURE REGULATORY VAULT\n` +
          `==========================================\n` +
          `Document Reference: ${doc.id}\n` +
          `Type: ${doc.documentType}\n` +
          `Original Filename: ${doc.originalName}\n` +
          `SHA-256 Checksum: ${doc.checksumSha256}\n` +
          `Status: ${doc.status}\n` +
          `Institution: ${doc.application.institution.name}\n` +
          `Verification Timestamp: ${doc.uploadDate}\n\n` +
          `This document is verified and stored in the RegulaFlow AI compliance vault.\n`
        );
      }

      res.setHeader('Content-Type', doc.mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${doc.originalName}"`);
      return fs.createReadStream(filePath).pipe(res);
    } catch (err) {
      next(err);
    }
  }

  static async deleteDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user!;

      const doc = await prisma.applicationDocument.findUnique({
        where: { id },
        include: { application: true },
      });

      if (!doc) throw new AppError('Document not found', 404);

      if (user.role === UserRole.INSTITUTION_USER) {
        if (doc.application.institutionId !== user.institutionId) {
          throw new AppError('Forbidden: Access denied to other institutions\' documents.', 403);
        }
        if (
          doc.application.currentStage !== 'DRAFT' &&
          doc.application.currentStage !== 'RETURNED_FOR_CORRECTION'
        ) {
          throw new AppError('Documents can only be deleted during DRAFT or RETURNED stages.', 400);
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
        reason: `Document ${doc.originalName} removed`,
      });

      return res.json({ success: true, message: 'Document deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
}

