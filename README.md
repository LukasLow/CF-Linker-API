# Linker API

Ein modularer Cloudflare Worker Link-Shortener.

## Struktur

- `src/index.js` - Zentraler Router
- `src/create.js` - POST-Endpunkt zum Erstellen von Links
- `src/redirect.js` - GET-Endpunkt für Weiterleitungen

## API

### Link erstellen
```bash
POST /create
Authorization: Bearer <AUTH_PASSWORD>
Content-Type: application/json

{
  "key": "mein-link",
  "url": "https://beispiel.de"
}
```

### Weiterleitung
```
GET /<key>
```

## Deployment

1. Mit Cloudflare Pages verbinden
2. `AUTH_PASSWORD` als Environment Variable setzen
3. KV Namespace `Links` als Binding hinzufügen
# CF-Linker-API
