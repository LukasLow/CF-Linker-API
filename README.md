# echter.link 🔗

Ein moderner Cloudflare Worker Link-Shortener mit schönem Svelte UI, Schnee-Effekt und QR-Codes.

**Features:**

- ❄️ Animierter Schnee-Hintergrund
- 🎨 Cyan/Rot Farbschema mit schwarzem Hintergrund
- 📱 QR-Code Generierung für jeden Link
- 🔗 Auto-HTTPS – Eingaben wie `google.com` werden automatisch zu `https://google.com`
- ⚡ Schnelle Weiterleitungen
- 🔐 Passwort-geschützte Link-Erstellung

## Live Demo

**URL:** `https://linker-api.peeker.workers.dev`

## Features

- **Schönes Svelte UI** – Mit Schnee-Effekt, Animationen und Cyan/Rot Design
- **QR-Code** – Jeder erstellte Link bekommt einen QR-Code zum Scannen
- **Auth erforderlich** – Passwort via `Authorization: Bearer <password>`
- **Key optional** – Automatische 6-Zeichen Base62 Keys
- **Auto-HTTPS** – URLs ohne Protokoll werden automatisch mit `https://` versehen
- **Custom Keys** – Optional eigene Kurz-URLs wie `github`, `promo2024`
- **Auto-Suffix** – Bei Konflikten wird `-a`, `-b`, `-c`... angehängt
- **180 Tage TTL** – Links löschen sich automatisch nach 180 Tagen

## Web UI

Das Frontend ist in Svelte gebaut und direkt im Worker embedded. Es bietet:

- ❄️ Animierter Schnee-Effekt
- 🎨 Modernes Cyan/Rot Design auf schwarzem Hintergrund
- 📱 QR-Code für jeden erstellten Link
- 🔗 Klickbare Kurz-URLs
- 📋 Ein-Klick Kopieren
- 🎨 Optionaler Custom Key mit Toggle

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

## Lokale Entwicklung

```bash
# Frontend bauen
cd frontend
npm install
npm run build

# Worker starten
cd ..
node build-assets.js  # Assets in src/assets.js embedden
npx wrangler dev
```

## Deployment

```bash
# 1. Secret setzen (erstmalig)
wrangler secret put AUTH_PASSWORD

# 2. Frontend bauen und deployen
cd frontend && npm run build && cd ..
node build-assets.js
npx wrangler deploy
```

## Struktur

- `frontend/src/` - Svelte UI Komponenten
  - `App.svelte` - Hauptkomponente mit Schnee-Effekt
  - `LinkForm.svelte` - Formular mit QR-Code & Copy-Button
  - `SnowEffect.svelte` - Canvas Schnee-Animation
- `src/index.js` - Zentraler Router & Asset Serving
- `src/create.js` - POST-Endpunkt mit Auto-Key & Suffix-Logik
- `src/redirect.js` - GET-Endpunkt für Weiterleitungen
- `src/assets.js` - Embedded Frontend Assets (automatisch generiert)
- `build-assets.js` - Build-Script zum Embedden der Assets
