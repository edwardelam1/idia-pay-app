/**
 * Analytics Pico-Bites — read-only viewers that emit "viewed" telemetry.
 */
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { ActionButton, PicoCard } from "./primitives";

type Row = { label: string; value: string };
type RowsConfig = { title?: string; subtitle?: string; rows?: Row[] };

function RowList({ rows }: { rows: Row[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      {rows.map((r) => (
        <div
          key={r.label}
          className="flex items-center justify-between rounded-xl bg-secondary/60 px-3 py-2 text-[12px]"
        >
          <span className="text-muted-foreground">{r.label}</span>
          <span className="font-semibold tabular-nums">{r.value}</span>
        </div>
      ))}
    </div>
  );
}

// ---------- 5.1 Product Mix ----------------------------------------------
export function ViewPmix({ config, onAction }: PicoBiteProps<RowsConfig, { viewed: "pmix" }>) {
  const rows = config.rows ?? [{ label: "Awaiting live data", value: "—" }];
  return (
    <PicoCard title={config.title ?? "Product Mix"} subtitle={config.subtitle}>
      <RowList rows={rows} />
      <ActionButton variant="ghost" onClick={() => onAction({ viewed: "pmix" })}>
        Mark Reviewed
      </ActionButton>
    </PicoCard>
  );
}

// ---------- 5.2 Labor vs Sales -------------------------------------------
export function LaborVsSales({ config, onAction }: PicoBiteProps<RowsConfig, { viewed: "labor_vs_sales" }>) {
  const rows = config.rows ?? [{ label: "Awaiting live data", value: "—" }];
  return (
    <PicoCard title={config.title ?? "Labor vs Sales"} subtitle={config.subtitle}>
      <RowList rows={rows} />
      <ActionButton variant="ghost" onClick={() => onAction({ viewed: "labor_vs_sales" })}>
        Mark Reviewed
      </ActionButton>
    </PicoCard>
  );
}

// ---------- 5.3 Location Compare -----------------------------------------
export function LocationCompare({
  config,
  onAction,
}: PicoBiteProps<RowsConfig, { viewed: "location_compare" }>) {
  const rows = config.rows ?? [{ label: "Awaiting live data", value: "—" }];
  return (
    <PicoCard title={config.title ?? "Location Compare"} subtitle={config.subtitle}>
      <RowList rows={rows} />
      <ActionButton variant="ghost" onClick={() => onAction({ viewed: "location_compare" })}>
        Mark Reviewed
      </ActionButton>
    </PicoCard>
  );
}

// ---------- 5.4 Ledger Export --------------------------------------------
export function LedgerExport({
  onAction,
}: PicoBiteProps<{ formats?: string[] }, { format: string; exported: true }>) {
  const formats = ["CSV", "PDF"];
  return (
    <PicoCard title="Ledger Export" subtitle="Flat execution log">
      <div className="grid grid-cols-2 gap-2">
        {formats.map((f) => (
          <ActionButton key={f} onClick={() => onAction({ format: f, exported: true })}>
            Export {f}
          </ActionButton>
        ))}
      </div>
    </PicoCard>
  );
}
