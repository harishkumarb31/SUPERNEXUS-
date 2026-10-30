import { Router } from 'express';
import { ValidationController } from './validationController';
import { authenticate, requireRole } from '../../middleware/auth';
import { UserRole } from '@regulaflow/shared';

export const validationRouter = Router();

validationRouter.use(authenticate);

validationRouter.post('/run', ValidationController.runValidation);
validationRouter.get('/findings', ValidationController.listFindings);
validationRouter.put(
  '/findings/:id/resolve',
  requireRole(UserRole.REGIONAL_OFFICER, UserRole.BUREAU_OFFICER, UserRole.SYSTEM_ADMIN),
  ValidationController.resolveFinding
);

