/**
 * `pico.ui.search_bar` — search input with clear/submit affordance and scope badge.
 */
import type React from "react";
import { useState } from "react";
import { Search, X } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay } from "@/components/pico-bites/_shared";

export const SearchBarPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const [query, setQuery] = useState("");
  const scope = (config?.scope as string) || "ALL";
  return (
    <div className="relative w-full h-11 bg-slate-950 border border-slate-800 flex items-center gap-2 px-2">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <Search size={14} className="text-slate-500 shrink-0" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
        onKeyDown={(e) => e.key === "Enter" && onAction(telemetryTag, { action: "run_search", query })}
        className="flex-1 bg-transparent text-sm text-slate-100 outline-none min-w-0"
      />
      {query && (
        <button onClick={() => setQuery("")} className="text-slate-500 hover:text-white shrink-0">
          <X size={14} />
        </button>
      )}
      <span className="shrink-0 text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded">{scope}</span>
      <button
        onClick={() => onAction(telemetryTag, { action: "run_search", query })}
        className="shrink-0 h-7 px-3 bg-sky-700 hover:bg-sky-600 text-white text-[10px] font-bold uppercase rounded active:scale-95 transition-all"
      >
        Go
      </button>
    </div>
  );
};
