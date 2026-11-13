import { sendMessageEmail } from "@/lib/mailer";

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,253}\.[^\s@]{2,}$/;
const MAX_MESSAGE = 2000;
const MAX_EMAIL = 254;
const MAX_BODY_BYTES = 8 * 1024;

// per-IP rate limit: best-effort hint (header is spoofable)
const hits = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 5;
const MAX_TRACKED_IPS = 1000;

// global daily cap: real backstop against distributed floods
const DAILY_CAP = 30;
let dayKey = "";
let dayCount = 0;

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function dailyCapReached(): boolean {
  const today = todayKey();
  if (today !== dayKey) {
    dayKey = today;
    dayCount = 0;
  }
  return dayCount >= DAILY_CAP;
}

function recordSend(): void {
  const today = todayKey();
  if (today !== dayKey) {
    dayKey = today;
    dayCount = 0;
  }
  dayCount += 1;
}

function isRateLimited(ip: string, now: number): boolean {
  // bound the map: sweep expired entries, then evict oldest if still too big
  if (hits.size > MAX_TRACKED_IPS) {
    for (const [key, timestamps] of hits) {
      const recent = timestamps.filter((t) => now - t < WINDOW_MS);
      if (recent.length === 0) hits.delete(key);
      else hits.set(key, recent);
    }
    let excess = hits.size - MAX_TRACKED_IPS;
    for (const key of hits.keys()) {
      if (excess <= 0) break;
      hits.delete(key);
      excess -= 1;
    }
  }

  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_HITS) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

function isOriginAllowed(request: Request): boolean {
  const origin = request.headers.get("origin") ?? request.headers.get("referer");
  // non-browser clients may omit both; allow (honeypot + caps still apply)
  if (!origin) return true;
  const host = request.headers.get("host");
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!isOriginAllowed(request)) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return Response.json({ error: "payload too large" }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid JSON" }, { status: 400 });
  }

  const { email, message, website } = (body ?? {}) as {
    email?: unknown;
    message?: unknown;
    website?: unknown;
  };

  // honeypot: bots fill hidden field, humans never see it.
  // pretend success so bots don't adapt.
  if (typeof website === "string" && website.trim().length > 0) {
    return Response.json({ ok: true });
  }

  if (typeof email !== "string") {
    return Response.json({ error: "valid email required" }, { status: 400 });
  }
  const trimmedEmail = email.trim();
  if (
    trimmedEmail.length > MAX_EMAIL ||
    !EMAIL_RE.test(trimmedEmail)
  ) {
    return Response.json({ error: "valid email required" }, { status: 400 });
  }
  if (
    typeof message !== "string" ||
    message.trim().length < 2 ||
    message.trim().length > MAX_MESSAGE
  ) {
    return Response.json(
      { error: `message must be 2-${MAX_MESSAGE} characters` },
      { status: 400 },
    );
  }

  const now = Date.now();
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  if (isRateLimited(ip, now)) {
    return Response.json(
      { error: "too many messages, try again later" },
      { status: 429 },
    );
  }

  if (dailyCapReached()) {
    return Response.json(
      { error: "mailbox is full today, try again tomorrow" },
      { status: 429 },
    );
  }

  try {
    await sendMessageEmail(trimmedEmail, message.trim());
    recordSend();
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[hmu] failed to send email:", err);
    return Response.json(
      { error: "couldn't deliver the message right now" },
      { status: 502 },
    );
  }
}
