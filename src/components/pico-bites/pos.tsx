/**
 * POS Pico-Bites — flat, telemetry-tag driven terminals.
 * Each component receives `{ telemetryTag, config, onAction, gateSatisfied }`
 * and emits user intent through `onAction`. No storage, no side effects.
 */
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { ActionButton, PicoCard, LongPressButton, Numpad, ManagerAuth } from "./primitives";

// ---------- Types --------------------------------------------------------
type Tile = { id: string; label: string; price?: number };
type GridConfig = { title?: string; subtitle?: string; tiles: Tile[] };
type ModifierConfig = {
  title?: string;
  subtitle?: string;
  modifiers: { id: string; label: string; delta?: number }[];
};

// ---------- 1.1 Quick-Fire Item Add --------------------------------------
export function QuickFireItemAdd({
  config,
  onAction,
  gateSatisfied = true,
  gateReason,
}: PicoBiteProps<GridConfig, Tile>) {
  const tiles = config.tiles ?? [];
  const [cart, setCart] = useState<Tile[]>([]);
  const tap = (item: Tile) => {
    if (!gateSatisfied) return toast.error(gateReason ?? "Locked");
    setCart((c) => [...c, item]);
    onAction(item);
  };
  const total = cart.reduce((s, i) => s + (i.price ?? 0), 0);
  return (
    <PicoCard title={config.title ?? "Quick-Fire Item Add"} subtitle={config.subtitle}>
      {tiles.length === 0 ? (
        <p className="text-[11px] text-muted-foreground text-center py-3">
          No tiles published from Hub yet.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {tiles.map((it) => (
            <button
              key={it.id}
              onClick={() => tap(it)}
              disabled={!gateSatisfied}
              className="min-h-[88px] rounded-2xl bg-primary/10 hover:bg-primary/15 disabled:opacity-40 flex flex-col items-center justify-center gap-1 active:scale-[0.97]"
            >
              <span className="text-[15px] font-semibold">{it.label}</span>
              {typeof it.price === "number" && (
                <span className="text-[12px] text-muted-foreground">
                  ${it.price.toFixed(2)}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between border-t pt-3">
        <span className="text-[12px] text-muted-foreground">
          Cart: {cart.length}
        </span>
        <span className="text-[18px] font-semibold tabular-nums">
          ${total.toFixed(2)}
        </span>
      </div>
      <ActionButton variant="ghost" onClick={() => setCart([])}>
        Clear Cart
      </ActionButton>
    </PicoCard>
  );
}

// ---------- 1.2 Modifier Application -------------------------------------
export function ModifierApplication({
  config,
  onAction,
  gateSatisfied = true,
}: PicoBiteProps<ModifierConfig, { id: string; label: string; delta?: number }>) {
  const [selected, setSelected] = useState<string[]>([]);
  const toggle = (m: ModifierConfig["modifiers"][number]) => {
    setSelected((s) =>
      s.includes(m.id) ? s.filter((x) => x !== m.id) : [...s, m.id],
    );
    onAction(m);
  };
  const modifiers = config.modifiers ?? [];
  return (
    <PicoCard title={config.title ?? "Modifiers"} subtitle={config.subtitle}>
      {modifiers.length === 0 ? (
        <p className="text-[11px] text-muted-foreground text-center py-3">
          No modifiers published from Hub yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {modifiers.map((m) => {
            const on = selected.includes(m.id);
            return (
              <button
                key={m.id}
                disabled={!gateSatisfied}
                onClick={() => toggle(m)}
                className={`min-h-[60px] rounded-xl px-3 text-[13px] font-semibold transition-all ${
                  on ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                }`}
              >
                <div>{m.label}</div>
                {typeof m.delta === "number" && (
                  <div className="text-[10px] opacity-70">
                    {m.delta > 0 ? "+" : ""}${m.delta.toFixed(2)}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </PicoCard>
  );
}

// ---------- 1.3 KDS Ticket Routing (fire) ---------------------------------
export function KdsTicketRouting({
  config,
  onAction,
  gateSatisfied = true,
}: PicoBiteProps<{ station?: string }, { fired: true; station?: string }>) {
  const [firedAt, setFiredAt] = useState<number | null>(null);
  const fire = () => {
    if (!gateSatisfied) return;
    setFiredAt(Date.now());
    onAction({ fired: true, station: config.station });
  };
  return (
    <PicoCard title="Fire Ticket to KDS" subtitle={config.station ?? "Kitchen"}>
      <ActionButton onClick={fire} disabled={!gateSatisfied} className="h-16 text-lg">
        Fire Ticket
      </ActionButton>
      {firedAt && (
        <p className="text-[11px] text-emerald-600">
          Sent {new Date(firedAt).toLocaleTimeString()}
        </p>
      )}
    </PicoCard>
  );
}

// ---------- 1.4 Rapid Comp/Void (long-press for void) --------------------


export function RapidCompVoid({
  onAction,
  gateSatisfied = true,
}: PicoBiteProps<Record<string, never>, { action: "comp" | "void"; amount?: number; managerAuthed: boolean }>) {
  const [pad, setPad] = useState<null | "comp" | "void">(null);
  const [needAuth, setNeedAuth] = useState<null | { action: "comp" | "void"; amount: number }>(null);

  return (
    <PicoCard title="Comp / Void" subtitle="Long-press to void">
      <div className="grid grid-cols-2 gap-3">
        <ActionButton variant="warning" onClick={() => setPad("comp")} disabled={!gateSatisfied}>
          Comp
        </ActionButton>
        <LongPressButton
          onLongPress={() => setPad("void")}
          className="bg-destructive text-destructive-foreground min-h-[56px] text-[15px] font-semibold flex items-center justify-center"
        >
          Hold to Void
        </LongPressButton>
      </div>
      <Numpad
        open={!!pad}
        title={pad === "comp" ? "Comp amount" : "Void amount"}
        mode="currency"
        onCancel={() => setPad(null)}
        onSubmit={(v) => {
          const amt = parseFloat(v) || 0;
          if (pad) setNeedAuth({ action: pad, amount: amt });
          setPad(null);
        }}
      />
      <ManagerAuth
        open={!!needAuth}
        title={`Approve ${needAuth?.action ?? ""}`}
        onCancel={() => setNeedAuth(null)}
        onAuthed={() => {
          if (needAuth) onAction({ ...needAuth, managerAuthed: true });
          setNeedAuth(null);
        }}
      />
    </PicoCard>
  );
}

// ---------- 1.5 Hold / Send / Stay ---------------------------------------
export function HoldSendStay({
  onAction,
  gateSatisfied = true,
}: PicoBiteProps<{ ticketId?: string | number }, { action: "hold" | "send" | "stay"; ticketId?: string | number }>) {
  const [last, setLast] = useState<"hold" | "send" | "stay" | null>(null);
  const emit = (action: "hold" | "send" | "stay", ticketId?: string | number) => {
    setLast(action);
    onAction({ action, ticketId });
  };
  return (
    <PicoCard title="Hold / Send / Stay" subtitle="Kitchen pacing">
      <div className="grid grid-cols-3 gap-2">
        <ActionButton variant="warning" disabled={!gateSatisfied} onClick={() => emit("hold")}>
          Hold
        </ActionButton>
        <ActionButton disabled={!gateSatisfied} onClick={() => emit("send")}>
          Send
        </ActionButton>
        <ActionButton variant="ghost" disabled={!gateSatisfied} onClick={() => emit("stay")}>
          Stay
        </ActionButton>
      </div>
      {last && (
        <p className="text-[11px] text-muted-foreground">
          Last: <span className="font-semibold uppercase">{last}</span>
        </p>
      )}
    </PicoCard>
  );
}

// ---------- 1.6 Course Assignment ----------------------------------------
type Course = { id: string; label: string };
export function CourseAssignment({
  config,
  onAction,
  gateSatisfied = true,
}: PicoBiteProps<{ items?: { id: string; label: string }[]; courses?: Course[] }, { itemId: string; course: string }>) {
  const items = config.items ?? [];
  const courses: Course[] = config.courses ?? [];
  const [selected, setSelected] = useState<string | null>(null);
  const assign = (course: string) => {
    if (!selected) return toast.error("Pick an item first");
    onAction({ itemId: selected, course });
    toast.success(`${selected} → ${course}`);
  };
  return (
    <PicoCard title="Course Assignment" subtitle="Pace multi-course tickets">
      <div className="grid grid-cols-2 gap-2">
        {items.map((it) => (
          <button
            key={it.id}
            disabled={!gateSatisfied}
            onClick={() => setSelected(it.id)}
            className={`min-h-[44px] rounded-xl text-[13px] font-semibold ${
              selected === it.id ? "bg-primary text-primary-foreground" : "bg-secondary"
            }`}
          >
            {it.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 border-t pt-2">
        {courses.map((c) => (
          <ActionButton
            key={c.id}
            variant="ghost"
            disabled={!gateSatisfied || !selected}
            onClick={() => assign(c.id)}
          >
            {c.label}
          </ActionButton>
        ))}
      </div>
    </PicoCard>
  );
}

// ---------- 1.7 Order Pacing Timer ---------------------------------------
export function OrderPacingTimer({
  config,
  onAction,
}: PicoBiteProps<{ tickets?: { id: string; startedAt: number }[]; thresholdSec?: number }, { ticketId: string; bumped: true }>) {
  const threshold = config.thresholdSec ?? 300;
  const tickets = config.tickets ?? [];
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);
  return (
    <PicoCard title="Order Pacing" subtitle="Long-press to bump">
      <div className="flex flex-col gap-2">
        {tickets.map((t) => {
          const age = Math.floor((now - t.startedAt) / 1000);
          const late = age > threshold;
          return (
            <LongPressButton
              key={t.id}
              onLongPress={() => onAction({ ticketId: t.id, bumped: true })}
              className={`min-h-[44px] rounded-xl px-3 flex items-center justify-between ${
                late ? "bg-destructive text-destructive-foreground" : "bg-secondary"
              }`}
            >
              <span className="font-semibold">{t.id}</span>
              <span className="tabular-nums text-[12px]">
                {Math.floor(age / 60)}:{String(age % 60).padStart(2, "0")}
              </span>
            </LongPressButton>
          );
        })}
      </div>
    </PicoCard>
  );
}

// ---------- 1.8 Order Type Change ----------------------------------------
const ORDER_TYPES = ["dine_in", "takeout", "delivery", "curbside"] as const;
type OrderType = (typeof ORDER_TYPES)[number];
const ORDER_TYPE_LABELS: Record<OrderType, string> = {
  dine_in: "Dine-In",
  takeout: "Takeout",
  delivery: "Delivery",
  curbside: "Curbside",
};
export function OrderTypeChange({
  config,
  onAction,
  gateSatisfied = true,
}: PicoBiteProps<{ current?: OrderType }, { orderType: OrderType }>) {
  const [active, setActive] = useState<OrderType>(config.current ?? "dine_in");
  return (
    <PicoCard title="Order Type" subtitle="Switch service mode">
      <div className="grid grid-cols-2 gap-2">
        {ORDER_TYPES.map((t) => (
          <ActionButton
            key={t}
            variant={active === t ? "primary" : "ghost"}
            disabled={!gateSatisfied}
            onClick={() => {
              setActive(t);
              onAction({ orderType: t });
            }}
          >
            {ORDER_TYPE_LABELS[t]}
          </ActionButton>
        ))}
      </div>
    </PicoCard>
  );
}

// ---------- 1.9 Reopen Check ---------------------------------------------
export function ReopenCheck({
  config,
  onAction,
}: PicoBiteProps<{ recentClosed?: { id: string; total: number }[] }, { ticketId: string; managerAuthed: true }>) {
  const recent = config.recentClosed ?? [];
  const [pending, setPending] = useState<string | null>(null);
  return (
    <PicoCard title="Reopen Check" subtitle="Manager approval required">
      <div className="flex flex-col gap-1">
        {recent.map((c) => (
          <button
            key={c.id}
            onClick={() => setPending(c.id)}
            className="flex items-center justify-between p-2 rounded-lg bg-secondary text-[13px]"
          >
            <span className="font-semibold">{c.id}</span>
            <span className="tabular-nums text-muted-foreground">${c.total.toFixed(2)}</span>
          </button>
        ))}
      </div>
      <ManagerAuth
        open={pending !== null}
        title="Approve reopen"
        onCancel={() => setPending(null)}
        onAuthed={() => {
          if (pending) {
            onAction({ ticketId: pending, managerAuthed: true });
            toast.success(`Reopened ${pending}`);
          }
          setPending(null);
        }}
      />
    </PicoCard>
  );
}

// ---------- 1.10 Reprint Chit --------------------------------------------
export function ReprintChit({
  config,
  onAction,
  gateSatisfied = true,
}: PicoBiteProps<{ stations?: string[]; lastTicketId?: string }, { ticketId: string; station: string }>) {
  const stations = config.stations ?? [];
  const ticketId = config.lastTicketId ?? "last";
  return (
    <PicoCard title="Reprint Chit" subtitle="Re-fire to kitchen station">
      <div className="grid grid-cols-2 gap-2">
        {stations.map((s) => (
          <ActionButton
            key={s}
            variant="ghost"
            disabled={!gateSatisfied}
            onClick={() => {
              onAction({ ticketId, station: s });
              toast.success(`Chit reprinted → ${s}`);
            }}
          >
            {s}
          </ActionButton>
        ))}
      </div>
    </PicoCard>
  );
}

