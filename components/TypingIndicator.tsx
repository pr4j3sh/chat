"use client";

import { motion } from "framer-motion";

export function TypingIndicator() {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="flex w-full items-end gap-2.5 pl-[38px]"
      aria-label="4j3 is typing"
    >
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-white/[0.06] bg-[#232327] px-4 py-3">
        <span className="typing-dot inline-block size-2 rounded-full bg-zinc-500" />
        <span className="typing-dot inline-block size-2 rounded-full bg-zinc-500" />
        <span className="typing-dot inline-block size-2 rounded-full bg-zinc-500" />
      </div>
    </motion.div>
  );
}
