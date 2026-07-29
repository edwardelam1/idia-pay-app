/**
 * pico.compliance.tax_holiday_flag — tax-exemption window toggle for a
 * jurisdiction.
 */
import { useState } from "react";
import { CalendarOff } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "../_shared";

export const TaxHolidayFlagPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const jurisdiction = config?.jurisdiction as string | undefined;
  const [active, setActive] = useState(false);

  if (!jurisdiction) return <SterileState label="NO JURISDICTION CONFIGURED" icon={<CalendarOff size={20} />} />;

  return (
    <div className="relative w-full bg-amber-950/10 border border-amber-900/40 p-3 flex flex-col gap-3">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase text-amber-400 tracking-widest flex items-center gap-1">
          <CalendarOff size={12} /> Tax Holiday — {jurisdiction}
        </span>
        <button
          onClick={() => {
            const v = !active;
            setActive(v);
            onAction(telemetryTag, { action: "toggle_tax_holiday", jurisdiction, active: v });
          }}
          className={`w-12 h-6 rounded-full relative transition-colors ${active ? "bg-amber-600" : "bg-slate-700"}`}
        >
          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${active ? "left-6" : "left-0.5"}`} />
        </button>
      </div>
      <span className="text-[10px] uppercase tracking-widest text-slate-500">
        {active ? "Exemption Active" : "Exemption Inactive"}
      </span>
    </div>
  );
};
