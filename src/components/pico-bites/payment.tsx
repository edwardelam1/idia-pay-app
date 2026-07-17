/**
 * Payment Pico-Bites.
 */
import { useState } from "react";
import { toast } from "sonner";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { ActionButton, PicoCard, Numpad, ManagerAuth } from "./primitives";

// ---------- 3.1 Contactless Tap (NFC) ------------------------------------
export function ContactlessTap({
  onAction,
  gateSatisfied = true,
}: PicoBiteProps<{ subtitle?: string }, { amount: number; rail: "nfc" }>) {
  const [pad, setPad] = useState(false);
  return (
    <PicoCard title="Contactless Tap" subtitle="NFC / EMV">
      <ActionButton
        onClick={() => setPad(true)}
        disabled={!gateSatisfied}
        className="h-16 text-lg"
      >
        Start Tap
      </ActionButton>
      <Numpad
        open={pad}
        title="Charge amount"
        mode="currency"
        onCancel={() => setPad(false)}
        onSubmit={(v) => {
          onAction({ amount: parseFloat(v) || 0, rail: "nfc" });
          setPad(false);
        }}
      />
    </PicoCard>
  );
}

// ---------- 3.2 Offline Fallback -----------------------------------------
export function OfflineFallback({
  onAction,
  gateSatisfied = true,
}: PicoBiteProps<Record<string, never>, { amount: number; rail: "offline" }>) {
  const [pad, setPad] = useState(false);
  return (
    <PicoCard title="Offline Fallback" subtitle="Store-and-forward">
      <ActionButton
        variant="warning"
        onClick={() => setPad(true)}
        disabled={!gateSatisfied}
      >
        Queue Offline Charge
      </ActionButton>
      <Numpad
        open={pad}
        title="Offline charge"
        mode="currency"
        onCancel={() => setPad(false)}
        onSubmit={(v) => {
          onAction({ amount: parseFloat(v) || 0, rail: "offline" });
          setPad(false);
        }}
      />
    </PicoCard>
  );
}

// ---------- 3.3 Cloud Re-Sync (batch) ------------------------------------
export function CloudReSync({
  onAction,
}: PicoBiteProps<{ pendingCount?: number }, { syncTriggered: true }>) {
  const [busy, setBusy] = useState(false);
  return (
    <PicoCard title="Cloud Re-Sync" subtitle="Batch offline queue">
      <ActionButton
        onClick={() => {
          setBusy(true);
          onAction({ syncTriggered: true });
          setTimeout(() => setBusy(false), 800);
        }}
        disabled={busy}
      >
        {busy ? "Syncing…" : "Sync Now"}
      </ActionButton>
    </PicoCard>
  );
}

// ---------- 3.4 Drawer State ---------------------------------------------
export function DrawerState({
  config,
  onAction,
}: PicoBiteProps<{ mode?: "toggle" | "open_count" | "close_count" }, { state: "open" | "closed" | "counted"; count?: number; mode: string; at: string }>) {
  const mode = config.mode ?? "toggle";
  const [state, setState] = useState<"open" | "closed">("closed");
  const [pad, setPad] = useState(false);
  const set = (s: "open" | "closed") => {
    setState(s);
    onAction({ state: s, mode, at: new Date().toISOString() });
  };
  const isCount = mode === "open_count" || mode === "close_count";
  const label = mode === "open_count" ? "Opening Cash Count" : mode === "close_count" ? "Closing Cash Count" : "Cash Drawer";
  return (
    <PicoCard title={label} subtitle={isCount ? "Enter drawer total" : `Currently ${state}`}>
      {isCount ? (
        <ActionButton onClick={() => setPad(true)}>Count Drawer</ActionButton>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <ActionButton variant={state === "open" ? "primary" : "ghost"} onClick={() => set("open")}>
            Open
          </ActionButton>
          <ActionButton variant={state === "closed" ? "primary" : "ghost"} onClick={() => set("closed")}>
            Closed
          </ActionButton>
        </div>
      )}
      <Numpad
        open={pad}
        title={label}
        mode="currency"
        onCancel={() => setPad(false)}
        onSubmit={(v) => {
          onAction({ state: "counted", count: parseFloat(v) || 0, mode, at: new Date().toISOString() });
          setPad(false);
        }}
      />
    </PicoCard>
  );
}

