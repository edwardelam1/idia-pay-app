/**
 * pico.logic.provenance_stamp — hash readout with a verify action.
 */
import { Fingerprint } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "@/components/pico-bites/_shared";

export const ProvenanceStampPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const hash = config?.hash as string | undefined;

  if (!hash) {
    return <SterileState label="NO PROVENANCE HASH" icon={<Fingerprint size={20} />} />;
  }

  return (
    <button
      onClick={() => onAction(telemetryTag, { action: "verify_provenance", hash })}
      className="relative w-full flex flex-col gap-1 px-3 py-2 bg-slate-950 border border-violet-900/40 hover:bg-slate-900 active:scale-[0.98] transition-all"
    >
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-violet-400">
        <Fingerprint size={12} /> Provenance Hash
      </span>
      <span className="text-[11px] font-mono text-slate-300 truncate">{hash}</span>
      <span className="self-end text-[10px] font-bold uppercase text-violet-300">Tap to verify</span>
    </button>
  );
};
