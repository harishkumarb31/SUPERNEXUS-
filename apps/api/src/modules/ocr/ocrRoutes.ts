import { Router } from 'express';
import { OcrController } from './ocrController';
import { authenticate, requireRole } from '../../middleware/auth';
import { UserRole } from '@regulaflow/shared';

export const ocrRouter = Router();

ocrRouter.use(authenticate);

ocrRouter.post('/process', OcrController.triggerOcr);
ocrRouter.get('/:documentId', OcrController.getExtraction);
ocrRouter.put(
  '/:documentId/fields',
  requireRole(UserRole.REGIONAL_OFFICER, UserRole.BUREAU_OFFICER, UserRole.SYSTEM_ADMIN),
  OcrController.updateFields
);

