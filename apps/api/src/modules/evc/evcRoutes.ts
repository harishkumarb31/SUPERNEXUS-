import { Router } from 'express';
import { EvcController } from './evcController';
import { authenticate } from '../../middleware/auth';

export const evcRouter = Router();

evcRouter.use(authenticate);

evcRouter.get('/', EvcController.list);
evcRouter.post('/', EvcController.schedule);
evcRouter.post('/:id/submit-report', EvcController.submitReport);
