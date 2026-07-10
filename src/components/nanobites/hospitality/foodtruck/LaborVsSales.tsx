/**
 * Pico-Bite 5.2 · hosp.ft.rpt.view_labor_sales
 * Labor vs. Sales — line/bar chart toggle + date range.
 */
import { useMemo, useState } from "react";
import { recordExecution, getExecutionsFor } from "@/lib/idia/executions";
import {
  ActionButton,
  PicoCard,
  SUBMODULE_ID,
  useCartonCode,
} from "@/components/foodtruck-inputs/shared";

const NANO_BITE_ID = "hosp.ft.rpt.view_labor_sales";
const SCREEN = "Mobile Analytics";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}
function daysBetween(a: string, b: string): string[] {
  const out: string[] = [];
  const d = new Date(a);
  const end = new Date(b);
  while (d <= end) {
    out.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() + 1);
  }
  return out;
}

export default function LaborVsSales() {
  const cartonCode = useCartonCode();
  const [from, setFrom] = useState(today());
  const [to, setTo] = useState(today());
  const [chart, setChart] = useState<"bar" | "line">("bar");

  const data = useMemo(() => {
    const sales = getExecutionsFor("hosp.ft.pos.item_add", cartonCode);
    const punches = getExecutionsFor("hosp.ft.fleet.time_punch", cartonCode);
    const days = daysBetween(from, to);
    return days.map((day) => ({
      day,
      sales: sales.filter((r) => r.createdAt.startsWith(day)).length,
      labor: punches.filter((r) => r.createdAt.startsWith(day)).length,
    }));
  }, [cartonCode, from, to]);

  const max = Math.max(1, ...data.flatMap((d) => [d.sales, d.labor]));

  const emit = () =>
    recordExecution({
      cartonCode,
      subModuleId: SUBMODULE_ID,
      nanoBiteId: NANO_BITE_ID,
      screen: SCREEN,
      action: NANO_BITE_ID,
      payload: { from, to, chart, points: data.length },
    });

  return (
    <PicoCard title="Labor vs. Sales" subtitle="Local telemetry visualization">
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
      <div className="flex items-center gap-3">
        <span className="text-[12px] text-muted-foreground">Chart</span>
        <button
          onClick={() => setChart(chart === "bar" ? "line" : "bar")}
          className="h-9 px-3 rounded-full bg-secondary text-[12px] font-semibold"
        >
          {chart === "bar" ? "Bar → Line" : "Line → Bar"}
        </button>
      </div>
      <div className="h-40 rounded-2xl bg-secondary/40 p-3">
        <svg viewBox={`0 0 ${Math.max(data.length * 40, 40)} 100`} className="w-full h-full">
          {chart === "bar"
            ? data.map((d, i) => (
                <g key={d.day}>
                  <rect
                    x={i * 40 + 4}
                    y={100 - (d.sales / max) * 90}
                    width={14}
                    height={(d.sales / max) * 90}
                    fill="hsl(var(--primary))"
                  />
                  <rect
                    x={i * 40 + 22}
                    y={100 - (d.labor / max) * 90}
                    width={14}
                    height={(d.labor / max) * 90}
                    fill="hsl(var(--muted-foreground))"
                  />
                </g>
              ))
            : (
                <>
                  <polyline
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    points={data
                      .map((d, i) => `${i * 40 + 20},${100 - (d.sales / max) * 90}`)
                      .join(" ")}
                  />
                  <polyline
                    fill="none"
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={2}
                    points={data
                      .map((d, i) => `${i * 40 + 20},${100 - (d.labor / max) * 90}`)
                      .join(" ")}
                  />
                </>
              )}
        </svg>
      </div>
      <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-3 bg-primary rounded-sm" /> Sales (items)
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-3 bg-muted-foreground rounded-sm" /> Labor (punches)
        </span>
      </div>
      <ActionButton onClick={emit}>Log View</ActionButton>
    </PicoCard>
  );
}