// ---------- 3.5 Split Even -----------------------------------------------
export function SplitEven({
  onAction,
  gateSatisfied = true,
}: PicoBiteProps<{ total?: number }, { splitCount: number; perGuest: number; total: number }>) {
  const [total, setTotal] = useState<number>(0);
  const [count, setCount] = useState<number>(2);
  const [pad, setPad] = useState<null | "total" | "count">(null);
  const per = count > 0 ? total / count : 0;
  return (
    <PicoCard title="Split Evenly" subtitle="Divide check across guests">
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setPad("total")}
          className="p-3 rounded-xl bg-secondary text-left"
        >
          <div className="text-[10px] text-muted-foreground uppercase">Total</div>
          <div className="text-[18px] font-semibold tabular-nums">${total.toFixed(2)}</div>
        </button>
        <button
          onClick={() => setPad("count")}
          className="p-3 rounded-xl bg-secondary text-left"
        >
          <div className="text-[10px] text-muted-foreground uppercase">Split</div>
          <div className="text-[18px] font-semibold tabular-nums">{count} ways</div>
        </button>
      </div>
      <div className="p-3 rounded-xl bg-primary/10 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground uppercase">Per guest</span>
        <span className="text-[20px] font-semibold tabular-nums">${per.toFixed(2)}</span>
      </div>
      <ActionButton
        disabled={!gateSatisfied || total <= 0 || count <= 0}
        onClick={() => onAction({ splitCount: count, perGuest: per, total })}
      >
        Apply Split
      </ActionButton>
      <Numpad
        open={pad === "total"}
        title="Check total"
        mode="currency"
        onCancel={() => setPad(null)}
        onSubmit={(v) => {
          setTotal(parseFloat(v) || 0);
          setPad(null);
        }}
      />
      <Numpad
        open={pad === "count"}
        title="Split count"
        mode="pin"
        maxLength={2}
        onCancel={() => setPad(null)}
        onSubmit={(v) => {
          setCount(parseInt(v, 10) || 1);
          setPad(null);
        }}
      />
    </PicoCard>
  );
}

// ---------- 3.6 Split By Item --------------------------------------------
type LineItem = { id: string; label: string; price: number };
export function SplitByItem({
  config,
  onAction,
  gateSatisfied = true,
}: PicoBiteProps<{ items?: LineItem[]; checkCount?: number }, { assignments: Record<string, number>; totals: number[] }>) {
  const items = config.items ?? [
    { id: "l1", label: "Taco", price: 4.5 },
    { id: "l2", label: "Burrito", price: 9 },
    { id: "l3", label: "Horchata", price: 3 },
    { id: "l4", label: "Nachos", price: 6.5 },
  ];
  const checkCount = config.checkCount ?? 2;
  const [assignments, setAssignments] = useState<Record<string, number>>({});
  const cycle = (id: string) => {
    setAssignments((a) => ({ ...a, [id]: ((a[id] ?? -1) + 1) % checkCount }));
  };
  const totals = Array.from({ length: checkCount }).map((_, i) =>
    items.filter((it) => assignments[it.id] === i).reduce((s, it) => s + it.price, 0),
  );
  return (
    <PicoCard title="Split by Item" subtitle={`Assign to ${checkCount} checks`}>
      <div className="flex flex-col gap-1">
        {items.map((it) => {
          const c = assignments[it.id];
          return (
            <button
              key={it.id}
              disabled={!gateSatisfied}
              onClick={() => cycle(it.id)}
              className="flex items-center justify-between p-2 rounded-lg bg-secondary text-[13px]"
            >
              <span>{it.label}</span>
              <div className="flex items-center gap-2">
                <span className="tabular-nums text-muted-foreground">${it.price.toFixed(2)}</span>
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[11px] font-semibold">
                  {c == null ? "—" : c + 1}
                </span>
              </div>
            </button>
          );
        })}
      </div>
      <div className="grid grid-cols-2 gap-1 text-[11px]">
        {totals.map((t, i) => (
          <div key={i} className="p-2 rounded-lg bg-primary/10 flex justify-between">
            <span>Check {i + 1}</span>
            <span className="font-semibold tabular-nums">${t.toFixed(2)}</span>
          </div>
        ))}
      </div>
      <ActionButton disabled={!gateSatisfied} onClick={() => onAction({ assignments, totals })}>
        Finalize Split
      </ActionButton>
    </PicoCard>
  );
}

