import { Router } from 'express';
import { AuthController } from './authController';
import { authenticate } from '../../middleware/auth';

export const authRouter = Router();

authRouter.post('/login', AuthController.login);
authRouter.post('/demo-login', AuthController.demoLogin);
authRouter.get('/me', authenticate, AuthController.me);
authRouter.post('/logout', authenticate, AuthController.logout);
