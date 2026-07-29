/**
 * pico.output.push_notify — queues a push notification, showing the
 * configured recipient count.
 */
import { BellRing } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, StatusRow } from "../_shared";

type OP = PicoBiteProps<Record<string, unknown>, unknown>;

export const PushNotifyPicoBite: React.FC<OP> = ({ telemetryTag, config, onAction, gateSatisfied, gateReason }) => {
  const recipients = config?.recipientCount as number | undefined;
  return (
    <div className="relative w-full flex flex-col gap-1 select-none">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <button
        onClick={() => onAction(telemetryTag, { action: "queue_push" })}
        className="w-full flex items-center gap-3 px-4 py-3 bg-violet-950/20 border border-violet-900/50 hover:bg-violet-900/30 active:scale-[0.98] transition-all"
      >
        <BellRing size={20} className="text-violet-400" />
        <span className="text-sm font-bold uppercase tracking-widest text-violet-300">Queue Push</span>
      </button>
      <StatusRow label="Recipients" value={typeof recipients === "number" ? recipients : "—"} tone="text-violet-400" />
    </div>
  );
};
