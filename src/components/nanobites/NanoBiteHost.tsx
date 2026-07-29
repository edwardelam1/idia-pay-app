/**
 * NanoBiteHost — manifest-driven Pico-Bite dock for a Nano-Bite container.
 *
 * The dock renders exactly the Pico-Bites the Hub manifest published for
 * this nano bite (passed in as `picos`), after conflict resolution:
 * winners render fully; mandatory losers render dimmed with an
 * "Overridden by …" tooltip. Everything is wired through the TelemetryBus
 * so every tap lands in the flat ledger. No local caching — a Hub redeploy
 * can never leave ghost tiles behind.
 *
 * REARRANGE MODE (iPhone springboard semantics):
 *   long-press a tile → haptic + wiggle → drag to reposition → release to
 *   set → tap the "Done" chip (or outside a tile) to commit. Order persists
 *   per operator in `public.pico_dock_layouts`.
 */
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import {
  initialNanoRuntime,
  nanoRuntimeReducer,
  projectConfig,
} from "@/lib/idia/nano-runtime";
import {
  resolveLayoutFromSpec,
  type ResolvedLayout,
  type ResolvedPico,
} from "@/lib/idia/nano-pico-resolver";
import {
  picosForNanoBite,
  type BlueprintPicoBite,
} from "@/lib/idia/registry";
import { getPicoBite } from "@/components/pico-bites/registry";
import { TelemetryBus } from "@/lib/idia/telemetry-bus";
import { useShiftLock } from "@/components/pico-bites/primitives";
import { useActiveBusinessId } from "@/lib/idia/ActiveBusinessContext";
import {
  applyDockOrder,
  loadDockOrder,
  saveDockOrder,
} from "@/lib/idia/dock-layout";
import "./dock-edit.css";

type Props = {
  nanoBiteId: string;
  /** Authoritative dock from the hydrated Hub manifest. */
  picos?: BlueprintPicoBite[];
  cartonCode?: string;
  className?: string;
  title?: string;
};

const LONG_PRESS_MS = 500;
const DRAG_CANCEL_PX = 10;

function haptic(pattern: number | number[]) {
  try {
    if (typeof window !== "undefined" && window.navigator?.vibrate) {
      window.navigator.vibrate(pattern);
    }
  } catch {
    /* hardware-agnostic */
  }
}

