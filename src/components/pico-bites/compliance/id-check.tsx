/**
 * pico.compliance.id_check — document type selector with check-result stamp.
 */
import { useState } from "react";
import { ScanLine, BadgeCheck } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "../_shared";

export const IdCheckPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const docTypes = (config?.documentTypes as string[]) || [];
  const [doc, setDoc] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  if (docTypes.length === 0) return <SterileState label="NO DOCUMENT TYPES CONFIGURED" icon={<ScanLine size={20} />} />;

  return (
    <div className="relative w-full bg-slate-900 border border-slate-800 p-3 flex flex-col gap-2">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Identity Check</div>
      <div className="flex flex-wrap gap-2">
        {docTypes.map((d) => (
          <button
            key={d}
            onClick={() => setDoc(d)}
            className={`px-3 h-8 text-xs font-bold uppercase border ${doc === d ? "bg-slate-700 border-slate-500 text-white" : "bg-slate-950 border-slate-800 text-slate-400"}`}
          >
            {d}
          </button>
        ))}
      </div>
      <button
        disabled={!doc}
        onClick={() => {
          setChecked(true);
          onAction(telemetryTag, { action: "check_id", documentType: doc });
        }}
        className="h-10 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 text-white text-xs font-bold uppercase active:scale-[0.98] flex items-center justify-center gap-2"
      >
        <ScanLine size={14} /> Scan Document
      </button>
      {checked && (
        <div className="flex items-center justify-center gap-2 py-2 border-t border-slate-800 text-emerald-400">
          <BadgeCheck size={16} /> <span className="text-xs font-bold uppercase tracking-widest">Checked</span>
        </div>
      )}
    </div>
  );
};
