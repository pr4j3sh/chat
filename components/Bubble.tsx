"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { CheckCheck } from "lucide-react";

export type Sender = "me" | "them";

export type ChatMessage = {
  id: string;
  sender: Sender;
  text: string;
  time: string;
};

type Props = {
  message: ChatMessage;
  /** last of a consecutive run of my bubbles → show avatar */
  showAvatar?: boolean;
  /** very first message in the thread → show profile chip */
  showName?: boolean;
  /** optional action rendered under the bubble (e.g. edit) */
  action?: ReactNode;
};

export function Bubble({ message, showAvatar = false, showName = false, action }: Props) {
  const mine = message.sender === "me";

  const bubble = (
    <div
      className={[
        "max-w-full px-4 py-2.5 text-[15px] leading-snug whitespace-pre-wrap break-words border",
        mine
          ? "rounded-2xl rounded-bl-md bg-[#232327] text-zinc-100 border-white/[0.06]"
          : "rounded-2xl rounded-br-md bg-[#17171a] text-zinc-200 border-white/10",
      ].join(" ")}
    >
      {message.text}
    </div>
  );

  const meta = (
    <div
      className={`mt-1 flex items-center gap-1.5 font-serif text-[10px] text-zinc-600 ${
        mine ? "justify-start pl-1" : "justify-end pr-1"
      }`}
    >
      <span>{message.time}</span>
      {mine && (
        <CheckCheck size={13} strokeWidth={2} className="text-zinc-500" aria-hidden="true" />
      )}
    </div>
  );

  if (!mine) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 26, scale: 0.92, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
        transition={{ type: "spring", stiffness: 260, damping: 27, mass: 1.05 }}
        className="flex w-full flex-col items-end"
      >
        <div className="max-w-[82%] sm:max-w-[75%]">{bubble}</div>
        {meta}
        {action}
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 26, scale: 0.92, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      transition={{ type: "spring", stiffness: 260, damping: 27, mass: 1.05 }}
      className="flex w-full items-end gap-2.5"
    >
      {/* avatar slot — reserved so bubbles align */}
      <div className="flex size-7 shrink-0 items-end">
        {showAvatar && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 22,
              delay: 0.12,
            }}
          >
            <Image
              src="/avatar.jpg"
              alt="4j3"
              width={28}
              height={28}
              className="size-7 rounded-full object-cover grayscale ring-1 ring-white/15"
            />
          </motion.div>
        )}
      </div>
      <div className="flex min-w-0 max-w-[82%] flex-col items-start sm:max-w-[75%]">
        {showName && (
          <div className="mb-1 flex items-center gap-1.5 pl-1">
            <span className="font-serif text-[10px] uppercase tracking-[0.25em] text-zinc-500">
              4j3
            </span>
            <span className="inline-block size-1 rounded-full bg-zinc-500" />
            <span className="font-serif text-[10px] lowercase tracking-[0.15em] text-zinc-600">
              online
            </span>
          </div>
        )}
        {bubble}
        {meta}
      </div>
    </motion.div>
  );
}
