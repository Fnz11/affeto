import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  const secret = request.headers.get('x-revalidate-token');
  const expectedSecret = process.env.REVALIDATE_SECRET || 'affeto-revalidate-secret-token';

  if (secret !== expectedSecret) {
    return new Response(JSON.stringify({ error: 'Unauthorized revalidation' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    console.log('[REVALIDATE] Triggered revalidation for event:', body.event, body.model);
    return new Response(JSON.stringify({ revalidated: true, timestamp: Date.now() }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
