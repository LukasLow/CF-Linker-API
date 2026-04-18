const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

function generateRandomKey(length = 6) {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += BASE62.charAt(Math.floor(Math.random() * 62));
  }
  return result;
}

function getSuffix(index) {
  if (index === 0) return '';
  return '-' + BASE62.charAt((index - 1) % 62);
}

export async function handleCreate(request, env) {
  const authHeader = request.headers.get('Authorization');
  
  // Auth optional: nur prüfen wenn AUTH_PASSWORD gesetzt ist
  if (env.AUTH_PASSWORD && authHeader !== `Bearer ${env.AUTH_PASSWORD}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const { key, url } = body;

    if (!url) {
      return new Response('Missing url', { status: 400 });
    }

    let finalKey = key;
    
    // Wenn kein Key angegeben → generiere random Key
    if (!finalKey) {
      do {
        finalKey = generateRandomKey();
      } while (await env.Links.get(finalKey));
    } else {
      // Key angegeben → prüfe Verfügbarkeit mit Suffix-Logik
      let index = 0;
      let tryKey = finalKey;
      
      while (await env.Links.get(tryKey)) {
        index++;
        tryKey = finalKey + getSuffix(index);
        if (index > 62) {
          return new Response('Key space exhausted', { status: 409 });
        }
      }
      finalKey = tryKey;
    }

    await env.Links.put(finalKey, url, { expirationTtl: 15552000 }); // 180 days

    return new Response(JSON.stringify({ key: finalKey, url }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}
