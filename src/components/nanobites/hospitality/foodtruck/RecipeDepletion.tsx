/**
 * Pico-Bite 2.2 · hosp.ft.inv.deplete_recipe
 * Recipe Depletion — no direct UI input. Auto-triggered by every
 * hosp.ft.pos.kds_fire execution record.
 */
import { useEffect, useState } from "react";
import {
  recordExecution,
  subscribeExecutions,
  getExecutionsFor,
  type ExecutionRecord,
} from "@/lib/idia/executions";
import {
  PicoCard,
  SUBMODULE_ID,
  useCartonCode,
} from "@/components/foodtruck-inputs/shared";

const NANO_BITE_ID = "hosp.ft.inv.deplete_recipe";
const SCREEN = "Dynamic Inventory";
const HANDLED_KEY = "foodtruck.deplete.handledTickets";

function loadHandled(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    return new Set(JSON.parse(localStorage.getItem(HANDLED_KEY) ?? "[]"));
  } catch {
    return new Set();
  }
}
function saveHandled(s: Set<string>) {
  localStorage.setItem(HANDLED_KEY, JSON.stringify([...s]));
}

export default function RecipeDepletion() {
  const cartonCode = useCartonCode();
  const [feed, setFeed] = useState<ExecutionRecord[]>(() =>
    getExecutionsFor(NANO_BITE_ID, cartonCode),
  );

  useEffect(() => {
    const handled = loadHandled();
    const scan = () => {
      const all = getExecutionsFor("hosp.ft.pos.kds_fire", cartonCode);
      let touched = false;
      for (const rec of all) {
        if (handled.has(rec.id)) continue;
        handled.add(rec.id);
        touched = true;
        recordExecution({
          cartonCode,
          subModuleId: SUBMODULE_ID,
          nanoBiteId: NANO_BITE_ID,
          screen: SCREEN,
          action: NANO_BITE_ID,
          payload: {
            sourceTicket: (rec.payload as Record<string, unknown> | undefined)?.ticket,
            sourceExecId: rec.id,
            simulated: true,
          },
        });
      }
      if (touched) saveHandled(handled);
      setFeed(getExecutionsFor(NANO_BITE_ID, cartonCode));
    };
    scan();
    return subscribeExecutions(scan);
  }, [cartonCode]);

  return (
    <PicoCard
      title="Recipe Depletion"
      subtitle="Automatic — fires whenever a KDS ticket is sent"
    >
      <div className="p-4 rounded-2xl bg-secondary text-center">
        <p className="text-[24px] font-semibold tabular-nums">{feed.length}</p>
        <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground mt-1">
          Depletions this session
        </p>
      </div>
      <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
        {feed
          .slice()
          .reverse()
          .slice(0, 8)
          .map((r) => (
            <p key={r.id} className="text-[12px] text-muted-foreground">
              #{String((r.payload as Record<string, unknown>)?.sourceTicket ?? "—")} ·{" "}
              {new Date(r.createdAt).toLocaleTimeString()}
            </p>
          ))}
        {feed.length === 0 && (
          <p className="text-[12px] text-muted-foreground text-center py-2">
            Waiting for KDS tickets…
          </p>
        )}
      </div>
    </PicoCard>
  );
}
