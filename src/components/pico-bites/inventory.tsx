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

// ---------- Physical Cycle Count -----------------------------------------
export function PhysicalCount({
  config,
  onAction,
  gateSatisfied = true,
}: PicoBiteProps<{ items?: Item[] }, { itemId: string; counted: number; par?: number; variance: number }>) {
  const items = config.items ?? [
    { id: "ing.protein", label: "Protein", par: 20 },
    { id: "ing.tortilla", label: "Tortilla", par: 100 },
    { id: "ing.cheese", label: "Cheese", par: 15 },
  ];
  const [pad, setPad] = useState<Item | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  return (
    <PicoCard title="Cycle Count" subtitle="Physical inventory">
      <div className="flex flex-col gap-1">
        {items.map((it) => {
          const c = counts[it.id];
          const variance = c != null && it.par != null ? c - it.par : null;
          return (
            <button
              key={it.id}
              disabled={!gateSatisfied}
              onClick={() => setPad(it)}
              className="flex items-center justify-between p-2 rounded-lg bg-secondary text-[13px]"
            >
              <span className="font-semibold">{it.label}</span>
              <span className="tabular-nums text-[12px]">
                {c != null ? `${c} / ${it.par ?? "—"}` : `par ${it.par ?? "—"}`}
                {variance != null && (
                  <span
                    className={`ml-2 ${variance < 0 ? "text-destructive" : "text-emerald-600"}`}
                  >
                    {variance >= 0 ? "+" : ""}
                    {variance}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
      <Numpad
        open={pad !== null}
        title={pad ? `Count · ${pad.label}` : ""}
        mode="pin"
        maxLength={5}
        onCancel={() => setPad(null)}
        onSubmit={(v) => {
          if (!pad) return;
          const n = parseInt(v, 10) || 0;
          setCounts((c) => ({ ...c, [pad.id]: n }));
          const variance = (pad.par ?? 0) ? n - (pad.par ?? 0) : 0;
          onAction({ itemId: pad.id, counted: n, par: pad.par, variance });
          setPad(null);
        }}
      />
    </PicoCard>
  );
}

// ---------- Timed 86 -----------------------------------------------------
const TIMED_86_PRESETS = [30, 60, 120, 240] as const;
export function Timed86({
  config,
  onAction,
  gateSatisfied = true,
}: PicoBiteProps<{ items?: { id: string; label: string }[] }, { itemId: string; until: string; minutes: number }>) {
  const items = config.items ?? [
    { id: "sku.taco", label: "Taco" },
    { id: "sku.burrito", label: "Burrito" },
    { id: "sku.nachos", label: "Nachos" },
  ];
  const [selected, setSelected] = useState<string | null>(null);
  const trigger = (min: number) => {
    if (!selected) return;
    const until = new Date(Date.now() + min * 60_000).toISOString();
    onAction({ itemId: selected, until, minutes: min });
    setSelected(null);
  };
  return (
    <PicoCard title="Timed 86" subtitle="86 with auto-return">
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
      <div className="grid grid-cols-4 gap-2 border-t pt-2">
        {TIMED_86_PRESETS.map((m) => (
          <ActionButton
            key={m}
            variant="ghost"
            disabled={!gateSatisfied || !selected}
            onClick={() => trigger(m)}
          >
            {m < 60 ? `${m}m` : `${m / 60}h`}
          </ActionButton>
        ))}
      </div>
    </PicoCard>
  );
}

