# Linker API

Ein modularer Cloudflare Worker Link-Shortener.

**Domain:** `linker-api.peeker.workers.dev`

## Struktur

- `src/index.js` - Zentraler Router
- `src/create.js` - POST-Endpunkt zum Erstellen von Links
- `src/redirect.js` - GET-Endpunkt für Weiterleitungen

## API Beispiele

### Link erstellen

```bash
curl -X POST https://linker-api.peeker.workers.dev/create \
  -H "Authorization: Bearer <DEIN_AUTH_PASSWORD>" \
  -H "Content-Type: application/json" \
  -d '{"key": "github", "url": "https://github.com/LukasLow"}'
```

**Antwort:**

```json
{"key": "github", "url": "https://github.com/LukasLow"}
```

### Link aufrufen (Weiterleitung)

```bash
curl -L https://linker-api.peeker.workers.dev/github
```

Oder direkt im Browser:

```text
https://linker-api.peeker.workers.dev/github
```

## Deployment

1. `AUTH_PASSWORD` als Secret setzen:

   ```bash
   wrangler secret put AUTH_PASSWORD
   ```

2. KV Namespace `Links` in `wrangler.toml` konfiguriert
3. Deploy via `wrangler deploy`
