/**
 * NanoBiteHost — manifest-driven Pico-Bite dock for a Nano-Bite container.
 *
 * The dock renders exactly the Pico-Bites the Hub manifest published for
 * this nano bite (passed in as `picos`), after conflict resolution:
 * winners render fully; mandatory losers render dimmed with an
 * "Overridden by …" tooltip. Everything is wired through the TelemetryBus
 * so every tap lands in the flat ledger. No local caching — a Hub redeploy
 * can never leave ghost tiles behind.
 */
import { useEffect, useMemo, useReducer, useState } from "react";
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

type Props = {
  nanoBiteId: string;
  /** Authoritative dock from the hydrated Hub manifest. */
  picos?: BlueprintPicoBite[];
  cartonCode?: string;
  className?: string;
  title?: string;
};

export default function NanoBiteHost({
  nanoBiteId,
  picos,
  cartonCode = "",
  className,
  title = "Live Inputs",
}: Props) {
  const [layout, setLayout] = useState<ResolvedLayout | null>(null);
  const businessId = useActiveBusinessId();
  const shift = useShiftLock();

  // Localized brain: ephemeral, in-memory, reset whenever the dock changes.
  const [runtime, dispatch] = useReducer(nanoRuntimeReducer, initialNanoRuntime);


  // Legacy containers mount the dock without a spec; fall back to the live
  // cached manifest (never a persisted layout).
  const dock = useMemo(
    () => picos ?? picosForNanoBite(nanoBiteId),
    [picos, nanoBiteId],
  );

  useEffect(() => {
    let cancelled = false;
    setLayout(null);
    dispatch({ tag: "nano.reset", payload: null });
    resolveLayoutFromSpec(nanoBiteId, dock).then((l) => {
      if (!cancelled) setLayout(l);
    });
    return () => {
      cancelled = true;
    };
  }, [nanoBiteId, dock]);



  const visible = useMemo(() => layout?.bites ?? [], [layout]);

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
    <section className={className}>
      <header className="flex items-center justify-between mb-1">
        <p className="text-[9px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          {title}
        </p>
        <span className="text-[9px] text-muted-foreground">
          {visible.filter((b) => b.status === "active").length} active
        </span>
      </header>
      <div className="grid grid-cols-2 gap-1.5">
        {visible.map((b) => (
          <PicoSlot
            key={b.tag}
            bite={b}
            config={projectConfig(b.tag, b.config, runtime)}
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

        ))}
      </div>
    </section>
  );
}

const warned = new Set<string>();

function PicoSlot({
  bite,
  shiftLocked,
  shiftReason,
  onEmit,
}: {
  bite: ResolvedPico;
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
      className={`relative min-h-0 ${dimmed ? "opacity-50 pointer-events-none" : ""}`}
      title={
        dimmed && bite.overriddenBy
          ? `Overridden by ${bite.overriddenBy}`
          : undefined
      }
    >
      <Component
        telemetryTag={bite.tag}
        config={bite.config}
        onAction={onEmit}
        gateSatisfied={!gated}
        gateReason={gated ? shiftReason : undefined}
      />
    </div>
  );
}
