import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../services/db';
import { OcrService } from '../../services/ocrService';
import { ValidationEngine } from '../../services/validationEngine';
import { AppError } from '../../middleware/errorHandler';
import { logAuditEvent } from '../../middleware/audit';

export class OcrController {
  static async triggerOcr(req: Request, res: Response, next: NextFunction) {
    try {
      const { documentId } = req.body;
      if (!documentId) {
        throw new AppError('documentId is required', 400);
      }

      const result = await OcrService.processDocument(documentId);
      const doc = await prisma.applicationDocument.findUnique({ where: { id: documentId } });

      if (doc && doc.applicationId) {
        await ValidationEngine.validateApplication(doc.applicationId);
      }

      await logAuditEvent({
        req,
        action: 'OCR_EXECUTE',
        entityType: 'ApplicationDocument',
        entityId: documentId,
        reason: 'Manual or triggered OCR text extraction and field detection',
      });

      return res.json({
        success: true,
        message: 'OCR processed successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getExtraction(req: Request, res: Response, next: NextFunction) {
    try {
      const { documentId } = req.params;

      const extraction = await prisma.documentExtraction.findFirst({
        where: { documentId },
        orderBy: { processedAt: 'desc' },
      });

      if (!extraction) {
        throw new AppError('No extraction record found for this document', 404);
      }

      return res.json({
        success: true,
        data: {
          ...extraction,
          extractedFields: extraction.extractedFieldsJson ? JSON.parse(extraction.extractedFieldsJson) : {},
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateFields(req: Request, res: Response, next: NextFunction) {
    try {
      const { documentId } = req.params;
      const { fields, reason } = req.body;

      const extraction = await prisma.documentExtraction.findFirst({
        where: { documentId },
        orderBy: { processedAt: 'desc' },
      });

      if (!extraction) {
        throw new AppError('Extraction not found', 404);
      }

      const updated = await prisma.documentExtraction.update({
        where: { id: extraction.id },
        data: {
          extractedFieldsJson: JSON.stringify(fields),
        },
      });

      await logAuditEvent({
        req,
        action: 'OCR_FIELDS_CORRECTED',
        entityType: 'DocumentExtraction',
        entityId: extraction.id,
        beforeState: extraction.extractedFieldsJson,
        afterState: JSON.stringify(fields),
        reason: reason || 'Officer manually corrected OCR-extracted fields',
      });

      return res.json({
        success: true,
        message: 'Extracted fields updated successfully',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }
}

