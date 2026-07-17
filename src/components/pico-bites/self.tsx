/**
 * Self-Management Pico-Bites — Toast "Manage Self" coverage.
 * Employee-scoped actions: breaks, personal sales/tip summary.
 */
import { useState } from "react";
import { toast } from "sonner";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { ActionButton, PicoCard, Numpad } from "./primitives";

// ---------- 7.1 Break Punch ----------------------------------------------
export function BreakPunch({
  onAction,
  gateSatisfied = true,
}: PicoBiteProps<Record<string, never>, { direction: "start" | "end"; at: string }>) {
  const [onBreak, setOnBreak] = useState(false);
  const toggle = () => {
    const direction = onBreak ? "end" : "start";
    setOnBreak(!onBreak);
    onAction({ direction, at: new Date().toISOString() });
    toast.success(direction === "start" ? "Break started" : "Back on shift");
  };
  return (
    <PicoCard title="Break Punch" subtitle={onBreak ? "On break" : "On shift"}>
      <ActionButton
        variant={onBreak ? "primary" : "warning"}
        disabled={!gateSatisfied}
        onClick={toggle}
        className="h-16 text-lg"
      >
        {onBreak ? "End Break" : "Start Break"}
      </ActionButton>
    </PicoCard>
  );
}

// ---------- 7.2 My Sales & Tips ------------------------------------------
export function MySalesAndTips({
  config,
  onAction,
}: PicoBiteProps<{ sales?: number; tips?: number; guests?: number }, { declaredTips: number }>) {
  const sales = config.sales ?? 0;
  const tips = config.tips ?? 0;
  const guests = config.guests ?? 0;
  const [pad, setPad] = useState(false);
  const [declared, setDeclared] = useState<number | null>(null);
  return (
    <PicoCard title="My Sales & Tips" subtitle="Today's summary">
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2 rounded-xl bg-secondary text-center">
          <div className="text-[10px] uppercase text-muted-foreground">Sales</div>
          <div className="text-[15px] font-semibold tabular-nums">${sales.toFixed(0)}</div>
        </div>
        <div className="p-2 rounded-xl bg-secondary text-center">
          <div className="text-[10px] uppercase text-muted-foreground">CC Tips</div>
          <div className="text-[15px] font-semibold tabular-nums">${tips.toFixed(0)}</div>
        </div>
        <div className="p-2 rounded-xl bg-secondary text-center">
          <div className="text-[10px] uppercase text-muted-foreground">Guests</div>
          <div className="text-[15px] font-semibold tabular-nums">{guests}</div>
        </div>
      </div>
      <ActionButton onClick={() => setPad(true)}>
        {declared != null ? `Declared $${declared.toFixed(2)}` : "Declare Cash Tips"}
      </ActionButton>
      <Numpad
        open={pad}
        title="Cash tips declared"
        mode="currency"
        onCancel={() => setPad(false)}
        onSubmit={(v) => {
          const n = parseFloat(v) || 0;
          setDeclared(n);
          onAction({ declaredTips: n });
          setPad(false);
          toast.success("Cash tips declared");
        }}
      />
    </PicoCard>
  );
}
