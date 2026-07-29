/**
 * pico.output.sms_send — queues an SMS notification, showing the
 * configured recipient count.
 */
import { MessageSquareText } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, StatusRow } from "../_shared";

type OP = PicoBiteProps<Record<string, unknown>, unknown>;

export const SmsSendPicoBite: React.FC<OP> = ({ telemetryTag, config, onAction, gateSatisfied, gateReason }) => {
  const recipients = config?.recipientCount as number | undefined;
  return (
    <div className="relative w-full flex flex-col gap-1 select-none">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <button
        onClick={() => onAction(telemetryTag, { action: "queue_sms" })}
        className="w-full flex items-center gap-3 px-4 py-3 bg-pink-950/20 border border-pink-900/50 hover:bg-pink-900/30 active:scale-[0.98] transition-all"
      >
        <MessageSquareText size={20} className="text-pink-400" />
        <span className="text-sm font-bold uppercase tracking-widest text-pink-300">Queue SMS</span>
      </button>
      <StatusRow label="Recipients" value={typeof recipients === "number" ? recipients : "—"} tone="text-pink-400" />
    </div>
  );
};
