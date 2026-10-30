import { Router } from 'express';
import { EvcController } from './evcController';
import { authenticate, requireRole } from '../../middleware/auth';
import { UserRole } from '@regulaflow/shared';

export const evcRouter = Router();

evcRouter.use(authenticate);

evcRouter.get('/', EvcController.list);
evcRouter.post(
  '/',
  requireRole(UserRole.REGIONAL_OFFICER, UserRole.BUREAU_OFFICER, UserRole.SYSTEM_ADMIN),
  EvcController.schedule
);
evcRouter.post(
  '/:id/submit-report',
  requireRole(
    UserRole.COMMITTEE_MEMBER,
    UserRole.REGIONAL_OFFICER,
    UserRole.BUREAU_OFFICER,
    UserRole.SYSTEM_ADMIN
  ),
  EvcController.submitReport
);

