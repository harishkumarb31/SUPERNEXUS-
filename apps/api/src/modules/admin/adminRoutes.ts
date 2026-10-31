import { Router } from 'express';
import { AdminController } from './adminController';
import { authenticate, requireRole } from '../../middleware/auth';
import { UserRole } from '@regulaflow/shared';

export const adminRouter = Router();

adminRouter.use(authenticate);

adminRouter.get(
  '/users',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SYSTEM_ADMIN, UserRole.BUREAU_OFFICER),
  AdminController.listUsers
);
adminRouter.get('/institutions', AdminController.listInstitutions);
adminRouter.get('/departments', AdminController.listDepartments);
adminRouter.get('/roles-permissions', AdminController.getRolesAndPermissions);
adminRouter.get(
  '/security-stats',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SYSTEM_ADMIN, UserRole.BUREAU_OFFICER),
  AdminController.getSecurityStats
);
adminRouter.get('/system-health', AdminController.getSystemHealth);


