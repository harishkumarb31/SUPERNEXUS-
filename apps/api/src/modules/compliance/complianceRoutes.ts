import { Router } from 'express';
import { ComplianceController } from './complianceController';
import { authenticate } from '../../middleware/auth';

export const complianceRouter = Router();

complianceRouter.use(authenticate);

complianceRouter.get('/', ComplianceController.list);
complianceRouter.post('/', ComplianceController.create);
complianceRouter.put('/:id/resolve', ComplianceController.resolve);
complianceRouter.post('/check', ComplianceController.triggerCheck);
