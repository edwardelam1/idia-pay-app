/**
 * Pico-Bite 5.1 · hosp.ft.rpt.view_pmix
 * View PMIX — date range picker + category filter over the local execution cache.
 */
import { useMemo, useState } from "react";
import { recordExecution, getExecutionsFor } from "@/lib/idia/executions";
import {
  ActionButton,
  PicoCard,
  SUBMODULE_ID,
  useCartonCode,
} from "@/components/foodtruck-inputs/shared";

const NANO_BITE_ID = "hosp.ft.rpt.view_pmix";
const SCREEN = "Mobile Analytics";

const CATEGORIES = ["All", "Entrees", "Sides", "Beverages"];

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function ViewPmix() {
  const cartonCode = useCartonCode();
  const [from, setFrom] = useState(today());
  const [to, setTo] = useState(today());
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [pmix, setPmix] = useState<{ sku: string; count: number }[]>([]);

  const run = () => {
    const records = getExecutionsFor("hosp.ft.pos.item_add", cartonCode);
    const inRange = records.filter((r) => {
      const d = r.createdAt.slice(0, 10);
      return d >= from && d <= to;
    });
    const counts = new Map<string, number>();
    for (const r of inRange) {
      const sku = String((r.payload as Record<string, unknown> | undefined)?.sku ?? "?");
      counts.set(sku, (counts.get(sku) ?? 0) + 1);
    }
    const result = [...counts.entries()]
      .map(([sku, count]) => ({ sku, count }))
      .sort((a, b) => b.count - a.count);
    setPmix(result);
    recordExecution({
      cartonCode,
      subModuleId: SUBMODULE_ID,
      nanoBiteId: NANO_BITE_ID,
      screen: SCREEN,
      action: NANO_BITE_ID,
      payload: { from, to, category, resultRows: result.length },
    });
  };

  const max = useMemo(() => Math.max(1, ...pmix.map((p) => p.count)), [pmix]);

  return (
    <PicoCard title="Product Mix (PMIX)" subtitle="Local SQLite/cache query over item adds">
      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-[11px] text-muted-foreground">From</span>
          <input
            type="date"
            className="h-11 rounded-xl border px-3 text-[14px] bg-white"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] text-muted-foreground">To</span>
          <input
            type="date"
            className="h-11 rounded-xl border px-3 text-[14px] bg-white"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>
      </div>
      <select
        className="h-11 rounded-xl border px-3 text-[14px] bg-white"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        {CATEGORIES.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>
      <ActionButton onClick={run}>Run PMIX</ActionButton>
      <div className="flex flex-col gap-1.5">
        {pmix.map((row) => (
          <div key={row.sku} className="flex items-center gap-2">
            <span className="w-32 truncate text-[12px]">{row.sku}</span>
            <div className="flex-1 h-4 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary"
                style={{ width: `${(row.count / max) * 100}%` }}
              />
            </div>
            <span className="w-8 text-right text-[12px] tabular-nums">{row.count}</span>
          </div>
        ))}
        {pmix.length === 0 && (
          <p className="text-[12px] text-muted-foreground text-center py-2">
            Run PMIX to see the mix.
          </p>
        )}
      </div>
    </PicoCard>
  );
}
