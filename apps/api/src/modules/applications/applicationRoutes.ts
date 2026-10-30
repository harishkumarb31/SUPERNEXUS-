import { Router } from 'express';
import { ApplicationController } from './applicationController';
import { authenticate, requireRole, verifyApplicationAccess } from '../../middleware/auth';
import { UserRole } from '@regulaflow/shared';

export const applicationRouter = Router();

applicationRouter.use(authenticate);

applicationRouter.post(
  '/',
  requireRole(UserRole.INSTITUTION_USER, UserRole.SYSTEM_ADMIN),
  ApplicationController.create
);

applicationRouter.get('/', ApplicationController.list);

applicationRouter.get('/:id', verifyApplicationAccess, ApplicationController.getById);

applicationRouter.put(
  '/:id',
  verifyApplicationAccess,
  requireRole(UserRole.INSTITUTION_USER, UserRole.SYSTEM_ADMIN),
  ApplicationController.updateDraft
);

applicationRouter.post(
  '/:id/submit',
  verifyApplicationAccess,
  requireRole(UserRole.INSTITUTION_USER, UserRole.SYSTEM_ADMIN),
  ApplicationController.submit
);

applicationRouter.post(
  '/:id/transition',
  verifyApplicationAccess,
  ApplicationController.transition
);

applicationRouter.post(
  '/:id/assign',
  verifyApplicationAccess,
  requireRole(UserRole.REGIONAL_OFFICER, UserRole.BUREAU_OFFICER, UserRole.SYSTEM_ADMIN),
  ApplicationController.assignOfficer
);

