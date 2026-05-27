import crypto from 'node:crypto';

const COOKIE_NAME = 'admin_session';
const AUTH_ENV_KEYS = {
  username: ['ADMIN_USERNAME', 'AUTH_USERNAME', 'VITE_ADMIN_USERNAME'],
  password: ['ADMIN_PASSWORD', 'AUTH_PASSWORD', 'VITE_ADMIN_PASSWORD'],
  sessionSecret: ['ADMIN_SESSION_SECRET', 'SESSION_SECRET', 'VITE_ADMIN_SESSION_SECRET'],
} as const;
export const AUTH_ENV_SETUP_MESSAGE =
  'Configure ADMIN_USERNAME, ADMIN_PASSWORD e ADMIN_SESSION_SECRET na Vercel ou no .env.local.';

type SessionPayload = {
  u: string; // username
  iat: number;
  exp: number;
};

type AuthConfig = {
  username: string;
  password: string;
  sessionSecret: string;
};

function readFirstEnv(keys: readonly string[]) {
  for (const key of keys) {
    const value = process.env[key];
    if (typeof value === 'string' && value.length > 0) {
      return value;
    }
  }

  return undefined;
}

export function getAuthConfig(): AuthConfig {
  const username = readFirstEnv(AUTH_ENV_KEYS.username);
  const password = readFirstEnv(AUTH_ENV_KEYS.password);
  const sessionSecret = readFirstEnv(AUTH_ENV_KEYS.sessionSecret);
  const missingKeys: string[] = [];

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
    username: username as string,
    password: password as string,
    sessionSecret: sessionSecret as string,
  };
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
  const { sessionSecret } = getAuthConfig();
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
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
  const sessionSecret = readFirstEnv(AUTH_ENV_KEYS.sessionSecret);
  if (!sessionSecret) return { ok: false as const, reason: 'missing_secret' as const };

  const cookies = parseCookies(req.headers?.cookie);
  const raw = cookies[COOKIE_NAME];
  if (!raw) return { ok: false as const, reason: 'missing_cookie' as const };

  const [encoded, sig] = raw.split('.');
  if (!encoded || !sig) return { ok: false as const, reason: 'bad_cookie' as const };

  const expected = sign(encoded, sessionSecret);
  if (sig.length !== expected.length) return { ok: false as const, reason: 'bad_sig' as const };

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
  const authConfig = getAuthConfig();
  return username === authConfig.username && password === authConfig.password;
}
