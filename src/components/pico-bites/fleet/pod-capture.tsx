/**
 * pico.fleet.pod_capture — proof-of-delivery: recipient name plus a
 * signature/photo confirm action.
 */
import { useState } from "react";
import { PackageCheck, Signature, Camera } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay } from "@/components/pico-bites/_shared";

export const PodCapturePicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const [recipient, setRecipient] = useState("");
  const [confirmed, setConfirmed] = useState<"signature" | "photo" | null>(null);

  return (
    <div className="relative w-full bg-slate-900 border border-slate-800 flex flex-col select-none">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="px-3 py-2 bg-slate-950 border-b border-slate-800 flex items-center gap-1">
        <PackageCheck size={12} className="text-blue-400" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Proof Of Delivery</span>
      </div>
      <div className="p-2 flex flex-col gap-1">
        <input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Recipient name" className="h-9 bg-slate-950 border border-slate-800 text-sm text-white px-2 outline-none" />
        <div className="grid grid-cols-2 gap-1">
          <button
            onClick={() => setConfirmed("signature")}
            className={`h-10 flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-widest active:scale-[0.98] ${confirmed === "signature" ? "bg-blue-900/50 text-blue-200 border border-blue-700" : "bg-slate-950 border border-slate-800 text-slate-400"}`}
          >
            <Signature size={12} /> Signature
          </button>
          <button
            onClick={() => setConfirmed("photo")}
            className={`h-10 flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-widest active:scale-[0.98] ${confirmed === "photo" ? "bg-blue-900/50 text-blue-200 border border-blue-700" : "bg-slate-950 border border-slate-800 text-slate-400"}`}
          >
            <Camera size={12} /> Photo
          </button>
        </div>
        <button
          onClick={() => {
            onAction(telemetryTag, { action: "capture_pod", recipient, method: confirmed });
            setRecipient("");
            setConfirmed(null);
          }}
          disabled={!recipient || !confirmed}
          className="h-10 bg-blue-900/40 hover:bg-blue-800/50 disabled:opacity-40 text-blue-200 text-xs font-bold uppercase tracking-widest active:scale-[0.98]"
        >
          Confirm Delivery
        </button>
      </div>
    </div>
  );
};
