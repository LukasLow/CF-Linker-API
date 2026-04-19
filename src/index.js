import { handleCreate } from './create.js';
import { handleRedirect } from './redirect.js';
import { serveUI } from './ui.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname.slice(1);

    if (url.pathname === '/' && request.method === 'GET') {
      return serveUI();
    }

    if (url.pathname === '/create' && request.method === 'POST') {
      return handleCreate(request, env);
    }

    if (path && request.method === 'GET') {
      return handleRedirect(path, env);
    }

    return new Response('Not Found', { status: 404 });
  }
};
