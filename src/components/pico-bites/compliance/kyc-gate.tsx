/**
 * pico.compliance.kyc_gate — KYC tier with a checklist of required documents.
 */
import { useState } from "react";
import { FileCheck2 } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "../_shared";

export const KycGatePicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const tier = config?.tier as string | undefined;
  const documents = (config?.documents as string[]) || [];
  const [done, setDone] = useState<Record<string, boolean>>({});

  if (documents.length === 0) return <SterileState label="AWAITING KYC REQUIREMENTS" icon={<FileCheck2 size={20} />} />;

  const allDone = documents.every((d) => done[d]);

  return (
    <div className="relative w-full bg-blue-950/10 border border-blue-900/40 flex flex-col">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="px-3 py-2 border-b border-blue-900/30 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase text-blue-400 tracking-widest">KYC Gate</span>
        {tier && <span className="text-[10px] font-mono text-blue-300 uppercase">Tier {tier}</span>}
      </div>
      <div className="divide-y divide-blue-900/20">
        {documents.map((d) => (
          <button
            key={d}
            onClick={() => setDone((p) => ({ ...p, [d]: !p[d] }))}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-900/10"
          >
            <span className={`w-4 h-4 border ${done[d] ? "bg-blue-600 border-blue-500" : "border-slate-600"}`} />
            <span className="text-sm text-slate-200">{d}</span>
          </button>
        ))}
      </div>
      <div className="p-3">
        <button
          disabled={!allDone}
          onClick={() => onAction(telemetryTag, { action: "submit_kyc", tier, documents })}
          className="w-full h-9 bg-blue-700 hover:bg-blue-600 disabled:opacity-30 text-white text-xs font-bold uppercase active:scale-[0.98]"
        >
          Submit KYC
        </button>
      </div>
    </div>
  );
};
