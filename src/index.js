import { handleCreate } from './create.js';
import { handleRedirect } from './redirect.js';
import { indexHtml, indexJs, indexCss, jsPath, cssPath } from './assets.js';

const assets = {
  [jsPath]: { content: indexJs, type: 'application/javascript' },
  [cssPath]: { content: indexCss, type: 'text/css' }
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Serve static assets
    if (assets[path]) {
      const asset = assets[path];
      return new Response(asset.content, { 
        headers: { 
          'Content-Type': asset.type,
          'Cache-Control': 'public, max-age=31536000, immutable'
        } 
      });
    }

    // Serve main UI
    if (path === '/' && request.method === 'GET') {
      return new Response(indexHtml, { headers: { 'Content-Type': 'text/html' } });
    }

    // API endpoint
    if (path === '/create' && request.method === 'POST') {
      return handleCreate(request, env);
    }

    // Redirect short links
    const shortPath = path.slice(1);
    if (shortPath && request.method === 'GET') {
      return handleRedirect(shortPath, env);
    }

    return new Response('Not Found', { status: 404 });
  }
};
