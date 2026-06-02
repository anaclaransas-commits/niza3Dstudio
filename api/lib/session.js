import crypto from 'node:crypto';

const COOKIE_NAME = 'admin_session';

function getEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env var: ${name}`);
  }

  return value;
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
    const [k, ...rest] = part.trim().split('=');
    if (!k) continue;
    out[k] = decodeURIComponent(rest.join('=') || '');
  }
  return out;
}

export function buildSessionCookie(username, maxAgeSeconds = 60 * 60 * 24 * 7) {
  const secret = getEnv('ADMIN_SESSION_SECRET');
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    u: username,
    iat: now,
    exp: now + maxAgeSeconds,
  };
  const encoded = base64UrlEncode(JSON.stringify(payload));
  const sig = sign(encoded, secret);
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

export function clearSessionCookie() {
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

export function readSession(req) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return { ok: false, reason: 'missing_secret' };

  const cookies = parseCookies(req.headers?.cookie);
  const raw = cookies[COOKIE_NAME];
  if (!raw) return { ok: false, reason: 'missing_cookie' };

  const [encoded, sig] = raw.split('.');
  if (!encoded || !sig) return { ok: false, reason: 'bad_cookie' };

  const expected = sign(encoded, secret);
  if (sig.length !== expected.length) {
    return { ok: false, reason: 'bad_sig' };
  }
  const sigOk = crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  if (!sigOk) return { ok: false, reason: 'bad_sig' };

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

export function verifyCredentials(username, password) {
  const envUser = getEnv('ADMIN_USERNAME');
  const envPass = getEnv('ADMIN_PASSWORD');
  return username === envUser && password === envPass;
}

export function getMissingAuthEnv() {
  const required = ['ADMIN_USERNAME', 'ADMIN_PASSWORD', 'ADMIN_SESSION_SECRET'];
  return required.filter((name) => !process.env[name]);
}
