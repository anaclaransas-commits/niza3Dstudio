import crypto from 'node:crypto';
import path from 'node:path';
import { existsSync } from 'node:fs';
import dotenv from 'dotenv';
import express from 'express';
import {
  getUploadsRootDirectory,
  mergeCatalogSettings,
  readCatalogSnapshot,
  removeCatalogProduct,
  replaceCatalogSnapshot,
  saveCatalogAsset,
  upsertCatalogProduct,
} from './catalogStore.mjs';

const COOKIE_NAME = 'admin_session';
const AUTH_ENV_KEYS = {
  username: ['ADMIN_USERNAME', 'AUTH_USERNAME', 'VITE_ADMIN_USERNAME'],
  password: ['ADMIN_PASSWORD', 'AUTH_PASSWORD', 'VITE_ADMIN_PASSWORD'],
  sessionSecret: ['ADMIN_SESSION_SECRET', 'SESSION_SECRET', 'VITE_ADMIN_SESSION_SECRET'],
};
const AUTH_ENV_SETUP_MESSAGE =
  'Configure ADMIN_USERNAME, ADMIN_PASSWORD e ADMIN_SESSION_SECRET na Vercel ou no .env.local.';

const envFilePaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '.env.local'),
];

for (const envFilePath of envFilePaths) {
  if (existsSync(envFilePath)) {
    dotenv.config({ path: envFilePath, override: envFilePath.endsWith('.env.local') });
  }
}

const app = express();
const port = Number(process.env.PORT || 4000);
const distDirectory = path.resolve(process.cwd(), 'dist');

function readFirstEnv(keys) {
  for (const key of keys) {
    const value = process.env[key];
    if (typeof value === 'string' && value.length > 0) {
      return value;
    }
  }

  return undefined;
}

function getAuthConfig() {
  const username = readFirstEnv(AUTH_ENV_KEYS.username);
  const password = readFirstEnv(AUTH_ENV_KEYS.password);
  const sessionSecret = readFirstEnv(AUTH_ENV_KEYS.sessionSecret);
  const missingKeys = [];

  if (!username) {
    missingKeys.push(AUTH_ENV_KEYS.username[0]);
  }

  if (!password) {
    missingKeys.push(AUTH_ENV_KEYS.password[0]);
  }

  if (!sessionSecret) {
    missingKeys.push(AUTH_ENV_KEYS.sessionSecret[0]);
  }

  if (missingKeys.length > 0) {
    throw new Error(
      `Authentication env vars not configured: ${missingKeys.join(', ')}. ${AUTH_ENV_SETUP_MESSAGE}`,
    );
  }

  return {
    username,
    password,
    sessionSecret,
  };
}

