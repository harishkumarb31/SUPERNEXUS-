import { Router } from 'express';
import { ReportController } from './reportController';
import { authenticate } from '../../middleware/auth';

export const reportRouter = Router();

reportRouter.use(authenticate);

reportRouter.get('/metrics', ReportController.getDashboardMetrics);
reportRouter.get('/stage-distribution', ReportController.getStageDistribution);
reportRouter.get('/regional-pendency', ReportController.getRegionalPendency);
reportRouter.get('/export-csv', ReportController.exportCsv);

