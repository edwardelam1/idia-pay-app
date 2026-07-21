/**
 * Universal `pico.logic.*` + `pico.ambient.*` catalog — offline queues,
 * geofence gates, dwell timers, provenance stamps, feature flags.
 */
import { CloudOff, MapPin, Timer, Fingerprint, ToggleLeft, ToggleRight, ShieldQuestion } from "lucide-react";
import { useState } from "react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileStatus } from "./_shared";

type LG = PicoBiteProps<Record<string, unknown>, unknown>;

export const OfflineQueuePicoBite: React.FC<LG> = ({ config }) => {
  const queued = (config?.queued as number) ?? 0;
  return (
    <div className="w-full flex justify-between items-center px-3 py-2 bg-slate-950 border border-slate-800">
      <span className="text-[10px] uppercase text-slate-500 tracking-widest flex items-center gap-1"><CloudOff size={12} /> Offline Queue</span>
      <span className="text-sm font-mono text-amber-400">{queued}</span>
    </div>
  );
};

export const GeoFencePicoBite: React.FC<LG> = ({ config }) => {
  const inside = Boolean(config?.inside);
  return (
    <SterileStatus label={inside ? "INSIDE GEOFENCE" : "OUTSIDE GEOFENCE"} icon={<MapPin size={12} className={inside ? "text-emerald-400" : "text-red-400"} />} />
  );
};

export const DwellTimerPicoBite: React.FC<LG> = ({ config }) => {
  const seconds = (config?.seconds as number) ?? 0;
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return (
    <div className="w-full flex justify-between items-center px-3 py-2 bg-slate-950 border border-slate-800">
      <span className="text-[10px] uppercase text-slate-500 tracking-widest flex items-center gap-1"><Timer size={12} /> Dwell</span>
      <span className="text-sm font-mono text-cyan-400">{mm}:{ss}</span>
    </div>
  );
};

export const ProvenanceStampPicoBite: React.FC<LG> = ({ telemetryTag, config, onAction, gateSatisfied, gateReason }) => {
  const hash = (config?.hash as string) || "—";
  return (
    <button onClick={() => onAction(telemetryTag, { action: "verify_provenance" })} className="relative w-full flex items-center justify-between px-3 py-2 bg-slate-950 border border-slate-800 hover:bg-slate-900">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <span className="flex items-center gap-2 text-slate-300 text-[10px] uppercase tracking-widest"><Fingerprint size={12} /> Provenance</span>
      <span className="text-[10px] font-mono text-slate-500 truncate max-w-[10rem]">{hash}</span>
    </button>
  );
};

export const FeatureFlagPicoBite: React.FC<LG> = ({ telemetryTag, config, onAction, gateSatisfied, gateReason }) => {
  const label = (config?.label as string) || "Flag";
  const [on, setOn] = useState(Boolean(config?.enabled));
  return (
    <div className="relative w-full flex items-center justify-between px-3 py-2 bg-slate-950 border border-slate-800">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <span className="text-xs text-slate-200 uppercase tracking-widest">{label}</span>
      <button onClick={() => { const v = !on; setOn(v); onAction(telemetryTag, { action: "toggle_flag", value: v }); }} className="text-slate-300">
        {on ? <ToggleRight size={26} className="text-emerald-400" /> : <ToggleLeft size={26} className="text-slate-600" />}
      </button>
    </div>
  );
};

export const RuleGatePicoBite: React.FC<LG> = ({ config }) => {
  const rule = (config?.rule as string) || "rule.unspecified";
  const ok = Boolean(config?.satisfied);
  return (
    <div className={`w-full flex items-center justify-between px-3 py-2 border ${ok ? "bg-emerald-950/30 border-emerald-900/50 text-emerald-300" : "bg-red-950/30 border-red-900/50 text-red-300"}`}>
      <span className="flex items-center gap-2 text-[10px] uppercase tracking-widest"><ShieldQuestion size={12} /> {rule}</span>
      <span className="text-[10px] font-bold uppercase">{ok ? "PASS" : "FAIL"}</span>
    </div>
  );
};
