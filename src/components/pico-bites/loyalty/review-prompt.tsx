/**
 * pico.loyalty.review_prompt — 1-5 star selector plus send-request action.
 */
import { useState } from "react";
import { Star } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay } from "../_shared";

export const ReviewPromptPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const [rating, setRating] = useState(0);
  return (
    <div className="relative w-full bg-yellow-950/10 border border-yellow-900/40 p-3 flex flex-col items-center gap-3">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-400">Rate Your Experience</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => setRating(n)} className="active:scale-90">
            <Star size={26} className={n <= rating ? "fill-yellow-400 text-yellow-400" : "text-slate-700"} />
          </button>
        ))}
      </div>
      <button
        disabled={rating === 0}
        onClick={() => onAction(telemetryTag, { action: "request_review", rating })}
        className="w-full h-9 bg-yellow-700 hover:bg-yellow-600 disabled:opacity-30 text-white text-xs font-bold uppercase tracking-widest active:scale-[0.98]"
      >
        Send Review Request
      </button>
    </div>
  );
};
