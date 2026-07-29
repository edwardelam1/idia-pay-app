/**
 * pico.logic.event_publish — publishes a domain event to config.topic with a payload preview.
 */
import { Send } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "@/components/pico-bites/_shared";

export const EventPublishPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const topic = config?.topic as string | undefined;
  const payload = config?.payload;

  if (!topic) {
    return <SterileState label="NO EVENT TOPIC BOUND" icon={<Send size={20} />} />;
  }

  return (
    <div className="relative w-full bg-slate-950 border border-slate-800 flex flex-col gap-2 px-3 py-2">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <span className="text-[10px] uppercase tracking-widest text-slate-500">Topic</span>
      <span className="text-xs font-mono text-sky-300">{topic}</span>
      <pre className="text-[10px] font-mono text-slate-500 bg-black/40 border border-slate-900 p-2 max-h-16 overflow-y-auto">
        {payload ? JSON.stringify(payload, null, 1) : "// empty payload"}
      </pre>
      <button
        onClick={() => onAction(telemetryTag, { action: "publish_event", topic, payload })}
        className="h-8 flex items-center justify-center gap-2 bg-sky-900/40 hover:bg-sky-800/50 text-sky-200 text-xs font-bold uppercase tracking-widest active:scale-[0.98]"
      >
        <Send size={14} /> Publish
      </button>
    </div>
  );
};
