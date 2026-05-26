import type { IncomingMessage, ServerResponse } from 'node:http';
import { readSession } from '../_lib/session';

export default function handler(req: IncomingMessage & { method?: string; headers?: any }, res: ServerResponse) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  const session = readSession(req as any);
  if (!session.ok) {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ok: false }));
    return;
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ ok: true, username: session.username }));
}

