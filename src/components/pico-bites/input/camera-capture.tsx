/**
 * pico.input.camera_capture — trigger for device camera capture.
 */
import { Camera } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { HardwareTriggerNode } from "../_shared";

type IP = PicoBiteProps<Record<string, unknown>, unknown>;

export const CameraCapturePicoBite: React.FC<IP> = (p) => (
  <HardwareTriggerNode icon={<Camera size={36} />} label={(p.config?.label as string) || "Capture Photo"} color="bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white" onClick={() => p.onAction(p.telemetryTag, { action: "activate_camera" })} gateSatisfied={p.gateSatisfied} gateReason={p.gateReason} />
);
