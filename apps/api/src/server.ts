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
import { documentRequestRouter } from './modules/documents/documentRequestRoutes';

export const app = express();

// Security and utility middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: (origin, callback) => callback(null, true), // Allow frontend during local development & evaluation
    credentials: true,
  })
);
app.options('*', cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Lightweight zero-dependency cookie parser
app.use((req, res, next) => {
  if (req.headers.cookie) {
    (req as any).cookies = Object.fromEntries(
      req.headers.cookie.split('; ').map((c: string) => {
        const [k, ...v] = c.split('=');
        return [k, decodeURIComponent(v.join('='))];
      })
    );
  } else {
    (req as any).cookies = {};
  }
  next();
});

// Health Check Endpoints
const healthHandler = (req: any, res: any) => {
  res.json({
    status: 'ONLINE',
    app: 'SuperNexus AI (RegulaFlow Engine)',
    sihProblemStatement: 'SIH26262',
    timestamp: new Date().toISOString(),
  });
};
app.get('/api/health', healthHandler);
app.get('/api/v1/health', healthHandler);
app.get('/health', healthHandler);

// API Routing Mounts (Dual mount: /api/v1 and /api for interoperability)
app.use('/api/v1/auth', authRouter);
app.use('/api/auth', authRouter);

app.use('/api/v1/applications', applicationRouter);
app.use('/api/applications', applicationRouter);

app.use('/api/v1/documents', documentRouter);
app.use('/api/documents', documentRouter);

app.use('/api/v1/ocr', ocrRouter);
app.use('/api/ocr', ocrRouter);

app.use('/api/v1/validation', validationRouter);
app.use('/api/validation', validationRouter);

app.use('/api/v1/compliance', complianceRouter);
app.use('/api/compliance', complianceRouter);

app.use('/api/v1/evc', evcRouter);
app.use('/api/evc', evcRouter);

app.use('/api/v1/notifications', notificationRouter);
app.use('/api/notifications', notificationRouter);

app.use('/api/v1/reports', reportRouter);
app.use('/api/reports', reportRouter);

app.use('/api/v1/audit', auditRouter);
app.use('/api/audit', auditRouter);

app.use('/api/v1/assistant', assistantRouter);
app.use('/api/assistant', assistantRouter);

app.use('/api/v1/admin', adminRouter);
app.use('/api/admin', adminRouter);

app.use('/api/v1/tasks', taskRouter);
app.use('/api/tasks', taskRouter);

app.use('/api/v1/document-requests', documentRequestRouter);
app.use('/api/document-requests', documentRequestRouter);

// Centralized Error Handler
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(config.port, () => {
    console.log(`=======================================================`);
    console.log(`🚀 SuperNexus AI Engine running on port ${config.port}`);
    console.log(`📡 Environment: ${config.nodeEnv}`);
    console.log(`🛡️  AICTE Approval Workflow Automation & Compliance API`);
    console.log(`=======================================================`);

    // Start background compliance & escalation scheduler
    startScheduler();
  });
}
