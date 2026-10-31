import { Router } from 'express';
import { DocumentController } from './documentController';
import { authenticate, requirePermission } from '../../middleware/auth';
import { upload } from '../../middleware/upload';
import { Permission } from '@regulaflow/shared';

export const documentRouter = Router();

documentRouter.use(authenticate);

// Telemetry & Categories
documentRouter.get('/stats/overview', DocumentController.getStats);
documentRouter.get('/categories/list', DocumentController.listCategories);
documentRouter.post(
  '/categories',
  requirePermission(Permission.DOCUMENT_CATEGORY_MANAGE),
  DocumentController.createCategory
);

// Core Document Repository
documentRouter.get('/', DocumentController.listDocuments);
documentRouter.post('/upload', upload.single('file'), DocumentController.uploadDocument);
documentRouter.get('/:id', DocumentController.getDocumentById);
documentRouter.post(
  '/:id/verify',
  requirePermission(Permission.DOCUMENT_VERIFY),
  DocumentController.verifyDocument
);
documentRouter.get('/:id/download', DocumentController.downloadSecure);
documentRouter.get('/:id/preview', DocumentController.previewSecure);
documentRouter.delete('/:id', DocumentController.deleteDocument);
