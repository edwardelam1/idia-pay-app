/**
 * pico.input.fingerprint — trigger for fingerprint biometric reader.
 */
import { Fingerprint } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { HardwareTriggerNode } from "../_shared";

type IP = PicoBiteProps<Record<string, unknown>, unknown>;

export const FingerprintPicoBite: React.FC<IP> = (p) => (
  <HardwareTriggerNode icon={<Fingerprint size={36} />} label={(p.config?.label as string) || "Scan Fingerprint"} color="bg-purple-950/30 border-purple-900/50 text-purple-400 hover:bg-purple-900/50 hover:text-purple-300" onClick={() => p.onAction(p.telemetryTag, { action: "poll_fingerprint" })} gateSatisfied={p.gateSatisfied} gateReason={p.gateReason} />
);
