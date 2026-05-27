export function GET() {
  return new Response(
    JSON.stringify({
      ok: true,
      service: 'auth-api',
    }),
    {
      status: 200,
      headers: {
        'content-type': 'application/json',
      },
    },
  );
}
