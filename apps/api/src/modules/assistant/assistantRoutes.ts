import { Router } from 'express';
import { AssistantController } from './assistantController';
import { authenticate } from '../../middleware/auth';

export const assistantRouter = Router();

assistantRouter.use(authenticate);

assistantRouter.post('/query', AssistantController.query);
assistantRouter.get('/corpus', AssistantController.getCorpus);
assistantRouter.get('/global-search', AssistantController.globalSearch);

