import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import "./flip3d.css";

type Props = {
  screens: string[];
  activeScreen: string;
  renderScreen: (screen: string) => ReactNode;
  onCommit: (screen: string) => void;
  onClose: () => void;
};

const REDUCED =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export default function Flip3DSwitcher({
  screens,
  activeScreen,
  renderScreen,
  onCommit,
  onClose,
}: Props) {
  const initial = Math.max(0, screens.indexOf(activeScreen));
  const [focus, setFocus] = useState(initial);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const touchRef = useRef<{ x: number; y: number; t: number } | null>(null);

  // Viewport-reactive geometry (mobile first).
  const [vp, setVp] = useState(() => ({
    w: typeof window !== "undefined" ? window.innerWidth : 390,
    h: typeof window !== "undefined" ? window.innerHeight : 780,
  }));

  useLayoutEffect(() => {
    const onResize = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

  useEffect(() => {
    stageRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") setFocus((f) => Math.min(screens.length - 1, f + 1));
      else if (e.key === "ArrowLeft") setFocus((f) => Math.max(0, f - 1));
      else if (e.key === "Enter" || e.key === " ") onCommit(screens[focus]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [screens, focus, onClose, onCommit]);

  function onStageTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    touchRef.current = { x: t.clientX, y: t.clientY, t: Date.now() };
  }
  function onStageTouchEnd(e: React.TouchEvent) {
    const start = touchRef.current;
    touchRef.current = null;
    if (!start) return;
    const end = e.changedTouches[0];
    const dx = end.clientX - start.x;
    const dy = end.clientY - start.y;
    const dt = Date.now() - start.t;
    if (dt > 700) return;

    // Horizontal: step focus.
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      if (dx < 0) setFocus((f) => (f + 1) % screens.length);
      else setFocus((f) => (f - 1 + screens.length) % screens.length);
      return;
    }
    // Swipe up on the focused card: dismiss the switcher.
    if (dy < -70 && Math.abs(dy) > Math.abs(dx) * 1.2) onClose();
  }

  const isMobile = vp.w < 700;
  const CARD_W = isMobile
    ? Math.round(Math.min(vp.w * 0.72, 420))
    : Math.round(Math.min(920, vp.w * 0.62));
  const CARD_H = isMobile
    ? Math.round(Math.min(vp.h * 0.6, 620))
    : Math.round(Math.min(600, vp.h * 0.66));
  // Neighbour offset scales with card width so adjacent screens always peek out.
  const STEP_X = Math.round(CARD_W * (isMobile ? 0.42 : 0.3));
  const STEP_Z = isMobile ? 140 : 200;

  return (
    <div
      className="flip3d-overlay fixed inset-0 z-[200] flex items-center justify-center"
      style={{
        background: "rgba(6, 8, 14, 0.55)",
        backdropFilter: "blur(24px) saturate(120%)",
        WebkitBackdropFilter: "blur(24px) saturate(120%)",
      }}
      onClick={onClose}
    >
      <div
        ref={stageRef}
        tabIndex={-1}
        className="flip3d-stage relative outline-none"
        style={{ width: "100%", height: "100%", touchAction: "none" }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onStageTouchStart}
        onTouchEnd={onStageTouchEnd}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-5 right-5 z-10 h-11 w-11 flex items-center justify-center text-white text-[18px] font-semibold"
          style={{
            borderRadius: 999,
            background: "rgba(20,22,30,0.6)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          ✕
        </button>
        <div className="flip3d-track">
          {screens.map((s, i) => {
            const d = i - focus;
            const rotateY = REDUCED ? 0 : d === 0 ? 0 : d < 0 ? 48 : -48;
            const tx = d * STEP_X - CARD_W / 2;
            const ty = (d === 0 ? 0 : 10) - CARD_H / 2;
            const tz = -Math.abs(d) * STEP_Z;
            const opacity = d === 0 ? 1 : Math.max(0.4, 1 - Math.abs(d) * 0.2);
            const focused = d === 0;
            // Far cards are not worth rendering on a phone.
            if (isMobile && Math.abs(d) > 2) return null;
            return (
              <div
                key={s}
                data-focused={focused}
                role="button"
                aria-label={focused ? `Open ${s}` : `Focus ${s}`}
                className="flip3d-card"
                onClick={() => (focused ? onCommit(s) : setFocus(i))}
                style={{
                  width: CARD_W,
                  height: CARD_H,
                  transform: `translate3d(${tx}px, ${ty}px, ${tz}px) rotateY(${rotateY}deg)`,
                  opacity,
                  zIndex: screens.length - Math.abs(d),
                  cursor: "pointer",
                }}
              >
                <div className="flip3d-card-inner">
                  <div
                    className="w-full h-full overflow-hidden bg-[#FBFBFD]"
                    style={{ padding: isMobile ? 12 : 20 }}
                  >
                    <div className="mb-2">
                      <p className="text-[9px] font-semibold tracking-[0.14em] uppercase text-muted-foreground">
                        Screen
                      </p>
                      <h2 className="text-[17px] sm:text-[22px] font-semibold tracking-tight">
                        {s}
                      </h2>
                    </div>
                    <div
                      className="w-full"
                      style={{
                        transform: `scale(${isMobile ? 0.55 : 0.72})`,
                        transformOrigin: "top left",
                        width: isMobile ? "181.8%" : "138.9%",
                      }}
                    >
                      {renderScreen(s)}
                    </div>
                  </div>
                </div>
                {focused && !REDUCED && (
                  <div className="flip3d-reflection">
                    <div className="w-full h-full bg-gradient-to-b from-white/40 to-transparent" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* HUD */}
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-6 sm:bottom-8 px-4 h-10 sm:h-11 flex items-center gap-2 sm:gap-3 text-[11px] sm:text-[12px] text-white/85 max-w-[92vw]"
          style={{
            borderRadius: 18,
            background: "rgba(20,22,30,0.6)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <span className="font-semibold truncate">{screens[focus]}</span>
          <span className="opacity-60">·</span>
          <span className="opacity-70 shrink-0">
            {focus + 1} / {screens.length}
          </span>
          <span className="opacity-40 hidden sm:inline">·</span>
          <span className="opacity-70 hidden sm:inline">Swipe · Tap to open</span>
        </div>
      </div>
    </div>
  );
}
