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

// ---------- 7.3 Table Handoff --------------------------------------------
export function TableHandoff({
  config,
  onAction,
  gateSatisfied = true,
}: PicoBiteProps<
  { employees?: { id: string; label: string }[]; tables?: { id: string; label: string }[] },
  { toEmployeeId: string; tableIds: string[] }
>) {
  const employees = config.employees ?? [];
  const tables = config.tables ?? [];
  const [target, setTarget] = useState<string | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const togglePick = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  return (
    <PicoCard title="Table Handoff" subtitle="Reassign tables to another server">
      <div className="grid grid-cols-3 gap-2">
        {employees.map((e) => (
          <button
            key={e.id}
            onClick={() => setTarget(e.id)}
            className={`min-h-[40px] rounded-xl text-[12px] font-semibold ${
              target === e.id ? "bg-primary text-primary-foreground" : "bg-secondary"
            }`}
          >
            {e.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2 border-t pt-2">
        {tables.map((t) => {
          const on = picked.includes(t.id);
          return (
            <button
              key={t.id}
              onClick={() => togglePick(t.id)}
              className={`min-h-[40px] rounded-xl text-[12px] font-semibold ${
                on ? "bg-emerald-500/20 text-emerald-700" : "bg-secondary"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      <ActionButton
        disabled={!gateSatisfied || !target || picked.length === 0}
        onClick={() => {
          if (!target) return;
          onAction({ toEmployeeId: target, tableIds: picked });
          toast.success("Handoff complete");
          setTarget(null);
          setPicked([]);
        }}
      >
        Hand Off
      </ActionButton>
    </PicoCard>
  );
}

// ---------- 7.4 Employee Broadcast ---------------------------------------
export function EmployeeBroadcast({
  config,
  onAction,
}: PicoBiteProps<
  { messages?: { id: string; title: string; body: string; postedAt?: string }[] },
  { messageId: string; acknowledged: true }
>) {
  const messages = config.messages ?? [];
  const [acked, setAcked] = useState<Set<string>>(new Set());
  return (
    <PicoCard title="Announcements" subtitle="Tap to acknowledge">
      <div className="flex flex-col gap-1">
        {messages.map((m) => {
          const on = acked.has(m.id);
          return (
            <button
              key={m.id}
              onClick={() => {
                if (on) return;
                setAcked((s) => new Set(s).add(m.id));
                onAction({ messageId: m.id, acknowledged: true });
              }}
              className={`p-2 rounded-lg text-left ${on ? "bg-emerald-500/20" : "bg-secondary"}`}
            >
              <div className="text-[12px] font-semibold">{m.title}</div>
              <div className="text-[11px] text-muted-foreground">{m.body}</div>
              {on && <div className="text-[10px] text-emerald-700 mt-0.5">✓ Acknowledged</div>}
            </button>
          );
        })}
      </div>
    </PicoCard>
  );
}
