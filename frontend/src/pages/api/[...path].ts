import type { APIRoute } from 'astro';

const STRAPI_URL = process.env.INTERNAL_STRAPI_URL || process.env.PUBLIC_STRAPI_URL || 'http://127.0.0.1:1337';

export const ALL: APIRoute = async ({ request, params }) => {
  const path = params.path || '';
  const url = new URL(request.url);
  const targetUrl = `${STRAPI_URL}/api/${path}${url.search}`;

  const headers = new Headers(request.headers);
  headers.delete('host');

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : await request.arrayBuffer(),
    });

    const responseHeaders = new Headers(response.headers);
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: { message: err.message || 'BFF Gateway Error' } }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
