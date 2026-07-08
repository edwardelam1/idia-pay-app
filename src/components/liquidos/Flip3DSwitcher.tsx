import { useEffect, useRef, useState, type ReactNode } from "react";
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

  useEffect(() => {
    stageRef.current?.focus();
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onCommit(screens[focus] ?? activeScreen);
        return;
      }
      if (e.key === "Tab" || e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        setFocus((f) => (f + (e.shiftKey && e.key === "Tab" ? -1 : 1) + screens.length) % screens.length);
        return;
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        setFocus((f) => (f - 1 + screens.length) % screens.length);
      }
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [focus, screens, activeScreen, onCommit, onClose]);

  // Card sizing — proportional to viewport
  const CARD_W = Math.min(920, typeof window !== "undefined" ? window.innerWidth * 0.7 : 900);
  const CARD_H = Math.min(600, typeof window !== "undefined" ? window.innerHeight * 0.68 : 560);

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
        style={{ width: "100%", height: "100%" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flip3d-track">
          {screens.map((s, i) => {
            const d = i - focus;
            const rotateY = REDUCED ? 0 : d === 0 ? 0 : -55;
            const tx = d * 90 - CARD_W / 2;
            const ty = (d === 0 ? 0 : 8) - CARD_H / 2;
            const tz = -Math.abs(d) * 180;
            const opacity = d === 0 ? 1 : Math.max(0.55, 1 - Math.abs(d) * 0.12);
            const focused = d === 0;
            return (
              <div
                key={s}
                data-focused={focused}
                className="flip3d-card"
                onClick={() => (focused ? onCommit(s) : setFocus(i))}
                style={{
                  width: CARD_W,
                  height: CARD_H,
                  transform: `translate3d(${tx}px, ${ty}px, ${tz}px) rotateY(${rotateY}deg)`,
                  opacity,
                  zIndex: screens.length - Math.abs(d),
                  cursor: focused ? "pointer" : "pointer",
                }}
              >
                <div className="flip3d-card-inner">
                  <div
                    className="w-full h-full overflow-hidden bg-[#FBFBFD]"
                    style={{ padding: 20 }}
                  >
                    <div className="mb-3">
                      <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-muted-foreground">
                        Screen
                      </p>
                      <h2 className="text-[22px] font-semibold tracking-tight">{s}</h2>
                    </div>
                    <div
                      className="w-full"
                      style={{
                        transform: "scale(0.72)",
                        transformOrigin: "top left",
                        width: "138.9%",
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
          className="absolute left-1/2 -translate-x-1/2 bottom-8 px-5 h-11 flex items-center gap-3 text-[12px] text-white/85"
          style={{
            borderRadius: 18,
            background: "rgba(20,22,30,0.6)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <span className="font-semibold">{screens[focus]}</span>
          <span className="opacity-60">·</span>
          <span className="opacity-70">
            {focus + 1} / {screens.length}
          </span>
          <span className="opacity-40">·</span>
          <span className="opacity-70">Tab cycle · Enter open · Esc cancel</span>
        </div>
      </div>
    </div>
  );
}
