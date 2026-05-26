import crypto from 'node:crypto';

const COOKIE_NAME = 'admin_session';

type SessionPayload = {
  u: string; // username
  iat: number;
  exp: number;
};

function getEnv(name: string) {
  const value = process.env[name];

  console.log('ENV TEST:', name, value);

  if (!value) {
    throw new Error(`Missing env var: ${name}`);
  }

  return value;
}

function base64UrlEncode(input: string) {
  return Buffer.from(input, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function base64UrlDecode(input: string) {
  const padLength = (4 - (input.length % 4)) % 4;
  const padded = input.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(padLength);
  return Buffer.from(padded, 'base64').toString('utf8');
}

function sign(value: string, secret: string) {
  return crypto.createHmac('sha256', secret).update(value).digest('base64url');
}

function parseCookies(header: string | undefined) {
  const out: Record<string, string> = {};
  if (!header) return out;
  const parts = header.split(';');
  for (const part of parts) {
    const [k, ...rest] = part.trim().split('=');
    if (!k) continue;
    out[k] = decodeURIComponent(rest.join('=') || '');
  }
  return out;
}

export function buildSessionCookie(username: string, maxAgeSeconds = 60 * 60 * 24 * 7) {
  const secret = getEnv('ADMIN_SESSION_SECRET');
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
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

export function readSession(req: { headers?: { cookie?: string | undefined } }) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return { ok: false as const, reason: 'missing_secret' as const };

  const cookies = parseCookies(req.headers?.cookie);
  const raw = cookies[COOKIE_NAME];
  if (!raw) return { ok: false as const, reason: 'missing_cookie' as const };

  const [encoded, sig] = raw.split('.');
  if (!encoded || !sig) return { ok: false as const, reason: 'bad_cookie' as const };

  const expected = sign(encoded, secret);
  const sigOk = crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  if (!sigOk) return { ok: false as const, reason: 'bad_sig' as const };

  let payload: SessionPayload;
  try {
    payload = JSON.parse(base64UrlDecode(encoded)) as SessionPayload;
  } catch {
    return { ok: false as const, reason: 'bad_payload' as const };
  }

  const now = Math.floor(Date.now() / 1000);
  if (!payload.exp || payload.exp < now) {
    return { ok: false as const, reason: 'expired' as const };
  }

  return { ok: true as const, username: payload.u };
}

export function verifyCredentials(username: string, password: string) {
  const envUser = getEnv('ADMIN_USERNAME');
  const envPass = getEnv('ADMIN_PASSWORD');
  return username === envUser && password === envPass;
}

