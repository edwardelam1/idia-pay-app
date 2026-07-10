/**
 * Food Truck Pico-Bite shared input primitives.
 * Large touch-targets, tap-only, no external deps beyond shadcn primitives.
 */
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

// ============================================================================
// ActionButton — min 56px, primary/danger/warning/ghost
// ============================================================================
export type ActionButtonVariant = "primary" | "danger" | "warning" | "ghost";

export function ActionButton({
  variant = "primary",
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ActionButtonVariant }) {
  const variants: Record<ActionButtonVariant, string> = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    warning: "bg-amber-500 text-white hover:bg-amber-600",
    ghost: "bg-secondary text-foreground hover:bg-secondary/80",
  };
  return (
    <button
      {...rest}
      className={cn(
        "min-h-[56px] px-6 rounded-2xl text-[15px] font-semibold transition-all active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none",
        variants[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}

// ============================================================================
// QuantityStepper — −/value/+, press-and-hold repeat
// ============================================================================
export function QuantityStepper({
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);
  const clamp = (n: number) => Math.max(min, Math.min(max, n));
  const startRepeat = (dir: 1 | -1) => {
    const bump = () => {
      const next = clamp(valueRef.current + dir * step);
      valueRef.current = next;
      onChange(next);
    };
    bump();
    let delay = 400;
    const run = () => {
      timer.current = setTimeout(() => {
        bump();
        delay = Math.max(60, delay - 60);
        run();
      }, delay);
    };
    run();
  };
  const stopRepeat = () => {
    if (timer.current) {
      clearTimeout(timer.current as unknown as number);
      timer.current = null;
    }
  };
  useEffect(() => () => stopRepeat(), []);
  return (
    <div className="inline-flex items-center gap-3 select-none">
      <button
        aria-label="Decrease"
        onPointerDown={() => startRepeat(-1)}
        onPointerUp={stopRepeat}
        onPointerLeave={stopRepeat}
        className="h-14 w-14 rounded-2xl bg-secondary text-2xl font-bold active:scale-95"
      >
        −
      </button>
      <span className="min-w-[3ch] text-center text-2xl font-semibold tabular-nums">
        {value}
      </span>
      <button
        aria-label="Increase"
        onPointerDown={() => startRepeat(1)}
        onPointerUp={stopRepeat}
        onPointerLeave={stopRepeat}
        className="h-14 w-14 rounded-2xl bg-primary text-primary-foreground text-2xl font-bold active:scale-95"
      >
        +
      </button>
    </div>
  );
}

// ============================================================================
// LongPressButton — 600ms hold triggers onLongPress; short tap triggers onTap
// ============================================================================
export function LongPressButton({
  onTap,
  onLongPress,
  holdMs = 600,
  className,
  children,
}: {
  onTap?: () => void;
  onLongPress?: () => void;
  holdMs?: number;
  className?: string;
  children: ReactNode;
}) {
  const [progress, setProgress] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const raf = useRef<number | null>(null);
  const startRef = useRef(0);
  const firedRef = useRef(false);

  const clear = () => {
    if (timer.current) clearTimeout(timer.current);
    if (raf.current) cancelAnimationFrame(raf.current);
    timer.current = null;
    raf.current = null;
    setProgress(0);
  };
  const onDown = () => {
    firedRef.current = false;
    startRef.current = performance.now();
    const tick = () => {
      const p = Math.min(1, (performance.now() - startRef.current) / holdMs);
      setProgress(p);
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    timer.current = setTimeout(() => {
      firedRef.current = true;
      clear();
      onLongPress?.();
    }, holdMs);
  };
  const onUp = () => {
    if (!firedRef.current && timer.current) onTap?.();
    clear();
  };
  return (
    <button
      onPointerDown={onDown}
      onPointerUp={onUp}
      onPointerLeave={clear}
      onPointerCancel={clear}
      className={cn(
        "relative overflow-hidden rounded-2xl select-none touch-none active:scale-[0.98] transition-transform",
        className,
      )}
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 bg-black/15 pointer-events-none"
        style={{ width: `${progress * 100}%`, transition: "width 60ms linear" }}
      />
      <span className="relative">{children}</span>
    </button>
  );
}

// ============================================================================
// Numpad — 3×4 grid modal; supports PIN (masked) or currency/quantity entry
// ============================================================================
export function Numpad({
  open,
  title,
  mode = "number",
  onCancel,
  onSubmit,
  maxLength = 12,
}: {
  open: boolean;
  title: string;
  mode?: "pin" | "number" | "currency";
  onCancel: () => void;
  onSubmit: (value: string) => void;
  maxLength?: number;
}) {
  const [buf, setBuf] = useState("");
  useEffect(() => {
    if (open) setBuf("");
  }, [open]);

  const push = useCallback(
    (ch: string) => {
      setBuf((b) => {
        if (ch === "." && (mode !== "currency" || b.includes("."))) return b;
        if (b.length >= maxLength) return b;
        return b + ch;
      });
    },
    [mode, maxLength],
  );
  const back = useCallback(() => setBuf((b) => b.slice(0, -1)), []);
  const clear = useCallback(() => setBuf(""), []);

  if (!open) return null;
  const display =
    mode === "pin"
      ? "•".repeat(buf.length)
      : mode === "currency"
        ? buf
          ? `$${buf}`
          : "$0"
        : buf || "0";
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
  return (
    <div className="fixed inset-0 z-[80] bg-black/50 flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl">
        <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-muted-foreground">
          {title}
        </p>
        <div className="mt-3 h-16 rounded-2xl bg-secondary flex items-center justify-center text-3xl font-semibold tabular-nums">
          {display}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {keys.map((k) => (
            <button
              key={k}
              onClick={() => push(k)}
              className="h-14 rounded-2xl bg-secondary text-xl font-semibold active:scale-95"
            >
              {k}
            </button>
          ))}
          <button
            onClick={mode === "currency" ? () => push(".") : clear}
            className="h-14 rounded-2xl bg-secondary text-lg font-semibold active:scale-95"
          >
            {mode === "currency" ? "." : "C"}
          </button>
          <button
            onClick={() => push("0")}
            className="h-14 rounded-2xl bg-secondary text-xl font-semibold active:scale-95"
          >
            0
          </button>
          <button
            onClick={back}
            className="h-14 rounded-2xl bg-secondary text-lg font-semibold active:scale-95"
          >
            ⌫
          </button>
        </div>
        <div className="mt-4 flex gap-2">
          <ActionButton variant="ghost" className="flex-1" onClick={onCancel}>
            Cancel
          </ActionButton>
          <ActionButton
            className="flex-1"
            disabled={!buf}
            onClick={() => onSubmit(buf)}
          >
            OK
          </ActionButton>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Card shell (consistent framing for Pico-Bite screens)
// ============================================================================
export function PicoCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div
      className="bg-white p-6 flex flex-col gap-4"
      style={{
        borderRadius: 24,
        border: "1px solid #F2F2F7",
        boxShadow: "var(--idia-shadow-card)",
      }}
    >
      <header>
        <h3 className="text-[18px] font-semibold tracking-tight">{title}</h3>
        {subtitle && (
          <p className="text-[12px] text-muted-foreground mt-1">{subtitle}</p>
        )}
      </header>
      {children}
    </div>
  );
}

// ============================================================================
// useCartonCode — resolve active carton from context
// ============================================================================
import { useContext } from "react";
import { ActiveBusinessContext } from "@/lib/idia/ActiveBusinessContext";
export function useCartonCode(): string {
  return useContext(ActiveBusinessContext).provisioningCode ?? "UNKNOWN";
}

export const SUBMODULE_ID = "tertiary.hospitality.food_truck";

// ============================================================================
// Shift lock (Fleet workflow: 4.1 + 4.2 must be satisfied before 1.1)
// ============================================================================
const LOC_KEY = "foodtruck.shift.location";
const CLOCK_KEY = "foodtruck.shift.clockedIn";

export function setShiftLocation(loc: string | null) {
  if (typeof window === "undefined") return;
  if (loc) localStorage.setItem(LOC_KEY, loc);
  else localStorage.removeItem(LOC_KEY);
  window.dispatchEvent(new Event("foodtruck:shift"));
}
export function setShiftClockedIn(on: boolean) {
  if (typeof window === "undefined") return;
  if (on) localStorage.setItem(CLOCK_KEY, "1");
  else localStorage.removeItem(CLOCK_KEY);
  window.dispatchEvent(new Event("foodtruck:shift"));
}
export function useShiftLock() {
  const [state, setState] = useState(() => ({
    location:
      typeof window !== "undefined" ? localStorage.getItem(LOC_KEY) : null,
    clockedIn:
      typeof window !== "undefined" ? localStorage.getItem(CLOCK_KEY) === "1" : false,
  }));
  useEffect(() => {
    if (typeof window === "undefined") return;
    const h = () =>
      setState({
        location: localStorage.getItem(LOC_KEY),
        clockedIn: localStorage.getItem(CLOCK_KEY) === "1",
      });
    window.addEventListener("foodtruck:shift", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("foodtruck:shift", h);
      window.removeEventListener("storage", h);
    };
  }, []);
  return {
    ...state,
    ready: !!state.location && state.clockedIn,
  };
}
