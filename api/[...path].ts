import { app } from '../apps/api/src/server';

export default function handler(req: any, res: any) {
  const forwardedPath = req.headers['x-forwarded-uri'] || req.headers['x-matched-path'];
  if (forwardedPath && typeof forwardedPath === 'string' && (req.url === '/api' || req.url === '/api/')) {
    req.url = forwardedPath;
  }
  return app(req, res);
}
