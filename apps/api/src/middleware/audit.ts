import { Request } from 'express';
import { prisma } from '../services/db';

export interface AuditParams {
  req?: Request;
  actorId?: string | null;
  actorEmail?: string;
  actorRole?: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  beforeState?: any;
  afterState?: any;
  reason?: string;
}

export async function logAuditEvent(params: AuditParams): Promise<void> {
  try {
    let actorId = params.actorId;
    let actorEmail = params.actorEmail || 'system@regulaflow.local';
    let actorRole = params.actorRole || 'SYSTEM';

    if (params.req && (params.req as any).user) {
      const u = (params.req as any).user;
      actorId = actorId || u.id;
      actorEmail = u.email;
      actorRole = u.role;
    }

    const ipAddress = params.req?.ip || params.req?.socket.remoteAddress || '127.0.0.1';
    const userAgent = params.req?.headers['user-agent'] || 'Server/Job';

    await prisma.auditEvent.create({
      data: {
        actorId: actorId || null,
        actorEmail,
        actorRole,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId || null,
        beforeStateJson: params.beforeState ? JSON.stringify(params.beforeState) : null,
        afterStateJson: params.afterState ? JSON.stringify(params.afterState) : null,
        reason: params.reason || null,
        ipAddress,
        userAgent,
      },
    });
  } catch (err) {
    console.error('[Audit Log Error]', err);
  }
}

