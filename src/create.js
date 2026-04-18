export async function handleCreate(request, env) {
  const authHeader = request.headers.get('Authorization');
  
  if (authHeader !== `Bearer ${env.AUTH_PASSWORD}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const { key, url } = body;

    if (!key || !url) {
      return new Response('Missing key or url', { status: 400 });
    }

    const existing = await env.Links.get(key);
    if (existing) {
      return new Response('Key already exists', { status: 409 });
    }

    await env.Links.put(key, url, { expirationTtl: 15552000 }); // 180 days

    return new Response(JSON.stringify({ key, url }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}
