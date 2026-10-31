import { Router } from 'express';
import { AuthController } from './authController';
import { authenticate } from '../../middleware/auth';

export const authRouter = Router();

authRouter.post('/login', AuthController.login);
authRouter.all('/login', (req, res) => {
  res.status(405).json({
    success: false,
    error: 'Method Not Allowed. Please send a POST request with email and password credentials.',
  });
});

authRouter.post('/demo-login', AuthController.demoLogin);
authRouter.all('/demo-login', (req, res) => {
  res.status(405).json({
    success: false,
    error: 'Method Not Allowed. Please send a POST request with the requested role.',
  });
});

authRouter.get('/me', authenticate, AuthController.me);
authRouter.post('/logout', AuthController.logout);
authRouter.all('/logout', AuthController.logout);
