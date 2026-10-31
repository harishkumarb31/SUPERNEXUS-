import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// In Vercel serverless functions, the root environment is read-only.
// If using SQLite, ensure the database file is copied to /tmp where it is writable.
if (process.env.VERCEL) {
  const tmpDbPath = '/tmp/dev.db';
  if (!fs.existsSync(tmpDbPath)) {
    const candidatePaths = [
      path.resolve(process.cwd(), 'prisma/dev.db'),
      path.resolve(process.cwd(), 'dev.db'),
      path.resolve(__dirname, '../../../../prisma/dev.db'),
      path.resolve(__dirname, '../../../prisma/dev.db'),
      path.resolve(__dirname, '../../prisma/dev.db'),
    ];
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        try {
          fs.copyFileSync(p, tmpDbPath);
          console.log(`[Database] Initialized writable /tmp/dev.db from ${p}`);
          break;
        } catch (e) {
          console.warn('[Database] Note copying to /tmp:', e);
        }
      }
    }
  }
  if (fs.existsSync(tmpDbPath) && !process.env.DATABASE_URL?.startsWith('postgres')) {
    process.env.DATABASE_URL = 'file:/tmp/dev.db';
  }
}

export const prisma = new PrismaClient();

process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

