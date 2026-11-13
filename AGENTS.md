# AGENTS.md: hmu

Chat-style contact page. A visitor lands on a scripted conversation with
"4j3", drops their email, leaves a message, and it lands in the owner's
Gmail inbox. No database.

## Stack

Next.js 16 (App Router, Cache Components) · React 19 · Tailwind CSS v4
(CSS-first config in `app/globals.css`, no `tailwind.config.*`) ·
Framer Motion · Nodemailer (Gmail SMTP) · TypeScript strict.

## Commands

- `npm run dev`, dev server
- `npm run build` / `npm start`, production
- `npm run lint`, eslint (flat config, `eslint-config-next`)

## Layout of the code

- `components/Chat.tsx`, the whole client state machine:
  `intro → awaiting-email → greeting → awaiting-message → sending → done`.
  Scripted lines live in `INTRO_SCRIPT`. The feed pins the latest message to
  vertical center; older messages flow up and are masked off the top
  (`.feed-mask`). Latest messages render at `justify-center`.
- `components/Cursor.tsx`, custom cursor (dot + trailing spring ring,
  `mix-blend-difference`). Active only on `(hover: hover) and (pointer:
  fine)`; native cursor hidden only under that query. Touch/coarse pointers
  see nothing.
- `app/icon.tsx` / `app/apple-icon.tsx`, generated icons (black rounded
  tile, italic serif `4j3`). Browser title is `4j3`.
- `components/Bubble.tsx`, message bubble + per-bubble timestamp and `✓✓`
  ticks on own messages. `showAvatar` (last of a consecutive me-run) and
  `showName` (first me message) control the avatar/profile chip.
- `components/ChatInput.tsx`, there is **no bottom bar**. The input IS a
  right-aligned ghost bubble (`01 · your email` → `02 · your message`) that
  morphs into a filled bubble on send. Auto-grows to ~5 lines. The email
  bubble carries a pencil `edit` affordance (visible until the message is
  sent); editing swaps the bubble in place (time refreshed, no re-greet,
  acked with `all good, updated.`).
- `components/Backdrop.tsx`, near-black canvas: soft spotlight, dotted grid
  (radial mask dissolving to edges), stroke-only `hmu` watermark in the
  bottom-right corner fading into the abyss. Pure grey/white alphas only.
- `app/api/send/route.ts`, POST `{ email, message, website? }`. Defenses:
  Origin/Referer vs Host check (403), `Content-Length` > 8 KB rejected (413),
  email ≤254 chars + regex, message 2-2000, honeypot field `website` (bots
  get fake 200, nothing sent), per-IP 5 / 10 min with a bounded, pruned
  map, and a **global cap of 30 sends/day** (in-memory, resets on restart;
  the real backstop against distributed floods). Sends via `lib/mailer.ts`.
  `next.config.ts` sets CSP/DENY/nosniff/referrer policy on all routes.
- `lib/mailer.ts`, Gmail SMTP via Nodemailer; `replyTo` = sender. Dark
  HTML email, all user input escaped.
- `public/avatar.jpg`, profile avatar (vendored, grayscaled in UI).

## Conventions & hard rules

- **Monochrome only.** Shades of black/white/grey (`#0a0a0a`, `#17171a`,
  `#232327`, zinc scale). Zero accent hues, this was an explicit product
  decision. Do not introduce green/teal/emerald/etc.
- **No navbar, no bottom input bar.** Identity lives in small floating mono/
  serif caps in the corners (`4j3 · online` top-left), keep it quiet.
- Feed width: `md:w-[44vw]`, `md:max-w-[720px]`, `md:min-w-[420px]`.
- **Editorial serif** (Instrument Serif, `font-serif`, often italic) for
  labels, timestamps, captions, wordmarks. **Geist** (`font-sans`) for
  message text. Don't mix.
- **Human voice.** Copy is lowercase, casual, short. No emojis, no em
  dashes, no "AI tells". Before editing any user-facing string, read it
  out loud, if it sounds generated, rewrite it.
- Bubbles: 4j3 = `#232327`, visitor = `#17171a` + `white/10` hairline.
  Alignment: 4j3 left (with avatar slot), visitor right.
- Cache Components is on. **No `Date`/randomness during prerender**, 
  compute time-dependent strings after mount (`useEffect`) or in event
  handlers, or the build fails at prerender.
- Avatar images: keep vendored in `public/` (don't hotlink).

## Env

`.env.local` (gitignored, see `.env.local.example`):

- `EMAIL_USER`, Gmail address
- `EMAIL_APP_PASSWORD`, Google **App Password** (2FA required), not the
  account password
- `EMAIL_TO`, inbox for messages (defaults to `EMAIL_USER`)

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
