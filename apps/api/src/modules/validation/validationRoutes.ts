import { Router } from 'express';
import { ValidationController } from './validationController';
import { authenticate } from '../../middleware/auth';

export const validationRouter = Router();

validationRouter.use(authenticate);

validationRouter.post('/run', ValidationController.runValidation);
validationRouter.get('/findings', ValidationController.listFindings);
validationRouter.put('/findings/:id/resolve', ValidationController.resolveFinding);