export default function NanoBiteHost({
  nanoBiteId,
  picos,
  cartonCode = "",
  className,
  title = "Live Inputs",
}: Props) {
  const [layout, setLayout] = useState<ResolvedLayout | null>(null);
  const [order, setOrder] = useState<string[] | null>(null);
  const businessId = useActiveBusinessId();
  const shift = useShiftLock();

  // Localized brain: ephemeral, in-memory, reset whenever the dock changes.
  const [runtime, dispatch] = useReducer(nanoRuntimeReducer, initialNanoRuntime);

  // Springboard edit state
  const [editing, setEditing] = useState(false);
  const [dragTag, setDragTag] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const gridRef = useRef<HTMLDivElement | null>(null);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pressOrigin = useRef<{ x: number; y: number } | null>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  // Legacy containers mount the dock without a spec; fall back to the live
  // cached manifest (never a persisted layout).
  const dock = useMemo(
    () => picos ?? picosForNanoBite(nanoBiteId),
    [picos, nanoBiteId],
  );

  useEffect(() => {
    let cancelled = false;
    setLayout(null);
    setOrder(null);
    setEditing(false);
    setDragTag(null);
    dispatch({ tag: "nano.reset", payload: null });
    resolveLayoutFromSpec(nanoBiteId, dock).then((l) => {
      if (!cancelled) setLayout(l);
    });
    loadDockOrder(nanoBiteId, businessId).then((saved) => {
      if (!cancelled && saved) setOrder(saved);
    });
    return () => {
      cancelled = true;
    };
  }, [nanoBiteId, dock, businessId]);

  const visible = useMemo(
    () => applyDockOrder(layout?.bites ?? [], order),
    [layout, order],
  );

  const commitOrder = useCallback(
    (tags: string[]) => {
      setOrder(tags);
      void saveDockOrder(nanoBiteId, businessId, tags);
    },
    [nanoBiteId, businessId],
  );

  // ---- long-press → edit mode -------------------------------------------
  const clearPress = useCallback(() => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
    pressOrigin.current = null;
  }, []);

  const onTilePointerDown = useCallback(
    (e: React.PointerEvent, tag: string) => {
      if (editing) {
        // begin drag immediately
        setDragTag(tag);
        dragStart.current = { x: e.clientX, y: e.clientY };
        setDragOffset({ x: 0, y: 0 });
        (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
        return;
      }
      pressOrigin.current = { x: e.clientX, y: e.clientY };
      pressTimer.current = setTimeout(() => {
        haptic(18);
        setEditing(true);
        pressTimer.current = null;
      }, LONG_PRESS_MS);
    },
    [editing],
  );

  const tileCenters = useCallback(() => {
    const grid = gridRef.current;
    if (!grid) return [] as { tag: string; x: number; y: number }[];
    return Array.from(grid.querySelectorAll<HTMLElement>("[data-pico-tag]")).map(
      (el) => {
        const r = el.getBoundingClientRect();
        return {
          tag: el.dataset.picoTag as string,
          x: r.left + r.width / 2,
          y: r.top + r.height / 2,
        };
      },
    );
  }, []);

  const onTilePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!editing && pressOrigin.current) {
        const dx = Math.abs(e.clientX - pressOrigin.current.x);
        const dy = Math.abs(e.clientY - pressOrigin.current.y);
        if (dx > DRAG_CANCEL_PX || dy > DRAG_CANCEL_PX) clearPress();
        return;
      }
      if (!dragTag || !dragStart.current) return;
      e.preventDefault();
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setDragOffset({ x: dx, y: dy });

      // Swap when the pointer crosses another tile's center.
      const centers = tileCenters();
      const target = centers.find((c) => {
        if (c.tag === dragTag) return false;
        return (
          Math.abs(e.clientX - c.x) < 44 && Math.abs(e.clientY - c.y) < 30
        );
      });
      if (target) {
        const tags = visible.map((b) => b.tag);
        const from = tags.indexOf(dragTag);
        const to = tags.indexOf(target.tag);
        if (from > -1 && to > -1 && from !== to) {
          tags.splice(to, 0, ...tags.splice(from, 1));
          setOrder(tags);
          dragStart.current = { x: e.clientX, y: e.clientY };
          setDragOffset({ x: 0, y: 0 });
          haptic(8);
        }
      }
    },
    [editing, dragTag, visible, clearPress, tileCenters],
  );

  const onTilePointerUp = useCallback(() => {
    clearPress();
    if (dragTag) {
      setDragTag(null);
      dragStart.current = null;
      setDragOffset({ x: 0, y: 0 });
      commitOrder(visible.map((b) => b.tag));
    }
  }, [clearPress, dragTag, visible, commitOrder]);

  const exitEdit = useCallback(() => {
    setEditing(false);
    setDragTag(null);
    commitOrder(visible.map((b) => b.tag));
  }, [visible, commitOrder]);

  if (!layout) {
    return (
      <div className={className}>
        <p className="text-[11px] text-muted-foreground uppercase tracking-[0.14em]">
          Resolving inputs…
        </p>
      </div>
    );
  }

  if (visible.length === 0) {
    return (
      <section className={className}>
        <p className="text-[9px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          No Pico-Bites published for {nanoBiteId}
        </p>
      </section>
    );
  }

  return (
    <section
      className={className}
      onClick={(e) => {
        if (editing && !(e.target as HTMLElement).closest("[data-pico-tag]")) {
          exitEdit();
        }
      }}
    >
      <header className="flex items-center justify-between mb-1">
        <p className="text-[9px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          {editing ? "Arrange Inputs" : title}
        </p>
        {editing ? (
          <button
            type="button"
            onClick={exitEdit}
            className="text-[9px] font-bold uppercase tracking-[0.14em] px-2.5 py-1 rounded-full bg-primary text-primary-foreground"
          >
            Done
          </button>
        ) : (
          <span className="text-[9px] text-muted-foreground">
            {visible.filter((b) => b.status === "active").length} active
          </span>
        )}
      </header>
      <div
        ref={gridRef}
        className={`grid grid-cols-2 gap-1.5 ${editing ? "dock-editing" : ""}`}
        style={editing ? { touchAction: "none" } : undefined}
      >
        {visible.map((b, i) => (
          <div
            key={b.tag}
            data-pico-tag={b.tag}
            className={`dock-tile ${editing ? "dock-tile--wiggle" : ""} ${
              dragTag === b.tag ? "dock-tile--dragging" : ""
            }`}
            style={{
              animationDelay: `${(i % 4) * 90}ms`,
              transform:
                dragTag === b.tag
                  ? `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) scale(1.06)`
                  : undefined,
            }}
            onPointerDown={(e) => onTilePointerDown(e, b.tag)}
            onPointerMove={onTilePointerMove}
            onPointerUp={onTilePointerUp}
            onPointerCancel={onTilePointerUp}
          >
            <PicoSlot
              bite={b}
              config={projectConfig(b.tag, b.config, runtime)}
              interactive={!editing}
              shiftLocked={!shift.ready}
              shiftReason={
                !shift.location
                  ? "Set service location"
                  : !shift.clockedIn
                    ? "Clock in to unlock"
                    : shift.drifted
                      ? "Location drift detected"
                      : undefined
              }
              onEmit={(tag, payload) => {
                if (editing) return;
                // Audit path: unchanged flat ledger emit.
                TelemetryBus.emit({
                  telemetryTag: tag,
                  picoBite: b.name,
                  cartonCode,
                  businessId,
                  screen: nanoBiteId,
                  subModuleId: nanoBiteId,
                  nanoBiteId,
                  payload,
                });
                // Local projection: drives sibling Pico-Bites.
                dispatch({ tag, payload, sourceConfig: b.config });
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

const warned = new Set<string>();

function PicoSlot({
  bite,
  config,
  interactive,
  shiftLocked,
  shiftReason,
  onEmit,
}: {
  bite: ResolvedPico;
  /** Manifest config merged with live runtime state. */
  config?: Record<string, unknown>;
  /** False while the dock is in rearrange mode. */
  interactive: boolean;
  shiftLocked: boolean;
  shiftReason?: string;
  onEmit: (tag: string, payload: unknown) => void;
}) {
  const entry = getPicoBite(bite.tag);
  if (!entry) {
    if (!warned.has(bite.tag)) {
      warned.add(bite.tag);
      console.warn(`[NanoBiteHost] no component registered for tag "${bite.tag}"`);
    }
    return (
      <div className="min-h-[3.5rem] flex flex-col items-center justify-center bg-slate-950 border border-dashed border-slate-800 text-slate-600 p-2 text-center">
        <span className="text-[9px] font-bold uppercase tracking-widest">Unmapped</span>
        <span className="text-[9px] font-mono truncate max-w-full">{bite.tag}</span>
      </div>
    );
  }

  const gated = bite.gate_policy === "shift-lock" && shiftLocked;
  const dimmed = bite.status === "dimmed";
  const Component = entry.component;

  return (
    <div
      className={`relative min-h-0 ${
        dimmed || !interactive ? "pointer-events-none" : ""
      } ${dimmed ? "opacity-50" : ""}`}
      title={
        dimmed && bite.overriddenBy
          ? `Overridden by ${bite.overriddenBy}`
          : undefined
      }
    >
      <Component
        telemetryTag={bite.tag}
        config={config ?? bite.config}
        onAction={onEmit}
        gateSatisfied={!gated}
        gateReason={gated ? shiftReason : undefined}
      />
    </div>
  );
}
