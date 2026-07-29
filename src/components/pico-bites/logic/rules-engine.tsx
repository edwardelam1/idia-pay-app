/**
 * pico.logic.rules_engine — evaluated rule list from config.rules, each with pass/fail.
 */
import { ListChecks, Check, X } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "@/components/pico-bites/_shared";

type Rule = { id: string; label: string; passed: boolean };

export const RulesEnginePicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const rules = (config?.rules as Rule[]) || [];

  if (rules.length === 0) {
    return <SterileState label="NO RULES CONFIGURED" icon={<ListChecks size={20} />} />;
  }

  return (
    <div className="relative w-full bg-slate-900 border border-slate-800 divide-y divide-slate-800">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="px-3 py-2 bg-slate-950 flex items-center justify-between">
        <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-blue-400">
          <ListChecks size={12} /> Rules Engine
        </span>
        <button
          onClick={() => onAction(telemetryTag, { action: "evaluate_rules", ruleIds: rules.map((r) => r.id) })}
          className="text-[10px] font-bold uppercase text-blue-300 hover:text-blue-100"
        >
          Re-evaluate
        </button>
      </div>
      {rules.map((r) => (
        <div key={r.id} className="flex items-center justify-between px-3 py-2">
          <span className="text-xs text-slate-300">{r.label}</span>
          {r.passed ? (
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-emerald-400"><Check size={12} /> Pass</span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-red-400"><X size={12} /> Fail</span>
          )}
        </div>
      ))}
    </div>
  );
};
