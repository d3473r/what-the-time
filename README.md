# what-the-time

A frontend-only countdown application built with Nuxt 4. Create shareable countdowns to any event — all data lives in the URL, so there's no backend, no database, and no sign-up required.

## Features

- **No backend** — Event data is encoded as URL-safe base64 directly in the share link (`/e?d=<encoded>`). Nothing is stored server-side.
- **Shareable links** — Send a single URL; the recipient sees a live, ticking countdown.
- **Embeddable widget** — Drop a `<countdown-widget>` Web Component onto any page via a script tag. Fully self-contained with Shadow DOM encapsulation.
- **Timezone-aware** — Pick any IANA timezone when creating an event. Viewers see the target time converted to their local timezone automatically.
- **SSR-safe countdown** — The countdown renders correctly on the server and ticks every second on the client.
- **Dark UI** — Clean slate/emerald theme built with Tailwind CSS.
- **Accessible** — Keyboard-friendly forms, copy buttons with fallback, and route announcers.

## How It Works

1. **Create** — Fill out the event form (title, date, time, timezone, optional stream URL).
2. **Encode** — The event payload is serialized to JSON, UTF-8 encoded, and converted to URL-safe base64 (`+`/`/` → `-`/`_`, padding stripped).
3. **Share** — Get a shareable link like `https://your-site.com/e?d=eyJ0Ijoi...` or an embed snippet for the widget.
4. **View** — The recipient opens the link; the app decodes the base64, validates the payload, and renders a live countdown.

The encoded payload shape:

```ts
interface EventPayload {
  /** ISO 8601 UTC string, e.g. "2026-08-20T15:19:00.000Z" */
  t: string
  /** Event title */
  title: string
  /** Optional URL (e.g. livestream) */
  url?: string
}
```

## Tech Stack

| Layer         | Technology                                      |
| ------------- | ----------------------------------------------- |
| Framework     | [Nuxt 4](https://nuxt.com) / Vue 3              |
| Language      | TypeScript                                      |
| Styling       | [Tailwind CSS](https://tailwindcss.com) + Sass  |
| Date/Time     | [date-fns](https://date-fns.org) + @date-fns/tz |
| Linting       | ESLint (@nuxt/eslint, typescript-eslint)        |
| Formatting    | Prettier (with prettier-plugin-tailwindcss)    |
| Package Mgr   | pnpm                                            |

## Project Structure

```
.
├── app/
│   ├── app.vue                      # Root component
│   ├── assets/css/main.scss         # Global styles & Tailwind directives
│   ├── components/
│   │   ├── CountdownDisplay.vue     # Countdown UI (full / embed variants)
│   │   ├── CopyButton.vue           # Copy-to-clipboard button
│   │   └── EventForm.vue            # Event creation form
│   ├── composables/
│   │   ├── useCountdown.ts          # Reactive countdown timer (SSR-safe)
│   │   ├── useEventCodec.ts         # Encode/decode events to URL-safe base64
│   │   └── useTimezones.ts          # IANA timezone detection & grouping
│   └── pages/
│       ├── index.vue                # Home — create countdown, get share link
│       └── e.vue                    # Event view — decodes ?d= and shows countdown
├── public/
│   ├── widget.js                    # Standalone embeddable Web Component
│   ├── robots.txt
│   └── favicon.ico
├── test/
│   └── codec-check.mts             # Round-trip & malformed-input tests
├── nuxt.config.ts
├── tailwind.config.js
├── eslint.config.mjs
└── package.json
```

## Getting Started

### Prerequisites

- **Node.js** 18+ (or whatever your Nuxt 4 version requires)
- **pnpm** (the project includes `pnpm-lock.yaml` and `pnpm-workspace.yaml`)

### Installation

```bash
pnpm install
```

### Development

Start the dev server on `http://localhost:3000`:

```bash
pnpm dev
```

### Production

Build for production:

```bash
pnpm build
```

Locally preview the production build:

```bash
pnpm preview
```

Generate a fully static site (recommended — this app has no server-side runtime needs):

```bash
pnpm generate
```

## Embeddable Widget

The app ships a standalone Web Component (`public/widget.js`) that renders a self-contained countdown with Shadow DOM. It works on any HTML page, no framework required.

### Usage

```html
<script src="https://your-site.com/widget.js"></script>
<countdown-widget d="eyJ0IjoiMjAyNi0wOC0yMFQxNToxOTowMC4wMDBaIiwidGl0bGUiOiJTcGFjZVggTGF1bmNoIn0"></countdown-widget>
```

The `d` attribute accepts the same URL-safe base64 string used in share links. The widget auto-detects the viewer's local timezone, handles invalid input gracefully, and stops ticking once the event has passed.

### Attributes

| Attribute | Required | Description                                    |
| --------- | -------- | ---------------------------------------------- |
| `d`       | Yes      | URL-safe base64-encoded `EventPayload` string  |

## Scripts

| Script               | Description                          |
| -------------------- | ------------------------------------ |
| `pnpm dev`           | Start the development server         |
| `pnpm build`         | Build for production                 |
| `pnpm generate`      | Generate a static site               |
| `pnpm preview`       | Preview the production build         |
| `pnpm postinstall`   | Run `nuxt prepare` (auto on install) |
| `pnpm lint`          | Run ESLint                           |
| `pnpm lint:fix`      | Run ESLint and auto-fix              |
| `pnpm format`        | Format all files with Prettier       |
| `pnpm format:check`  | Check formatting without writing     |

## Testing

The codec test suite verifies round-trip encoding/decoding, malformed input handling, and payload normalization (including Unicode/emoji titles):

```bash
npx tsx test/codec-check.mts
```

## Deployment

### GitHub Pages

This project includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically builds and deploys to GitHub Pages on every push to `main`.

**One-time setup:**

1. Go to **Settings → Pages** in your repository.
2. Under **Source**, select **GitHub Actions**.
3. Push to `main` — the workflow will build the site with `pnpm generate` and deploy the `.output/public/` directory.

The site will be available at `https://<username>.github.io/<repo-name>/`.

> **Base path**: The workflow sets `NUXT_APP_BASE_URL=/<repo-name>/` so all assets, share links, and embed URLs include the correct subpath. Local development uses `/` (no subpath). If you rename the repo, update the `NUXT_APP_BASE_URL` value in the workflow file.

**Local production preview with base path:**

```bash
NUXT_APP_BASE_URL=/what-the-time/ pnpm generate
pnpm preview
```

### Other static hosts

Run `pnpm generate` and deploy the `.output/public/` directory to Netlify, Vercel, Cloudflare Pages, or any static file host. If the host serves from a subpath, set `NUXT_APP_BASE_URL` accordingly.

See the [Nuxt deployment docs](https://nuxt.com/docs/getting-started/deployment) for more options.

## Code Style

- **Prettier**: no semicolons, single quotes, 2-space indent, 100-char print width, Tailwind class sorting
- **ESLint**: Nuxt defaults + typescript-eslint parser, `vue/multi-word-component-names` disabled
- Run `pnpm lint:fix && pnpm format` before committing.

## License

This project is private. See `package.json` for details.
