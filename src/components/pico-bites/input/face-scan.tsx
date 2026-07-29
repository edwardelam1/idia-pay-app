/**
 * pico.input.face_scan — trigger for facial recognition biometric scan.
 */
import { ScanFace } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { HardwareTriggerNode } from "../_shared";

type IP = PicoBiteProps<Record<string, unknown>, unknown>;

export const FaceScanPicoBite: React.FC<IP> = (p) => (
  <HardwareTriggerNode icon={<ScanFace size={36} />} label={(p.config?.label as string) || "Scan Face"} color="bg-indigo-950/30 border-indigo-900/50 text-indigo-400 hover:bg-indigo-900/50 hover:text-indigo-300" onClick={() => p.onAction(p.telemetryTag, { action: "poll_facescan" })} gateSatisfied={p.gateSatisfied} gateReason={p.gateReason} />
);
