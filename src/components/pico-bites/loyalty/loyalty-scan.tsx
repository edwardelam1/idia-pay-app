/**
 * pico.loyalty.loyalty_scan — scan-to-identify loyalty trigger.
 */
import { ScanBarcode } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { HardwareTriggerNode } from "../_shared";

export const LoyaltyScanPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const label = (config?.label as string) || "Scan Loyalty Card";
  return (
    <HardwareTriggerNode
      icon={<ScanBarcode size={26} className="text-amber-400" />}
      label={label}
      color="bg-amber-950/20 border-amber-900/50 hover:bg-amber-900/30 text-amber-300"
      onClick={() => onAction(telemetryTag, { action: "scan_loyalty" })}
      gateSatisfied={gateSatisfied}
      gateReason={gateReason}
    />
  );
};
