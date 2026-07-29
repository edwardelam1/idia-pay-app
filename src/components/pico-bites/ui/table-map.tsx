/**
 * `pico.ui.table_map` — floor-plan grid of tables with status colour.
 */
import type React from "react";
import { LayoutDashboard } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "@/components/pico-bites/_shared";

export const TableMapPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const tables = (config?.tables as Array<{ id: string; label: string; status?: "open" | "seated" | "dirty" }>) || [];
  if (tables.length === 0) return <SterileState label="No floor plan" icon={<LayoutDashboard size={20} />} />;
  const color = (s?: string) =>
    s === "seated" ? "bg-rose-900 border-rose-600 text-rose-100" : s === "dirty" ? "bg-amber-900 border-amber-600 text-amber-100" : "bg-emerald-900 border-emerald-600 text-emerald-100";
  return (
    <div className="relative w-full h-full bg-slate-950 border-2 border-dashed border-slate-800 grid grid-cols-5 gap-3 p-3">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      {tables.map((t) => (
        <button
          key={t.id}
          onClick={() => onAction(telemetryTag, { action: "select_table", id: t.id })}
          className={`aspect-square rounded-full border-2 flex items-center justify-center text-xs font-bold active:scale-95 transition-all ${color(t.status)}`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
};
