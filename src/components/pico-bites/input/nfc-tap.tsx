/**
 * pico.input.nfc_tap — trigger for NFC / tap-to-pay hardware.
 */
import { Wifi } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { HardwareTriggerNode } from "../_shared";

type IP = PicoBiteProps<Record<string, unknown>, unknown>;

export const NfcTapPicoBite: React.FC<IP> = (p) => (
  <HardwareTriggerNode icon={<Wifi size={36} />} label={(p.config?.label as string) || "Tap to Pay"} color="bg-blue-950/30 border-blue-900/50 text-blue-400 hover:bg-blue-900/50 hover:text-blue-300" onClick={() => p.onAction(p.telemetryTag, { action: "poll_nfc" })} gateSatisfied={p.gateSatisfied} gateReason={p.gateReason} />
);
