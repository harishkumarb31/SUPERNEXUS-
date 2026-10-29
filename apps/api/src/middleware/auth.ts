import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { prisma } from '../services/db';
import { AppError } from './errorHandler';
import { UserRole } from '@regulaflow/shared';

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  region?: string | null;
  institutionId?: string | null;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      throw new AppError('Authentication required. Missing token.', 401);
    }

    const decoded = jwt.verify(token, config.jwtSecret) as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { institution: true },
    });

    if (!user || !user.active) {
      throw new AppError('User not found or account is deactivated.', 401);
    }

    req.user = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role as UserRole,
      region: user.region,
      institutionId: user.institutionId,
    };

    next();
  } catch (err: any) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      next(new AppError('Invalid or expired authentication token.', 401));
    } else {
      next(err);
    }
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Unauthorized: User not authenticated.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Forbidden: Role '${req.user.role}' is not authorized to perform this action. Required: [${roles.join(', ')}]`,
          403
        )
      );
    }

    next();
  };
}

export async function verifyApplicationAccess(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return next(new AppError('Unauthorized: User not authenticated.', 401));
    }

    const applicationId = req.params.id || req.params.applicationId || req.body.applicationId;
    if (!applicationId) {
      return next();
    }

    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { institution: true },
    });

    if (!app) {
      return next(new AppError('Application not found.', 404));
    }

    // Institution user check
    if (req.user.role === UserRole.INSTITUTION_USER) {
      if (app.institutionId !== req.user.institutionId) {
        return next(new AppError('Forbidden: Access denied to other institutions\' applications.', 403));
      }
    }

    // Regional officer check
    if (req.user.role === UserRole.REGIONAL_OFFICER) {
      if (req.user.region && app.institution.region !== req.user.region) {
        return next(
          new AppError(
            `Forbidden: Regional Officers can only access cases within their assigned region (${req.user.region}).`,
            403
          )
        );
      }
    }

    (req as any).application = app;
    next();
  } catch (err) {
    next(err);
  }
}
