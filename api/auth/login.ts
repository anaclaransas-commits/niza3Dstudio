import { buildSessionCookie, verifyCredentials } from '../_lib/session';

function jsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { username?: unknown; password?: unknown };
    const username = typeof body.username === 'string' ? body.username.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!username || !password) {
      return jsonResponse({ error: 'Missing username/password' }, { status: 400 });
    }

    if (!verifyCredentials(username, password)) {
      return jsonResponse({ error: 'Invalid credentials' }, { status: 401 });
    }

    return jsonResponse(
      { ok: true },
      {
        status: 200,
        headers: {
          'set-cookie': buildSessionCookie(username),
        },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    const isConfigError =
      typeof message === 'string' && message.includes('Authentication env vars not configured');

    return jsonResponse(
      { error: message },
      { status: isConfigError ? 503 : 500 },
    );
  }
}
