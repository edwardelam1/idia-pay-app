/**
 * pico.logic.offline_queue — queued-op count with a flush action.
 */
import { CloudOff, RefreshCw } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { HardwareOutputNode } from "@/components/pico-bites/_shared";

export const OfflineQueuePicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const queued = (config?.queued as number) ?? 0;
  return (
    <HardwareOutputNode
      icon={queued > 0 ? <RefreshCw size={20} className="text-amber-400" /> : <CloudOff size={20} className="text-slate-500" />}
      kicker={`${queued} Queued Ops`}
      label="Flush Queue"
      color={queued > 0 ? "bg-amber-950/20 border-amber-900/50 text-amber-200" : "bg-slate-950 border-slate-800 text-slate-500"}
      disabled={queued === 0}
      onClick={() => onAction(telemetryTag, { action: "flush_offline_queue", queued })}
      gateSatisfied={gateSatisfied}
      gateReason={gateReason}
    />
  );
};
