/**
 * pico.input.voice_command — trigger for microphone / voice capture.
 */
import { Mic } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { HardwareTriggerNode } from "../_shared";

type IP = PicoBiteProps<Record<string, unknown>, unknown>;

export const VoiceCommandPicoBite: React.FC<IP> = (p) => (
  <HardwareTriggerNode icon={<Mic size={36} />} label={(p.config?.label as string) || "Hold to Speak"} color="bg-rose-950/30 border-rose-900/50 text-rose-400 hover:bg-rose-900/50 hover:text-rose-300" onClick={() => p.onAction(p.telemetryTag, { action: "activate_mic" })} gateSatisfied={p.gateSatisfied} gateReason={p.gateReason} />
);
