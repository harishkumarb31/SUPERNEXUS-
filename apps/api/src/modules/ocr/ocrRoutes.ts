import { Router } from 'express';
import { OcrController } from './ocrController';
import { authenticate } from '../../middleware/auth';

export const ocrRouter = Router();

ocrRouter.use(authenticate);

ocrRouter.post('/process', OcrController.triggerOcr);
ocrRouter.get('/:documentId', OcrController.getExtraction);
ocrRouter.put('/:documentId/fields', OcrController.updateFields);
