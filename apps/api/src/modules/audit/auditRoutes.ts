import { Router } from 'express';
import { AuditController } from './auditController';
import { authenticate } from '../../middleware/auth';

export const auditRouter = Router();

auditRouter.use(authenticate);

auditRouter.get('/', AuditController.list);

