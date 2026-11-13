/**
 * Quiet backdrop: a dotted grid dissolving toward the edges, a soft
 * spotlight, and the wordmark looming out of the bottom-right corner
 * and fading into the abyss.
 */
export function Backdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {/* soft spotlight from the top */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(110% 70% at 50% -10%, rgba(255,255,255,0.055), transparent 60%)," +
            "radial-gradient(90% 70% at 50% 112%, rgba(255,255,255,0.04), transparent 60%)",
        }}
      />

      {/* dotted grid, dissolving toward the edges */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.075) 1.1px, transparent 1.2px)",
          backgroundSize: "24px 24px",
          maskImage:
            "radial-gradient(ellipse 90% 85% at 50% 50%, black 15%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 90% 85% at 50% 50%, black 15%, transparent 75%)",
        }}
      />

      {/* watermark — bottom-right corner, faded into the abyss */}
      <div
        className="absolute inset-0 select-none"
        style={{
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
      </div>
    </div>
  );
}
