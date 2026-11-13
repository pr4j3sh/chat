"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * Quiet backdrop: a dotted grid dissolving toward the edges, a soft
 * spotlight, and the wordmark looming out of the bottom-right corner
 * and fading into the abyss. The whole canvas drifts a few px against
 * the cursor on a slow spring — felt more than seen.
 */
export function Backdrop() {
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const springX = useSpring(mx, { stiffness: 60, damping: 20, mass: 1.2 });
  const springY = useSpring(my, { stiffness: 60, damping: 20, mass: 1.2 });

  const gridX = useTransform(springX, [0, 1], [6, -6]);
  const gridY = useTransform(springY, [0, 1], [4, -4]);
  const markX = useTransform(springX, [0, 1], [-10, 10]);
  const markY = useTransform(springY, [0, 1], [-7, 7]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mx.set(e.clientX / window.innerWidth);
      my.set(e.clientY / window.innerHeight);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my]);

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* soft spotlight from the top, breathing slowly */}
      <div
        className="spotlight-breathe absolute inset-0"
        style={{
          background:
            "radial-gradient(110% 70% at 50% -10%, rgba(255,255,255,0.055), transparent 60%)," +
            "radial-gradient(90% 70% at 50% 112%, rgba(255,255,255,0.04), transparent 60%)",
        }}
      />

      {/* dotted grid, dissolving toward the edges — drifts against cursor */}
      <motion.div
        className="absolute -inset-4"
        style={{
          x: gridX,
          y: gridY,
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.075) 1.1px, transparent 1.2px)",
          backgroundSize: "24px 24px",
          maskImage:
            "radial-gradient(ellipse 90% 85% at 50% 50%, black 15%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 90% 85% at 50% 50%, black 15%, transparent 75%)",
        }}
      />

      {/* watermark — bottom-right corner, faded into the abyss — drifts with cursor */}
      <motion.div
        className="absolute -inset-4 select-none"
        style={{
          x: markX,
          y: markY,
          maskImage:
            "radial-gradient(ellipse 55% 55% at 100% 100%, black 0%, transparent 65%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 55% 55% at 100% 100%, black 0%, transparent 65%)",
        }}
      >
        <span
          className="absolute -bottom-[3vw] -right-[1.5vw] font-serif italic leading-none"
          style={{
            fontSize: "clamp(9rem, 24vw, 19rem)",
            letterSpacing: "-0.05em",
            WebkitTextStroke: "1.5px rgba(255,255,255,0.09)",
            color: "transparent",
          }}
        >
          hmu
        </span>
      </motion.div>
    </motion.div>
  );
}
