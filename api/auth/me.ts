import { readSession } from '../_lib/session';

function jsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
}

export function GET(request: Request) {
  const session = readSession({
    headers: {
      cookie: request.headers.get('cookie') ?? undefined,
    },
  });

  if (!session.ok) {
    return jsonResponse({ ok: false }, { status: 401 });
  }

  return jsonResponse({ ok: true, username: session.username }, { status: 200 });
}