// ---------- 3.7 Tip & Close ----------------------------------------------
export function TipAndClose({
  config,
  onAction,
  gateSatisfied = true,
}: PicoBiteProps<{ subtotal?: number; presets?: number[] }, { subtotal: number; tip: number; total: number }>) {
  const subtotal = config.subtotal ?? 0;
  const presets = config.presets ?? [0.15, 0.18, 0.20, 0.25];
  const [tip, setTip] = useState<number>(0);
  const [pad, setPad] = useState(false);
  return (
    <PicoCard title="Tip & Close" subtitle={`Subtotal $${subtotal.toFixed(2)}`}>
      <div className="grid grid-cols-4 gap-2">
        {presets.map((p) => {
          const amt = subtotal * p;
          return (
            <button
              key={p}
              disabled={!gateSatisfied}
              onClick={() => setTip(amt)}
              className={`aspect-square rounded-xl font-semibold text-[12px] flex flex-col items-center justify-center ${
                Math.abs(tip - amt) < 0.005 ? "bg-primary text-primary-foreground" : "bg-secondary"
              }`}
            >
              <span>{Math.round(p * 100)}%</span>
              <span className="text-[10px] opacity-70">${amt.toFixed(2)}</span>
            </button>
          );
        })}
      </div>
      <ActionButton variant="ghost" onClick={() => setPad(true)}>
        Custom Tip
      </ActionButton>
      <div className="p-3 rounded-xl bg-primary/10 flex items-center justify-between">
        <span className="text-[11px] uppercase text-muted-foreground">Total</span>
        <span className="text-[20px] font-semibold tabular-nums">${(subtotal + tip).toFixed(2)}</span>
      </div>
      <ActionButton
        disabled={!gateSatisfied}
        onClick={() => onAction({ subtotal, tip, total: subtotal + tip })}
      >
        Close Check
      </ActionButton>
      <Numpad
        open={pad}
        title="Custom tip"
        mode="currency"
        onCancel={() => setPad(false)}
        onSubmit={(v) => {
          setTip(parseFloat(v) || 0);
          setPad(false);
        }}
      />
    </PicoCard>
  );
}

// ---------- 3.8 Adjust Payment -------------------------------------------
export function AdjustPayment({
  config,
  onAction,
}: PicoBiteProps<{ threshold?: number; originalAmount?: number }, { newAmount: number; delta: number; managerAuthed: boolean }>) {
  const threshold = config.threshold ?? 5;
  const original = config.originalAmount ?? 0;
  const [pad, setPad] = useState(false);
  const [pending, setPending] = useState<number | null>(null);
  const [auth, setAuth] = useState(false);
  const commit = (managerAuthed: boolean) => {
    if (pending == null) return;
    onAction({ newAmount: pending, delta: pending - original, managerAuthed });
    setPending(null);
  };
  return (
    <PicoCard title="Adjust Payment" subtitle={`Original $${original.toFixed(2)}`}>
      <ActionButton onClick={() => setPad(true)}>Adjust Amount</ActionButton>
      <Numpad
        open={pad}
        title="New amount"
        mode="currency"
        onCancel={() => setPad(false)}
        onSubmit={(v) => {
          const n = parseFloat(v) || 0;
          setPad(false);
          setPending(n);
          if (Math.abs(n - original) > threshold) setAuth(true);
          else {
            onAction({ newAmount: n, delta: n - original, managerAuthed: false });
            setPending(null);
            toast.success("Adjustment saved");
          }
        }}
      />
      <ManagerAuth
        open={auth}
        title="Approve adjustment"
        onCancel={() => {
          setAuth(false);
          setPending(null);
        }}
        onAuthed={() => {
          setAuth(false);
          commit(true);
          toast.success("Adjustment approved");
        }}
      />
    </PicoCard>
  );
}

// ---------- 3.9 Cash Tender ----------------------------------------------
export function CashTender({
  config,
  onAction,
  gateSatisfied = true,
}: PicoBiteProps<{ amountDue?: number }, { amountDue: number; received: number; change: number }>) {
  const due = config.amountDue ?? 0;
  const [received, setReceived] = useState<number>(0);
  const [pad, setPad] = useState(false);
  const change = Math.max(0, received - due);
  return (
    <PicoCard title="Cash Tender" subtitle={`Amount due $${due.toFixed(2)}`}>
      <ActionButton disabled={!gateSatisfied} onClick={() => setPad(true)}>
        {received > 0 ? `Received $${received.toFixed(2)}` : "Enter Cash Received"}
      </ActionButton>
      <div className="p-3 rounded-xl bg-primary/10 flex items-center justify-between">
        <span className="text-[11px] uppercase text-muted-foreground">Change due</span>
        <span className="text-[20px] font-semibold tabular-nums">${change.toFixed(2)}</span>
      </div>
      <ActionButton
        disabled={!gateSatisfied || received < due}
        onClick={() => onAction({ amountDue: due, received, change })}
      >
        Close Check
      </ActionButton>
      <Numpad
        open={pad}
        title="Cash received"
        mode="currency"
        onCancel={() => setPad(false)}
        onSubmit={(v) => {
          setReceived(parseFloat(v) || 0);
          setPad(false);
        }}
      />
    </PicoCard>
  );
}
