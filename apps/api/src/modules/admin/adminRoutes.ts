import { Router } from 'express';
import { AdminController } from './adminController';
import { authenticate, requireRole } from '../../middleware/auth';
import { UserRole } from '@regulaflow/shared';

export const adminRouter = Router();

adminRouter.use(authenticate);

adminRouter.get('/users', requireRole(UserRole.SYSTEM_ADMIN, UserRole.BUREAU_OFFICER), AdminController.listUsers);
adminRouter.get('/institutions', AdminController.listInstitutions);
adminRouter.get('/system-health', AdminController.getSystemHealth);

