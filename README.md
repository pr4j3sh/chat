# hmu

A chat-style contact page. Visitors land on a conversation with "4j3", drop
their email, leave a message, and it lands in your inbox. No database.

## Stack

Next.js 16 (App Router, Cache Components) · Tailwind CSS v4 · Framer Motion ·
Nodemailer (Gmail SMTP) · TypeScript

## Setup

1. `npm install`
2. `cp .env.local.example .env.local` and fill in:
   - `EMAIL_USER`, your Gmail address
   - `EMAIL_APP_PASSWORD`, a Google **App Password** (2FA required):
     https://myaccount.google.com/apppasswords
   - `EMAIL_TO`, where messages should land (defaults to `EMAIL_USER`)
3. `npm run dev`, http://localhost:3000

## Scripts

- `npm run dev`, dev server
- `npm run build` / `npm start`, production
- `npm run lint`, eslint

## Notes

- Replies from the notification email go straight to the sender (Reply-To is
  set to their address).
- `/api/send` is hardened: origin check, 8 KB body cap, per-IP 5 / 10 min
  (bounded map), global cap of 30 sends/day, and a honeypot field.
- `next.config.ts` sets CSP and other security headers on all routes.
- Nothing is stored, each message lives only in your inbox.
