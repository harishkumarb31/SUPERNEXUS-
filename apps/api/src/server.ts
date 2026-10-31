import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { startScheduler } from './jobs/scheduler';

// Module Routers
import { authRouter } from './modules/auth/authRoutes';
import { applicationRouter } from './modules/applications/applicationRoutes';
import { documentRouter } from './modules/documents/documentRoutes';
import { ocrRouter } from './modules/ocr/ocrRoutes';
import { validationRouter } from './modules/validation/validationRoutes';
import { complianceRouter } from './modules/compliance/complianceRoutes';
import { evcRouter } from './modules/evc/evcRoutes';
import { notificationRouter } from './modules/notifications/notificationRoutes';
import { reportRouter } from './modules/reports/reportRoutes';
import { auditRouter } from './modules/audit/auditRoutes';
import { assistantRouter } from './modules/assistant/assistantRoutes';
import { adminRouter } from './modules/admin/adminRoutes';
import { taskRouter } from './modules/tasks/taskRoutes';

export const app = express();

// Security and utility middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: (origin, callback) => callback(null, true), // Allow frontend during local development & evaluation
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    app: 'RegulaFlow AI Core Engine',
    sihProblemStatement: 'SIH26262',
    timestamp: new Date().toISOString(),
  });
});

// API v1 Routing Mounts
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/applications', applicationRouter);
app.use('/api/v1/documents', documentRouter);
app.use('/api/v1/ocr', ocrRouter);
app.use('/api/v1/validation', validationRouter);
app.use('/api/v1/compliance', complianceRouter);
app.use('/api/v1/evc', evcRouter);
app.use('/api/v1/notifications', notificationRouter);
app.use('/api/v1/reports', reportRouter);
app.use('/api/v1/audit', auditRouter);
app.use('/api/v1/assistant', assistantRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/tasks', taskRouter);

// Centralized Error Handler
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`=======================================================`);
    console.log(`🚀 RegulaFlow AI Engine running on port ${config.port}`);
    console.log(`📡 Environment: ${config.nodeEnv}`);
    console.log(`🛡️  AICTE Approval Workflow Automation & Compliance API`);
    console.log(`=======================================================`);

    // Start background compliance & escalation scheduler
    startScheduler();
  });
}

