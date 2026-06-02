import type { IncomingMessage, ServerResponse } from 'node:http';
import { getMissingAuthEnv } from '../lib/session';

export default function handler(req: IncomingMessage & { method?: string }, res: ServerResponse) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  const missingEnv = getMissingAuthEnv();

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(
    JSON.stringify({
      ok: missingEnv.length === 0,
      runtime: 'node',
      missingEnv,
    }),
  );
}

