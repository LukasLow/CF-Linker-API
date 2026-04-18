# Linker API

Ein modularer Cloudflare Worker Link-Shortener mit automatischer Key-Generierung.

**Domain:** `linker-api.peeker.workers.dev`

## Features

- **Auth immer erforderlich** – Passwort via `Authorization: Bearer <password>`
- **Key optional** – Wird automatisch generiert wenn nicht angegeben (6 Zeichen Base62)
- **Auto-Suffix** – Bei Konflikten wird `-a`, `-b`, `-c`... angehängt
- **180 Tage TTL** – Links löschen sich automatisch nach 180 Tagen

## API

### Link erstellen (mit Custom Key)

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

### Link erstellen (Auto-Key)

```bash
curl -X POST https://linker-api.peeker.workers.dev/create \
  -H "Authorization: Bearer <DEIN_AUTH_PASSWORD>" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

**Antwort:**

```json
{"key": "a3K9mP", "url": "https://example.com"}
```

### Konflikt-Handling (Suffix)

Wenn `github` bereits vergeben ist:

```bash
curl -X POST https://linker-api.peeker.workers.dev/create \
  -H "Authorization: Bearer <DEIN_AUTH_PASSWORD>" \
  -H "Content-Type: application/json" \
  -d '{"key": "github", "url": "https://another.com"}'
```

**Antwort:**

```json
{"key": "github-a", "url": "https://another.com"}
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

3. Deploy via:

   ```bash
   npx wrangler deploy
   ```

## Struktur

- `src/index.js` - Zentraler Router
- `src/create.js` - POST-Endpunkt mit Auto-Key & Suffix-Logik
- `src/redirect.js` - GET-Endpunkt für Weiterleitungen
