export async function handleRedirect(key, env) {
  try {
    const url = await env.Links.get(key);

    if (!url) {
      return new Response('Not Found', { status: 404 });
    }

    return Response.redirect(url, 302);
  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}
