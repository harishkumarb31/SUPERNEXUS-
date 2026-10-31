import { Router } from 'express';
import { DocumentRequestController } from './documentRequestController';
import { authenticate, requirePermission } from '../../middleware/auth';
import { Permission } from '@regulaflow/shared';

export const documentRequestRouter = Router();

documentRequestRouter.use(authenticate);

// Publicly authenticated endpoints for employees & reviewers
documentRequestRouter.get('/stats/summary', DocumentRequestController.getStats);
documentRequestRouter.get('/', DocumentRequestController.listRequests);
documentRequestRouter.post('/', DocumentRequestController.createRequest);
documentRequestRouter.get('/:id', DocumentRequestController.getRequestById);

// Protected management endpoints (HR Officer, Admin, Super Admin)
documentRequestRouter.post(
  '/:id/assign',
  requirePermission(Permission.DOCUMENT_REQUEST_MANAGE),
  DocumentRequestController.assignRequest
);

documentRequestRouter.patch(
  '/:id/status',
  requirePermission(Permission.DOCUMENT_REQUEST_MANAGE),
  DocumentRequestController.updateStatus
);

