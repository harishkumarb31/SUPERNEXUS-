import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../services/db';
import { RagService } from '../../services/ragService';
import { AppError } from '../../middleware/errorHandler';
import { UserRole } from '@regulaflow/shared';

export class AssistantController {
  static async query(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { question } = req.body;

      if (!question || typeof question !== 'string') {
        throw new AppError('A valid question string is required', 400);
      }

      const response = await RagService.queryRegulatoryAssistant(
        question,
        user.role,
        user.institutionId
      );

      return res.json({
        success: true,
        data: response,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getCorpus(req: Request, res: Response, next: NextFunction) {
    try {
      const references = await prisma.regulatoryReference.findMany({
        orderBy: { code: 'asc' },
      });

      return res.json({
        success: true,
        data: references.map((r) => ({
          ...r,
          chunks: JSON.parse(r.contentChunksJson),
        })),
      });
    } catch (err) {
      next(err);
    }
  }

  static async globalSearch(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const query = String(req.query.q || '').trim();

      if (!query || query.length < 2) {
        return res.json({ success: true, data: [] });
      }

      const results: Array<{
        type: 'Application' | 'Institution' | 'Document' | 'Compliance' | 'Knowledge';
        title: string;
        subtitle: string;
        link: string;
      }> = [];

      // 1. Applications Search
      const appWhere: any = {
        OR: [
          { applicationNumber: { contains: query } },
          { category: { contains: query } },
          { institution: { name: { contains: query } } },
        ],
      };

      if (user.role === UserRole.INSTITUTION_USER) {
        appWhere.institutionId = user.institutionId;
      }

      const apps = await prisma.application.findMany({
        where: appWhere,
        include: { institution: true },
        take: 5,
      });

      for (const a of apps) {
        results.push({
          type: 'Application',
          title: a.applicationNumber,
          subtitle: `${a.institution.name} • ${a.category} (${a.currentStage})`,
          link: `/applications/${a.id}`,
        });
      }

      // 2. Institutions Search (For officers & admin)
      if (user.role !== UserRole.INSTITUTION_USER) {
        const insts = await prisma.institution.findMany({
          where: {
            OR: [
              { name: { contains: query } },
              { code: { contains: query } },
              { city: { contains: query } },
            ],
          },
          take: 4,
        });

        for (const i of insts) {
          results.push({
            type: 'Institution',
            title: i.name,
            subtitle: `ID: ${i.code} • ${i.city}, ${i.region} Region`,
            link: `/applications?search=${encodeURIComponent(i.code)}`,
          });
        }
      }

      // 3. Compliance Search
      const compWhere: any = {
        OR: [
          { title: { contains: query } },
          { description: { contains: query } },
          { obligationType: { contains: query } },
        ],
      };
      if (user.role === UserRole.INSTITUTION_USER) {
        compWhere.institutionId = user.institutionId;
      }

      const compliance = await prisma.complianceObligation.findMany({
        where: compWhere,
        take: 4,
      });

      for (const c of compliance) {
        results.push({
          type: 'Compliance',
          title: c.title,
          subtitle: `Status: ${c.status} • Due: ${new Date(c.dueDate).toLocaleDateString('en-IN')}`,
          link: '/compliance',
        });
      }

      // 4. Regulatory Knowledge Search
      const references = await prisma.regulatoryReference.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { summary: { contains: query } },
            { chapter: { contains: query } },
          ],
        },
        take: 3,
      });

      for (const r of references) {
        results.push({
          type: 'Knowledge',
          title: r.title,
          subtitle: `${r.chapter} • ${r.summary.substring(0, 75)}...`,
          link: `/assistant?q=${encodeURIComponent(query)}`,
        });
      }

      return res.json({ success: true, data: results });
    } catch (err) {
      next(err);
    }
  }
}
