/**
 * pico.crm.customer_lookup — phone/email lookup with a result card from
 * config.result.
 */
import { useState } from "react";
import { Search, UserCircle2 } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "@/components/pico-bites/_shared";

export const CustomerLookupPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const [q, setQ] = useState("");
  const result = config?.result as { name?: string; phone?: string; email?: string; tier?: string } | undefined;

  return (
    <div className="relative w-full bg-slate-900 border border-slate-800 flex flex-col select-none">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="flex items-center px-3 gap-2 h-12 border-b border-slate-800">
        <Search size={16} className="text-blue-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Phone or email"
          className="flex-1 bg-transparent outline-none text-sm text-white"
        />
        <button
          onClick={() => onAction(telemetryTag, { action: "lookup_customer", query: q })}
          className="h-8 px-3 bg-blue-900/50 hover:bg-blue-800/60 text-blue-200 text-xs font-bold uppercase tracking-widest active:scale-[0.98]"
        >
          Find
        </button>
      </div>
      {result ? (
        <div className="flex items-center gap-3 px-3 py-3">
          <UserCircle2 size={28} className="text-blue-300" />
          <div className="flex flex-col">
            <span className="text-sm text-slate-100">{result.name ?? "—"}</span>
            <span className="text-[10px] text-slate-500">{result.phone ?? "—"} · {result.email ?? "—"}</span>
          </div>
          {result.tier && <span className="ml-auto text-[10px] uppercase tracking-widest text-blue-300 border border-blue-800 px-2 py-1">{result.tier}</span>}
        </div>
      ) : (
        <SterileState label="NO CUSTOMER RESULT" icon={<UserCircle2 size={20} />} />
      )}
    </div>
  );
};
