/**
 * Shared primitives for the universal `pico.*` Pico-Bite catalog.
 * Zero mock data: every list-shaped bite falls back to <SterileState/> when
 * its blueprint `config` is missing.
 */
import type React from "react";
import { Lock } from "lucide-react";

export const GateOverlay: React.FC<{ satisfied?: boolean; reason?: string }> = ({
  satisfied,
  reason,
}) => {
  if (satisfied !== false) return null;
  return (
    <div className="absolute inset-0 z-50 bg-slate-950/95 flex flex-col items-center justify-center text-red-500 rounded-inherit border-2 border-red-900/50 backdrop-blur-sm">
      <Lock size={24} className="mb-2" />
      <span className="text-[10px] font-bold uppercase tracking-widest text-center px-2">
        {reason || "LOCKED"}
      </span>
    </div>
  );
};

export const SterileState: React.FC<{ label: string; icon?: React.ReactNode }> = ({
  label,
  icon,
}) => (
  <div className="w-full h-full min-h-[5rem] flex flex-col items-center justify-center bg-slate-950 border border-slate-800 text-slate-600 select-none p-4 text-center">
    {icon && <div className="mb-2 opacity-50">{icon}</div>}
    <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
  </div>
);

export const SterileStatus: React.FC<{ label: string; icon?: React.ReactNode }> = ({
  label,
  icon,
}) => (
  <div className="relative h-8 px-3 flex items-center gap-2 bg-slate-950 border border-slate-800 text-slate-600 select-none">
    {icon}
    <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
  </div>
);
