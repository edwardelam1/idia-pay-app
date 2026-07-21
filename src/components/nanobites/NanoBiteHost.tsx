/**
 * NanoBiteHost — DB-driven Pico-Bite dock for a Nano-Bite container.
 *
 * Renders the resolved Pico-Bites for a given `nanoBiteId` beneath a
 * container's bespoke chrome. Winners render fully; mandatory losers
 * render dimmed with a "Overridden by …" tooltip. Everything is wired
 * through the TelemetryBus so every tap lands in the flat ledger.
 */
import { useEffect, useMemo, useState } from "react";
import {
  fetchNanoPicoLayout,
  type ResolvedLayout,
  type ResolvedPico,
} from "@/lib/idia/nano-pico-resolver";
import { getPicoBite } from "@/components/pico-bites/registry";
import { TelemetryBus } from "@/lib/idia/telemetry-bus";
import { useShiftLock } from "@/components/pico-bites/primitives";
import { useActiveBusinessId } from "@/lib/idia/ActiveBusinessContext";

type Props = {
  nanoBiteId: string;
  cartonCode?: string;
  className?: string;
  title?: string;
};

export default function NanoBiteHost({
  nanoBiteId,
  cartonCode = "",
  className,
  title = "Live Inputs",
}: Props) {
  const [layout, setLayout] = useState<ResolvedLayout | null>(null);
  const businessId = useActiveBusinessId();
  const shift = useShiftLock();

  useEffect(() => {
    let cancelled = false;
    fetchNanoPicoLayout(nanoBiteId).then((l) => {
      if (!cancelled) setLayout(l);
    });
    return () => {
      cancelled = true;
    };
  }, [nanoBiteId]);

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

  if (visible.length === 0) return null;

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
            onEmit={(tag, payload) =>
              TelemetryBus.emit({
                telemetryTag: tag,
                picoBite: b.name,
                cartonCode,
                businessId,
                screen: nanoBiteId,
                subModuleId: nanoBiteId,
                nanoBiteId,
                payload,
              })
            }
          />
        ))}
      </div>
    </section>
  );
}

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
  if (!entry) return null;

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
