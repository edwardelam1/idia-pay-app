/**
 * Inventory Pico-Bites.
 */
import { useState } from "react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import {
  ActionButton,
  LongPressButton,
  ManagerAuth,
  Numpad,
  PicoCard,
  QuantityStepper,
} from "./primitives";

type Item = { id: string; label: string; onHand?: number; par?: number };
type ItemsConfig = { title?: string; subtitle?: string; items: Item[] };

// ---------- 2.1 Long-press 86 --------------------------------------------
export function LongPress86ing({
  config,
  onAction,
  gateSatisfied = true,
}: PicoBiteProps<ItemsConfig, { itemId: string; eightySixed: true }>) {
  const [downed, setDowned] = useState<string[]>([]);
  return (
    <PicoCard title={config.title ?? "86 Items"} subtitle="Long-press to 86">
      <div className="grid grid-cols-2 gap-2">
        {config.items.map((it) => {
          const off = downed.includes(it.id);
          return (
            <LongPressButton
              key={it.id}
              onLongPress={() => {
                if (!gateSatisfied) return;
                setDowned((d) => (d.includes(it.id) ? d : [...d, it.id]));
                onAction({ itemId: it.id, eightySixed: true });
              }}
              className={`min-h-[60px] text-[13px] font-semibold flex items-center justify-center ${
                off ? "bg-destructive text-destructive-foreground" : "bg-secondary"
              }`}
            >
              {off ? `86'd · ${it.label}` : it.label}
            </LongPressButton>
          );
        })}
      </div>
    </PicoCard>
  );
}

// ---------- 2.2 Recipe Depletion (auto — reactive listener) --------------
export function RecipeDepletion({
  config,
}: PicoBiteProps<{ subtitle?: string }>) {
  return (
    <PicoCard title="Recipe Auto-Deplete" subtitle={config.subtitle ?? "Live"}>
      <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-[12px] text-emerald-800">
        Depletion runs automatically as POS items fire. No manual input required.
      </div>
    </PicoCard>
  );
}

// ---------- 2.3 Log Waste / Spoilage -------------------------------------
export function LogWasteSpoilage({
  config,
  onAction,
  gateSatisfied = true,
}: PicoBiteProps<ItemsConfig, { itemId: string; quantity: number; reason: string }>) {
  const [pick, setPick] = useState<Item | null>(null);
  const [qty, setQty] = useState(1);
  const [reason, setReason] = useState("Spoilage");
  return (
    <PicoCard title="Log Waste" subtitle={config.subtitle}>
      <div className="grid grid-cols-2 gap-2">
        {config.items.map((it) => (
          <ActionButton
            key={it.id}
            variant={pick?.id === it.id ? "primary" : "ghost"}
            onClick={() => setPick(it)}
          >
            {it.label}
          </ActionButton>
        ))}
      </div>
      {pick && (
        <>
          <div className="flex items-center justify-between">
            <QuantityStepper value={qty} onChange={setQty} min={1} />
            <select
              className="h-10 rounded-xl bg-secondary px-3 text-[13px]"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              {["Spoilage", "Dropped", "Overcook", "Expired"].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
          <ActionButton
            disabled={!gateSatisfied}
            onClick={() => {
              onAction({ itemId: pick.id, quantity: qty, reason });
              setPick(null);
              setQty(1);
            }}
          >
            Log Waste
          </ActionButton>
        </>
      )}
    </PicoCard>
  );
}

// ---------- 2.4 Restock Receive (manager auth for override) --------------
export function RestockReceive({
  config,
  onAction,
  gateSatisfied = true,
}: PicoBiteProps<ItemsConfig, { itemId: string; received: number; overrideAuthed?: boolean }>) {
  const [pick, setPick] = useState<Item | null>(null);
  const [pad, setPad] = useState(false);
  const [pendingQty, setPendingQty] = useState<number | null>(null);
  const [auth, setAuth] = useState(false);
  return (
    <PicoCard title="Receive Restock" subtitle={config.subtitle}>
      <div className="grid grid-cols-2 gap-2">
        {config.items.map((it) => (
          <ActionButton
            key={it.id}
            variant={pick?.id === it.id ? "primary" : "ghost"}
            onClick={() => {
              setPick(it);
              setPad(true);
            }}
          >
            {it.label}
          </ActionButton>
        ))}
      </div>
      <Numpad
        open={pad}
        title={`Quantity received · ${pick?.label ?? ""}`}
        onCancel={() => setPad(false)}
        onSubmit={(v) => {
          const n = parseInt(v || "0", 10);
          setPad(false);
          setPendingQty(n);
          const expected = pick?.par ?? 0;
          if (n > expected * 1.5) setAuth(true);
          else if (pick) {
            onAction({ itemId: pick.id, received: n });
            setPick(null);
          }
        }}
      />
      <ManagerAuth
        open={auth}
        title="Approve over-receive"
        onCancel={() => {
          setAuth(false);
          setPendingQty(null);
        }}
        onAuthed={() => {
          if (pick && pendingQty != null)
            onAction({
              itemId: pick.id,
              received: pendingQty,
              overrideAuthed: true,
            });
          setAuth(false);
          setPick(null);
          setPendingQty(null);
        }}
      />
      {!gateSatisfied && (
        <p className="text-[11px] text-muted-foreground">
          Locked · complete Fleet check-in first.
        </p>
      )}
    </PicoCard>
  );
}
