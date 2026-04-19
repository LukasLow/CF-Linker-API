const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

function generateRandomKey(length = 6) {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += BASE62.charAt(Math.floor(Math.random() * 62));
  }
  return result;
}

function getSuffix(index) {
  // index 0 = no suffix, index 1 = -a, index 2 = -b, etc.
  if (index === 0) return '';
  // Use lowercase letters only for readability (26 chars), then full base62
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return '-' + chars.charAt((index - 1) % chars.length);
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function handleCreate(request, env) {
  const authHeader = request.headers.get('Authorization');
  
  // Auth immer erforderlich
  if (authHeader !== `Bearer ${env.AUTH_PASSWORD}`) {
    return jsonResponse({ message: 'Unauthorized - Falsches Passwort' }, 401);
  }

  try {
    const body = await request.json();
    const { key, url } = body;

    if (!url) {
      return jsonResponse({ message: 'URL ist erforderlich' }, 400);
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
          return jsonResponse({ message: 'Key space exhausted - zu viele Konflikte' }, 409);
        }
      }
      finalKey = tryKey;
    }

    await env.Links.put(finalKey, url, { expirationTtl: 15552000 }); // 180 days

    return jsonResponse({ key: finalKey, url }, 201);
  } catch (error) {
    return jsonResponse({ message: `Error: ${error.message}` }, 500);
  }
}
