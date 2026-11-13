"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * Custom cursor: a solid dot that tracks instantly + a ring that trails
 * with a spring. Only active on precise pointers (mouse/trackpad);
 * touch and coarse pointers get nothing.
 */
export function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [pressing, setPressing] = useState(false);
  const [hidden, setHidden] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 170, damping: 20, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 170, damping: 20, mass: 0.6 });

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const onMove = (e: MouseEvent) => {
      setHidden(false);
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const onLeaveWindow = () => setHidden(true);
    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      setHovering(
        !!t?.closest("a, button, input, textarea, [data-cursor]"),
      );
    };
    const onDown = () => setPressing(true);
    const onUp = () => setPressing(false);

    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeaveWindow);
    window.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeaveWindow);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
    };
  }, [enabled, x, y]);

  if (!enabled || hidden) return null;

  return (
    <>
      {/* dot — instant */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[100] size-2 rounded-full bg-white mix-blend-difference"
        style={{ x, y, translateX: "-50%", translateY: "-50%" }}
      />
      {/* ring — trailing spring */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[100] rounded-full border border-white mix-blend-difference"
        animate={{
          width: hovering ? 52 : 34,
          height: hovering ? 52 : 34,
          opacity: pressing ? 0.55 : 0.9,
          scale: pressing ? 0.8 : 1,
        }}
        transition={{ type: "spring", stiffness: 320, damping: 26, mass: 0.7 }}
        style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
      />
    </>
  );
}
