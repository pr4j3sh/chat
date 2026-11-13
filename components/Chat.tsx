"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bubble, ChatMessage } from "./Bubble";
import { TypingIndicator } from "./TypingIndicator";
import { ChatInput } from "./ChatInput";
import { Backdrop } from "./Backdrop";

type Phase = "intro" | "awaiting-email" | "greeting" | "awaiting-message" | "sending" | "done";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const INTRO_SCRIPT: { text: string; typing: number; gap: number }[] = [
  { text: "hey, 4j3 here", typing: 1100, gap: 350 },
  { text: "glad you made it here", typing: 900, gap: 350 },
  {
    text: "drop your email right here and leave me a message. it goes straight to my inbox",
    typing: 1500,
    gap: 0,
  },
];

function nameFromEmail(email: string): string | null {
  const local = email.split("@")[0] ?? "";
  const run = local.match(/^[a-zA-Z]{2,}/)?.[0];
  if (!run || !/[aeiou]/i.test(run)) return null;
  return run.charAt(0).toUpperCase() + run.slice(1).toLowerCase();
}

function nowTime(): string {
  return new Date().toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function todayLabel(): string {
  const d = new Date();
  const day = d.getDate().toString().padStart(2, "0");
  const month = d.toLocaleString("en", { month: "short" }).toLowerCase();
  return `today · ${day} ${month} · ${nowTime()}`;
}

export function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typing, setTyping] = useState(false);
  const [phase, setPhase] = useState<Phase>("intro");
  const [email, setEmail] = useState("");
  const [dateLabel, setDateLabel] = useState("");
  const [emailMessageId, setEmailMessageId] = useState<string | null>(null);
  const [editingEmail, setEditingEmail] = useState(false);
  const [scrolledDown, setScrolledDown] = useState(false);
  const idRef = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const mountedRef = useRef(true);
  const busyRef = useRef(false);
  const feedRef = useRef<HTMLElement | null>(null);
  const nearBottomRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDateLabel(todayLabel()), 0);
    return () => clearTimeout(t);
  }, []);

  const handleFeedScroll = useCallback(() => {
    const el = feedRef.current;
    if (!el) return;
    setScrolledDown(el.scrollTop > 24);
    nearBottomRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }, []);

  const scrollToBottom = useCallback((smooth = true) => {
    const el = feedRef.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);

  // stick to the newest message, unless the reader scrolled up to read history
  useEffect(() => {
    if (nearBottomRef.current) scrollToBottom();
    handleFeedScroll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, typing, scrollToBottom]);

  // sending or submitting always snaps to the bottom
  useEffect(() => {
    if (phase === "sending" || phase === "done") {
      nearBottomRef.current = true;
      scrollToBottom();
    }
  }, [phase, scrollToBottom]);

  const wait = useCallback((ms: number) => {
    return new Promise<void>((resolve) => {
      timers.current.push(setTimeout(resolve, ms));
    });
  }, []);

  const pushMe = useCallback(
    async (text: string, typingMs = 1100) => {
      setTyping(true);
      await wait(typingMs);
      if (!mountedRef.current) return;
      setTyping(false);
      idRef.current += 1;
      setMessages((prev) => [
        ...prev,
        { id: `m-${idRef.current}`, sender: "me", text, time: nowTime() },
      ]);
      await wait(250);
    },
    [wait],
  );

  const pushThem = useCallback((text: string) => {
    idRef.current += 1;
    const id = `m-${idRef.current}`;
    setMessages((prev) => [
      ...prev,
      { id, sender: "them", text, time: nowTime() },
    ]);
    return id;
  }, []);

  // intro sequence, runs once on mount
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      await wait(900);
      for (const line of INTRO_SCRIPT) {
        if (cancelled) return;
        await pushMe(line.text, line.typing + Math.random() * 400);
        if (line.gap) await wait(line.gap);
      }
      if (!cancelled) setPhase("awaiting-email");
    };
    run();
    return () => {
      cancelled = true;
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [pushMe, wait]);

  const handleEmail = useCallback(
    async (value: string) => {
      if (busyRef.current) return;
      busyRef.current = true;
      nearBottomRef.current = true;
      try {
        // editing an already-sent email: swap the bubble in place, no re-greet
        if (editingEmail && emailMessageId) {
          setEmail(value);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === emailMessageId ? { ...m, text: value, time: nowTime() } : m,
            ),
          );
          setEditingEmail(false);
          setPhase("awaiting-message");
          await pushMe("all good, updated.", 600);
          return;
        }
        setEmail(value);
        const id = pushThem(value);
        setEmailMessageId(id);
        setPhase("greeting");
        const name = nameFromEmail(value);
        await pushMe(name ? `hi ${name}, nice to meet you` : "hi, nice to meet you", 1200);
        await pushMe("so, what's on your mind?", 900);
        setPhase("awaiting-message");
      } finally {
        busyRef.current = false;
      }
    },
    [editingEmail, emailMessageId, pushMe, pushThem],
  );

  const startEditEmail = useCallback(() => {
    setEditingEmail(true);
    setPhase("awaiting-email");
  }, []);

  const handleMessage = useCallback(
    async (text: string, website?: string) => {
      if (busyRef.current) return;
      busyRef.current = true;
      nearBottomRef.current = true;
      pushThem(text);
      setPhase("sending");
      try {
        const res = await fetch("/api/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, message: text, website: website ?? "" }),
        });
        if (!res.ok) {
          // surface rate limiting as a human line, not a fake failure
          if (res.status === 429) {
            await pushMe("slow down a sec, you sent a few already.", 900);
            setPhase("awaiting-message");
            return;
          }
          throw new Error(`send failed: ${res.status}`);
        }
        await pushMe("got it. i'll get back to you soon", 1100);
        setPhase("done");
      } catch {
        await pushMe("hmm, that didn't go through on my end. can you send it again?", 900);
        setPhase("awaiting-message");
      } finally {
        busyRef.current = false;
      }
    },
    [email, pushMe, pushThem],
  );

  const inputMode =
    phase === "awaiting-email"
      ? "email"
      : phase === "awaiting-message" || phase === "sending"
        ? "message"
        : phase === "done"
          ? "done"
          : "hidden";

  const firstMeId = messages.find((m) => m.sender === "me")?.id;

  return (
    <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-[#0a0a0a]">
      <Backdrop />

      {/* floating status line — no navbar chrome */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
        className="absolute left-5 top-5 z-10 flex select-none items-center gap-2 font-serif text-[10px] uppercase tracking-[0.35em] text-zinc-500"
      >
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-zinc-400 opacity-60" />
          <span className="relative inline-flex size-1.5 rounded-full bg-zinc-300" />
        </span>
        4j3&nbsp;·&nbsp;online
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
        className="absolute right-5 top-5 z-10 select-none font-serif text-[10px] uppercase tracking-[0.35em] text-zinc-700"
      >
        hmu
      </motion.div>

      {/* corner wordmark */}
      <motion.footer
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.4, ease: EASE }}
        className="pointer-events-none absolute bottom-4 left-5 z-10 select-none font-serif text-[10px] uppercase tracking-[0.35em] text-zinc-700"
      >
        4j3&nbsp;&nbsp;·&nbsp;&nbsp;hmu
      </motion.footer>
      <motion.footer
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.5, ease: EASE }}
        className="absolute bottom-4 right-5 z-10 flex select-none items-center gap-4 rounded-full border border-white/5 bg-[#0a0a0a]/60 px-4 py-1.5 font-serif italic text-[13px] text-zinc-600 backdrop-blur-md"
      >
        <a
          href="https://github.com/pr4j3sh/chat"
          target="_blank"
          rel="noopener noreferrer"
          className="group transition-colors duration-200 hover:text-zinc-200"
        >
          source <span aria-hidden="true" className="inline-block transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">↗</span>
        </a>
        <span aria-hidden="true" className="text-zinc-800">
          ·
        </span>
        <a
          href="https://pr4j3sh.github.io/pr4j3sh/"
          target="_blank"
          rel="noopener noreferrer"
          className="group transition-colors duration-200 hover:text-zinc-200"
        >
          pr4j3sh <span aria-hidden="true" className="inline-block transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">↗</span>
        </a>
      </motion.footer>

      {/* feed — centered while it fits, vertically scrollable once the chat grows */}
      <main
        ref={feedRef}
        onScroll={handleFeedScroll}
        className={`chat-feed relative z-[1] flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4 py-6 sm:px-6 ${
          scrolledDown ? "feed-mask" : ""
        }`}
      >
        <div
          role="log"
          aria-live="polite"
          aria-relevant="additions"
          className="mx-auto my-auto flex w-full max-w-none flex-col gap-2.5 md:w-[44vw] md:max-w-[720px] md:min-w-[420px]"
        >
          {/* date divider */}
          {dateLabel && (
            <motion.div
              aria-hidden="true"
              className="mb-2 flex select-none items-center gap-3 px-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.45, ease: EASE }}
            >
              <motion.span
                className="h-px flex-1 origin-center bg-white/[0.06]"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.1, delay: 0.45, ease: EASE }}
              />
              <span className="font-serif text-[9px] uppercase tracking-[0.3em] text-zinc-600">
                {dateLabel}
              </span>
              <motion.span
                className="h-px flex-1 origin-center bg-white/[0.06]"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.1, delay: 0.45, ease: EASE }}
              />
            </motion.div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((m, i) => {
              const next = messages[i + 1];
              const showAvatar = m.sender === "me" && (!next || next.sender !== "me");
              const isEmailBubble =
                m.id === emailMessageId &&
                (phase === "awaiting-message" || phase === "greeting");
              const editAction = isEmailBubble ? (
                <button
                  type="button"
                  onClick={startEditEmail}
                  className="group mt-0.5 flex items-center gap-1.5 self-end pr-1 font-serif italic text-[12px] text-zinc-600 transition-colors hover:text-zinc-200"
                  aria-label="Edit email"
                >
                  <svg className="transition-transform duration-200 group-hover:-rotate-6" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  </svg>
                  edit
                </button>
              ) : undefined;
              return (
                <Bubble
                  key={m.id}
                  message={m}
                  showAvatar={showAvatar}
                  showName={m.id === firstMeId}
                  action={editAction}
                />
              );
            })}
            {typing && <TypingIndicator key="typing" />}
            <ChatInput
              key={editingEmail ? "email-edit" : inputMode}
              mode={inputMode}
              sending={phase === "sending"}
              onSubmitEmail={handleEmail}
              onSubmitMessage={handleMessage}
              initialValue={editingEmail ? email : ""}
              caption={editingEmail ? "01 · fix your email" : undefined}
            />
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
