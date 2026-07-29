/**
 * pico.sched.reminder — reminder lead time + channel selector with a
 * schedule action.
 */
import { useState } from "react";
import { BellRing } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay } from "@/components/pico-bites/_shared";

export const ReminderPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const leadTimes = (config?.leadTimes as string[]) || ["15m", "1h", "24h"];
  const channels = (config?.channels as string[]) || ["SMS", "Email", "Push"];
  const [lead, setLead] = useState(leadTimes[0] ?? "");
  const [channel, setChannel] = useState(channels[0] ?? "");

  return (
    <div className="relative w-full bg-slate-900 border border-slate-800 flex flex-col select-none">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="px-3 py-2 bg-slate-950 border-b border-slate-800 flex items-center gap-1">
        <BellRing size={12} className="text-purple-400" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">Reminder</span>
      </div>
      <div className="flex gap-1 p-2">
        <select value={lead} onChange={(e) => setLead(e.target.value)} className="flex-1 h-9 bg-slate-950 border border-slate-800 text-xs text-white px-2">
          {leadTimes.map((l) => (<option key={l} value={l}>{l} before</option>))}
        </select>
        <select value={channel} onChange={(e) => setChannel(e.target.value)} className="flex-1 h-9 bg-slate-950 border border-slate-800 text-xs text-white px-2">
          {channels.map((c) => (<option key={c} value={c}>{c}</option>))}
        </select>
      </div>
      <button
        onClick={() => onAction(telemetryTag, { action: "schedule_reminder", lead, channel })}
        className="h-10 mx-2 mb-2 bg-purple-900/40 hover:bg-purple-800/50 text-purple-200 text-xs font-bold uppercase tracking-widest active:scale-[0.98]"
      >
        Schedule Reminder
      </button>
    </div>
  );
};
