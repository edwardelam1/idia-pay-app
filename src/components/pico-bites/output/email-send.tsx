/**
 * pico.output.email_send — queues an email notification, showing the
 * configured recipient count.
 */
import { Mail } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, StatusRow } from "../_shared";

type OP = PicoBiteProps<Record<string, unknown>, unknown>;

export const EmailSendPicoBite: React.FC<OP> = ({ telemetryTag, config, onAction, gateSatisfied, gateReason }) => {
  const recipients = config?.recipientCount as number | undefined;
  return (
    <div className="relative w-full flex flex-col gap-1 select-none">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <button
        onClick={() => onAction(telemetryTag, { action: "queue_email" })}
        className="w-full flex items-center gap-3 px-4 py-3 bg-sky-950/20 border border-sky-900/50 hover:bg-sky-900/30 active:scale-[0.98] transition-all"
      >
        <Mail size={20} className="text-sky-400" />
        <span className="text-sm font-bold uppercase tracking-widest text-sky-300">Queue Email</span>
      </button>
      <StatusRow label="Recipients" value={typeof recipients === "number" ? recipients : "—"} tone="text-sky-400" />
    </div>
  );
};
