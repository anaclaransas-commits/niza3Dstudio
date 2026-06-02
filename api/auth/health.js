import { getMissingAuthEnv } from '../lib/session.js';

export default function handler(req, res) {
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
