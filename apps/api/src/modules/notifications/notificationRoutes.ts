import { Router } from 'express';
import { NotificationController } from './notificationController';
import { authenticate } from '../../middleware/auth';

export const notificationRouter = Router();

notificationRouter.use(authenticate);

notificationRouter.get('/', NotificationController.list);
notificationRouter.put('/:id/read', NotificationController.markAsRead);
notificationRouter.put('/mark-all-read', NotificationController.markAllAsRead);
notificationRouter.get('/escalations', NotificationController.listEscalations);
