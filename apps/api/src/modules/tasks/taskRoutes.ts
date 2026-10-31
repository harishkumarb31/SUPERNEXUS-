import { Router } from 'express';
import { TaskController } from './taskController';
import { authenticate, requireRole } from '../../middleware/auth';
import { UserRole } from '@regulaflow/shared';

export const taskRouter = Router();

taskRouter.use(authenticate);

taskRouter.get('/', TaskController.list);
taskRouter.get('/stats', TaskController.getStats);
taskRouter.post(
  '/',
  requireRole(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.SYSTEM_ADMIN,
    UserRole.BUREAU_OFFICER,
    UserRole.DEPARTMENT_OFFICER,
    UserRole.REGIONAL_OFFICER
  ),
  TaskController.create
);
taskRouter.put('/:id', TaskController.update);
