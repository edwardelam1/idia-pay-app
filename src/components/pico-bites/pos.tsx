/**
 * POS Pico-Bites — flat, telemetry-tag driven terminals.
 * Each component receives `{ telemetryTag, config, onAction, gateSatisfied }`
 * and emits user intent through `onAction`. No storage, no side effects.
 */
import { useState } from "react";
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
  const [cart, setCart] = useState<Tile[]>([]);
  const tap = (item: Tile) => {
    if (!gateSatisfied) return toast.error(gateReason ?? "Locked");
    setCart((c) => [...c, item]);
    onAction(item);
  };
  const total = cart.reduce((s, i) => s + (i.price ?? 0), 0);
  return (
    <PicoCard title={config.title ?? "Quick-Fire Item Add"} subtitle={config.subtitle}>
      <div className="grid grid-cols-3 gap-3">
        {config.tiles.map((it) => (
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
  return (
    <PicoCard title={config.title ?? "Modifiers"} subtitle={config.subtitle}>
      <div className="grid grid-cols-2 gap-2">
        {config.modifiers.map((m) => {
          const on = selected.includes(m.id);
          return (
            <button
              key={m.id}
              disabled={!gateSatisfied}
              onClick={() => toggle(m)}
              className={`min-h-[60px] rounded-xl px-3 text-[13px] font-semibold transition-all ${
                on
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground"
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
import { LongPressButton, Numpad, ManagerAuth } from "./primitives";

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