function base64UrlEncode(input) {
  return Buffer.from(input, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function base64UrlDecode(input) {
  const padLength = (4 - (input.length % 4)) % 4;
  const padded = input.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(padLength);
  return Buffer.from(padded, 'base64').toString('utf8');
}

function sign(value, secret) {
  return crypto.createHmac('sha256', secret).update(value).digest('base64url');
}

function parseCookies(header) {
  const out = {};
  if (!header) return out;
  const parts = header.split(';');

  for (const part of parts) {
    const [key, ...rest] = part.trim().split('=');
    if (!key) continue;
    out[key] = decodeURIComponent(rest.join('=') || '');
  }

  return out;
}

function buildSessionCookie(username, maxAgeSeconds = 60 * 60 * 24 * 7) {
  const { sessionSecret } = getAuthConfig();
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    u: username,
    iat: now,
    exp: now + maxAgeSeconds,
  };
  const encoded = base64UrlEncode(JSON.stringify(payload));
  const sig = sign(encoded, sessionSecret);
  const value = `${encoded}.${sig}`;
  const secure = process.env.NODE_ENV === 'production';
  const attrs = [
    `${COOKIE_NAME}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAgeSeconds}`,
    secure ? 'Secure' : '',
  ].filter(Boolean);

  return attrs.join('; ');
}

function clearSessionCookie() {
  const secure = process.env.NODE_ENV === 'production';
  const attrs = [
    `${COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
    secure ? 'Secure' : '',
  ].filter(Boolean);

  return attrs.join('; ');
}

function readSession(request) {
  const sessionSecret = readFirstEnv(AUTH_ENV_KEYS.sessionSecret);
  if (!sessionSecret) return { ok: false, reason: 'missing_secret' };

  const cookies = parseCookies(request.headers?.cookie);
  const raw = cookies[COOKIE_NAME];
  if (!raw) return { ok: false, reason: 'missing_cookie' };

  const [encoded, sig] = raw.split('.');
  if (!encoded || !sig) return { ok: false, reason: 'bad_cookie' };

  const expected = sign(encoded, sessionSecret);
  if (sig.length !== expected.length) return { ok: false, reason: 'bad_sig' };
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    return { ok: false, reason: 'bad_sig' };
  }

  let payload;

  try {
    payload = JSON.parse(base64UrlDecode(encoded));
  } catch {
    return { ok: false, reason: 'bad_payload' };
  }

  const now = Math.floor(Date.now() / 1000);
  if (!payload.exp || payload.exp < now) {
    return { ok: false, reason: 'expired' };
  }

  return { ok: true, username: payload.u };
}

function verifyCredentials(username, password) {
  const authConfig = getAuthConfig();
  return username === authConfig.username && password === authConfig.password;
}

app.use(express.json({ limit: '40mb' }));

app.use((request, response, next) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    response.sendStatus(204);
    return;
  }

  next();
});

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.post('/api/auth/login', (request, response) => {
  try {
    const username = typeof request.body?.username === 'string' ? request.body.username.trim() : '';
    const password = typeof request.body?.password === 'string' ? request.body.password : '';

    if (!username || !password) {
      response.status(400).json({ error: 'Missing username/password' });
      return;
    }

    if (!verifyCredentials(username, password)) {
      response.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    response.setHeader('Set-Cookie', buildSessionCookie(username));
    response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    const isConfigError =
      typeof message === 'string' && message.includes('Authentication env vars not configured');

    response.status(isConfigError ? 503 : 500).json({ error: message });
  }
});

app.get('/api/auth/me', (request, response) => {
  const session = readSession(request);

  if (!session.ok) {
    response.status(401).json({ ok: false });
    return;
  }

  response.json({ ok: true, username: session.username });
});

app.post('/api/auth/logout', (_request, response) => {
  response.setHeader('Set-Cookie', clearSessionCookie());
  response.json({ ok: true });
});

app.get('/api/catalog/admin', async (_request, response, next) => {
  try {
    const snapshot = await readCatalogSnapshot();
    response.json(snapshot);
  } catch (error) {
    next(error);
  }
});

app.put('/api/catalog/admin', async (request, response, next) => {
  try {
    const snapshot = await replaceCatalogSnapshot(request.body || {});
    response.json(snapshot);
  } catch (error) {
    next(error);
  }
});

app.get('/api/catalog/public', async (_request, response, next) => {
  try {
    const snapshot = await readCatalogSnapshot();
    response.json({
      catalogSettings: snapshot.catalogSettings,
      products: snapshot.products.filter((product) => product.isPublic !== false),
    });
  } catch (error) {
    next(error);
  }
});

app.put('/api/catalog/settings', async (request, response, next) => {
  try {
    const settings = await mergeCatalogSettings(request.body || {});
    response.json(settings);
  } catch (error) {
    next(error);
  }
});

app.put('/api/catalog/products/:productId', async (request, response, next) => {
  try {
    const product = await upsertCatalogProduct({
      ...(request.body || {}),
      id: request.params.productId,
    });
    response.json(product);
  } catch (error) {
    next(error);
  }
});

app.delete('/api/catalog/products/:productId', async (request, response, next) => {
  try {
    const result = await removeCatalogProduct(request.params.productId);
    response.json(result);
  } catch (error) {
    next(error);
  }
});

app.post('/api/catalog/assets', async (request, response, next) => {
  try {
    const asset = await saveCatalogAsset(request.body || {});
    response.status(201).json(asset);
  } catch (error) {
    next(error);
  }
});

app.use('/uploads', express.static(getUploadsRootDirectory()));

if (existsSync(distDirectory)) {
  app.use(express.static(distDirectory));

  app.get(['/catalogo', '/catalogo.html'], (_request, response) => {
    response.sendFile(path.join(distDirectory, 'catalogo.html'));
  });

  app.get('*', (_request, response) => {
    response.sendFile(path.join(distDirectory, 'index.html'));
  });
}

app.use((error, _request, response, _next) => {
  console.error(error);

  const message = error instanceof Error ? error.message : 'Erro interno no servidor.';
  response.status(500).json({ message });
});

app.listen(port, () => {
  console.log(`Catálogo público disponível em http://localhost:${port}/catalogo`);
});
