/**
 * pico.input.signature_pad — capture and accept customer signature.
 */
import { useState } from "react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay } from "../_shared";

type IP = PicoBiteProps<Record<string, unknown>, unknown>;

export const SignaturePadPicoBite: React.FC<IP> = ({ telemetryTag, config, onAction, gateSatisfied, gateReason }) => {
  const [hasInk, setHasInk] = useState(false);
  const title = (config?.title as string) || "CUSTOMER SIGNATURE";
  return (
    <div className="relative w-full h-48 bg-slate-100 border-2 border-slate-300 rounded flex flex-col overflow-hidden select-none">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="bg-slate-200 px-3 py-2 border-b border-slate-300 flex justify-between items-center">
        <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">{title}</span>
        <button onClick={() => setHasInk(false)} className="text-xs font-bold text-red-500 uppercase tracking-wider px-2 py-1 active:scale-95">Clear</button>
      </div>
      <div className="flex-1 flex items-center justify-center cursor-crosshair active:bg-slate-200 transition-colors"
        onPointerDown={() => { setHasInk(true); onAction(telemetryTag, { action: "signature_started" }); }}>
        {!hasInk ? <span className="text-slate-300 text-3xl italic pointer-events-none">Sign Here x</span> : <span className="text-slate-800 text-4xl italic pointer-events-none">Signed</span>}
      </div>
      <button disabled={!hasInk} onClick={() => onAction(telemetryTag, { action: "signature_accepted" })}
        className="h-12 bg-blue-600 text-white font-bold uppercase tracking-widest disabled:opacity-50 disabled:bg-slate-400 active:bg-blue-700 transition-colors">
        Accept
      </button>
    </div>
  );
};
