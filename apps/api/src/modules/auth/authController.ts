import { Request, Response, NextFunction } from 'express';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../../services/db';
import { config } from '../../config';
import { AppError } from '../../middleware/errorHandler';
import { logAuditEvent } from '../../middleware/audit';
import { ROLE_PERMISSIONS, UserRole } from '@regulaflow/shared';

const bcrypt = (bcryptjs as any).default || bcryptjs;

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const demoLoginSchema = z.object({
  role: z.enum([
    'SUPER_ADMIN',
    'ADMIN',
    'DEPARTMENT_OFFICER',
    'EVALUATOR',
    'FRESHER',
    'VIEWER',
    'INSTITUTION_USER',
    'REGIONAL_OFFICER',
    'BUREAU_OFFICER',
    'COMMITTEE_MEMBER',
    'SYSTEM_ADMIN',
  ]),
});

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = loginSchema.parse(req.body);

      const user = await prisma.user.findUnique({
        where: { email },
        include: { institution: true, department: true },
      });

      if (!user || !user.active) {
        throw new AppError('Invalid email or password', 401);
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        throw new AppError('Invalid email or password', 401);
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn as any }
      );

      await logAuditEvent({
        req,
        actorId: user.id,
        actorEmail: user.email,
        actorRole: user.role,
        action: 'LOGIN',
        entityType: 'User',
        entityId: user.id,
        reason: 'User authenticated via password credentials',
      });

      return res.json({
        success: true,
        message: 'Authentication successful',
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            designation: user.designation || null,
            region: user.region,
            departmentId: user.departmentId || null,
            departmentName: user.department?.name || null,
            institutionId: user.institutionId,
            institutionName: user.institution?.name || null,
            institutionCode: user.institution?.code || null,
            permissions: ROLE_PERMISSIONS[user.role as UserRole] || [],
          },
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async demoLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { role } = demoLoginSchema.parse(req.body);

      const user = await prisma.user.findFirst({
        where: { role, active: true },
        include: { institution: true, department: true },
      });

      if (!user) {
        throw new AppError(`No active demo user found for role '${role}'`, 404);
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn as any }
      );

      await logAuditEvent({
        req,
        actorId: user.id,
        actorEmail: user.email,
        actorRole: user.role,
        action: 'DEMO_LOGIN',
        entityType: 'User',
        entityId: user.id,
        reason: `Demo quick-switch login to role: ${role}`,
      });

      return res.json({
        success: true,
        message: `Authenticated as demo ${role}`,
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            designation: user.designation || null,
            region: user.region,
            departmentId: user.departmentId || null,
            departmentName: user.department?.name || null,
            institutionId: user.institutionId,
            institutionName: user.institution?.name || null,
            institutionCode: user.institution?.code || null,
            permissions: ROLE_PERMISSIONS[user.role as UserRole] || [],
          },
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: { institution: true, department: true },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      return res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            designation: user.designation || null,
            region: user.region,
            departmentId: user.departmentId || null,
            departmentName: user.department?.name || null,
            institutionId: user.institutionId,
            institutionName: user.institution?.name || null,
            institutionCode: user.institution?.code || null,
            permissions: ROLE_PERMISSIONS[user.role as UserRole] || [],
          },
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async logout(req: Request, res: Response) {
    if (req.user) {
      await logAuditEvent({
        req,
        actorId: req.user.id,
        actorEmail: req.user.email,
        actorRole: req.user.role,
        action: 'LOGOUT',
        entityType: 'User',
        entityId: req.user.id,
      });
    }
    return res.json({ success: true, message: 'Logged out successfully' });
  }
}
