"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FormEvent, useEffect, useRef, useState } from "react";

type Props = {
  mode: "email" | "message" | "done" | "hidden";
  sending: boolean;
  onSubmitEmail: (email: string) => void;
  onSubmitMessage: (message: string, website?: string) => void;
  initialValue?: string;
  caption?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * The input IS a right-aligned "ghost" chat bubble — no bottom bar.
 * Picks the sender's slot in the feed and morphs into a real bubble on send.
 */
export function ChatInput({ mode, sending, onSubmitEmail, onSubmitMessage, initialValue = "", caption }: Props) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const honeypotRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (mode === "email" || mode === "message") {
      const t = setTimeout(() => inputRef.current?.focus(), 120);
      return () => clearTimeout(t);
    }
  }, [mode]);

  // auto-grow the textarea up to a cap
  useEffect(() => {
    const el = inputRef.current;
    if (el instanceof HTMLTextAreaElement) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
    }
  }, [value]);

  if (mode === "hidden") return null;

  if (mode === "done") {
    return (
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="w-full pt-2 text-center font-serif text-[10px] uppercase tracking-[0.3em] text-zinc-600 select-none"
      >
        message delivered
      </motion.p>
    );
  }

  const isEmail = mode === "email";
  const hasText = value.trim().length > 0;

  const submit = () => {
    const trimmed = value.trim();
    if (sending) return;

    if (isEmail) {
      if (!EMAIL_RE.test(trimmed)) {
        setError("that doesn't look like a valid email");
        return;
      }
      setError(null);
      onSubmitEmail(trimmed);
    } else {
      if (trimmed.length < 2) {
        setError("say a little more :)");
        return;
      }
      if (trimmed.length > 2000) {
        setError("keep it under 2000 characters");
        return;
      }
      setError(null);
      onSubmitMessage(trimmed, honeypotRef.current?.value ?? "");
      setValue("");
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      className="flex w-full flex-col items-end gap-1.5"
    >
      {error && (
        <p className="pr-2 text-xs text-zinc-500" role="alert">
          {error}
        </p>
      )}
      <p aria-hidden="true" className="select-none pr-2 font-serif text-[9px] uppercase tracking-[0.3em] text-zinc-600">
        {caption ?? (isEmail ? "01 · your email" : "02 · your message")}
      </p>
      <form
        onSubmit={handleSubmit}
        className="relative flex w-full max-w-[85%] items-end gap-2 rounded-2xl rounded-br-md border border-dashed border-white/20 bg-white/[0.02] py-2 pl-4 pr-2 transition-colors focus-within:border-white/35 sm:max-w-[72%]"
      >
        {/* honeypot: hidden from humans, bots fill it */}
        <input
          ref={honeypotRef}
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="pointer-events-none absolute -left-[9999px] h-0 w-0 opacity-0"
        />
        {isEmail ? (
          <input
            ref={(el) => {
              inputRef.current = el;
            }}
            type="email"
            autoComplete="email"
            inputMode="email"
            aria-label="Your email"
            placeholder="your@email.com"
            value={value}
            disabled={sending}
            onChange={(e) => setValue(e.target.value)}
            className="h-8 min-w-0 flex-1 bg-transparent text-[15px] leading-snug text-zinc-100 placeholder-zinc-600 outline-none disabled:opacity-50"
          />
        ) : (
          <textarea
            ref={(el) => {
              inputRef.current = el;
            }}
            rows={1}
            aria-label="Your message"
            placeholder="type your message..."
            value={value}
            disabled={sending}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            className="max-h-40 min-h-8 min-w-0 flex-1 resize-none bg-transparent py-1.5 text-[15px] leading-snug text-zinc-100 placeholder-zinc-600 outline-none disabled:opacity-50"
          />
        )}
        <AnimatePresence>
          {(hasText || sending) && (
            <motion.button
              key="send"
              type="submit"
              disabled={sending || !hasText}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: "spring", stiffness: 500, damping: 28 }}
              aria-label={isEmail ? "Send email" : "Send message"}
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-950 transition hover:bg-white active:scale-90 disabled:opacity-60"
            >
              {sending ? (
                <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
                </svg>
              ) : (
                <svg className="size-4 translate-x-px" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M3.4 20.4l17.45-7.48a1 1 0 0 0 0-1.84L3.4 3.6a.993.993 0 0 0-1.39.91L2 9.12c0 .5.37.93.87.99L17 12 2.87 13.88c-.5.07-.87.5-.87 1l.01 4.61c0 .71.73 1.2 1.39.91z" />
                </svg>
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  );
}
