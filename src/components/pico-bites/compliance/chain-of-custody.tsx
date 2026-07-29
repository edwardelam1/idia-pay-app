/**
 * pico.compliance.chain_of_custody — ordered custody handoff list with a
 * handoff action.
 */
import { ArrowRightLeft } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "../_shared";

export const ChainOfCustodyPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const custody = (config?.custody as Array<{ id: string; holder: string; at?: string }>) || [];
  if (custody.length === 0) return <SterileState label="NO CUSTODY RECORDS" icon={<ArrowRightLeft size={20} />} />;

  return (
    <div className="relative w-full bg-sky-950/10 border border-sky-900/40 flex flex-col">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="px-3 py-2 border-b border-sky-900/30 text-[10px] font-bold uppercase text-sky-400 tracking-widest">
        Chain of Custody
      </div>
      <ol className="divide-y divide-sky-900/20">
        {custody.map((c, i) => (
          <li key={c.id} className="flex items-center gap-3 px-3 py-2">
            <span className="w-5 h-5 flex items-center justify-center bg-sky-900/40 text-sky-300 text-[10px] font-mono rounded-full">{i + 1}</span>
            <span className="text-sm text-slate-200 flex-1">{c.holder}</span>
            {c.at && <span className="text-[10px] font-mono text-slate-500">{c.at}</span>}
          </li>
        ))}
      </ol>
      <div className="p-3">
        <button
          onClick={() => onAction(telemetryTag, { action: "record_custody_handoff" })}
          className="w-full h-9 bg-sky-700 hover:bg-sky-600 text-white text-xs font-bold uppercase active:scale-[0.98]"
        >
          Record Handoff
        </button>
      </div>
    </div>
  );
};
