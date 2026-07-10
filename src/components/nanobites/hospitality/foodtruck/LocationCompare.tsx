/**
 * Pico-Bite 5.3 · hosp.ft.rpt.loc_compare
 * Location Compare — searchable dropdown of historical events + range.
 */
import { useMemo, useState } from "react";
import { recordExecution, getExecutionsFor } from "@/lib/idia/executions";
import {
  ActionButton,
  PicoCard,
  SUBMODULE_ID,
  useCartonCode,
} from "@/components/foodtruck-inputs/shared";

const NANO_BITE_ID = "hosp.ft.rpt.loc_compare";
const SCREEN = "Mobile Analytics";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function LocationCompare() {
  const cartonCode = useCartonCode();
  const [from, setFrom] = useState(today());
  const [to, setTo] = useState(today());
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<string | null>(null);

  const locations = useMemo(() => {
    const locks = getExecutionsFor("hosp.ft.fleet.loc_lock", cartonCode);
    const names = new Set<string>();
    for (const r of locks) {
      const n = (r.payload as Record<string, unknown> | undefined)?.eventName;
      if (typeof n === "string") names.add(n);
    }
    return [...names];
  }, [cartonCode]);

  const filtered = locations.filter((l) =>
    l.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const run = () => {
    if (!picked) return;
    console.log(`[HARDWARE_STUB]: cloud query → IDIA Hub Vault location=${picked}`);
    recordExecution({
      cartonCode,
      subModuleId: SUBMODULE_ID,
      nanoBiteId: NANO_BITE_ID,
      screen: SCREEN,
      action: NANO_BITE_ID,
      payload: { location: picked, from, to, simulated: true },
    });
  };

  return (
    <PicoCard title="Location Compare" subtitle="Historical event compare via Hub Vault">
      <input
        className="h-11 rounded-xl border px-3 text-[14px] bg-white"
        placeholder="Search historical events"
        value={picked ?? query}
        onChange={(e) => {
          setPicked(null);
          setQuery(e.target.value);
        }}
      />
      {!picked && (
        <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
          {filtered.map((l) => (
            <button
              key={l}
              onClick={() => setPicked(l)}
              className="h-10 px-3 rounded-lg bg-secondary text-left text-[13px]"
            >
              {l}
            </button>
          ))}
          {locations.length === 0 && (
            <p className="text-[12px] text-muted-foreground">
              No prior locations locked yet.
            </p>
          )}
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        <input
          type="date"
          className="h-11 rounded-xl border px-3 text-[14px] bg-white"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <input
          type="date"
          className="h-11 rounded-xl border px-3 text-[14px] bg-white"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
      </div>
      <ActionButton disabled={!picked} onClick={run}>
        Compare
      </ActionButton>
    </PicoCard>
  );
}
