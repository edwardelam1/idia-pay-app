/**
 * pico.loyalty.referral_capture — referral code / referrer contact entry
 * with basic validation state.
 */
import { useState } from "react";
import { UserPlus, CheckCircle2 } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, PicoFrame } from "../_shared";

export const ReferralCapturePicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const [code, setCode] = useState("");
  const [contact, setContact] = useState("");
  const valid = code.trim().length >= 3;

  return (
    <PicoFrame title="Referral Capture" accent="text-teal-400" gateSatisfied={gateSatisfied} gateReason={gateReason}>
      <div className="p-3 flex flex-col gap-2">
        <UserPlus size={16} className="text-teal-400" />
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Referral code"
          className="h-9 px-2 bg-slate-950 border border-slate-800 text-slate-200 text-sm font-mono"
        />
        <input
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="Referrer contact"
          className="h-9 px-2 bg-slate-950 border border-slate-800 text-slate-200 text-sm"
        />
        <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest">
          {valid ? (
            <span className="text-teal-400 flex items-center gap-1"><CheckCircle2 size={12} /> Valid Code</span>
          ) : (
            <span className="text-slate-600">Enter code to validate</span>
          )}
        </div>
        <button
          disabled={!valid}
          onClick={() => onAction(telemetryTag, { action: "capture_referral", code, contact })}
          className="h-10 bg-teal-700 hover:bg-teal-600 disabled:opacity-30 text-white font-bold uppercase text-xs tracking-widest active:scale-[0.98]"
        >
          Submit Referral
        </button>
      </div>
    </PicoFrame>
  );
};
