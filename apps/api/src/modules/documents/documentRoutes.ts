import { Router } from 'express';
import { DocumentController } from './documentController';
import { authenticate } from '../../middleware/auth';
import { upload } from '../../middleware/upload';

export const documentRouter = Router();

documentRouter.use(authenticate);

documentRouter.post('/upload', upload.single('file'), DocumentController.uploadDocument);
documentRouter.get('/:id/download', DocumentController.downloadSecure);
documentRouter.delete('/:id', DocumentController.deleteDocument);
