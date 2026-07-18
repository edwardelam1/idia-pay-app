/**
 * Inventory Pico-Bites — read the operator-managed catalog from
 * public.daily_prep_list. No hardcoded ingredients or SKUs. Each surface
 * embeds the inline Prep Item Manager so operators can add/remove items
 * without leaving the Nano-Bite.
 */
import { useMemo, useState } from "react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import {
  ActionButton,
  LongPressButton,
  ManagerAuth,
  Numpad,
  PicoCard,
  QuantityStepper,
} from "./primitives";
import { PrepItemManager } from "./prep-manager";
import { usePrepItems } from "@/lib/idia/prep-items";
import { useActiveBusinessId } from "@/lib/idia/ActiveBusinessContext";

type Item = { id: string; label: string; onHand?: number; par?: number };

function useCatalog(): Item[] {
  const businessId = useActiveBusinessId();
  const { items } = usePrepItems(businessId);
  return useMemo(
    () =>
      items.map((r) => ({
        id: r.id,
        label: r.item_name,
        onHand: Number(r.on_hand),
        par: Number(r.par_level),
      })),
    [items],
  );
}

function EmptyCatalog({ label }: { label: string }) {
  return (
    <p className="text-[11px] text-muted-foreground text-center py-2">
      {label}
    </p>
  );
}

// ---------- 2.1 Long-press 86 --------------------------------------------
export function LongPress86ing({
  onAction,
  gateSatisfied = true,
}: PicoBiteProps<Record<string, never>, { itemId: string; label: string; eightySixed: true }>) {
  const items = useCatalog();
  const [downed, setDowned] = useState<string[]>([]);
  return (
    <PicoCard title="86 Items" subtitle="Long-press to 86">
      {items.length === 0 ? (
        <EmptyCatalog label="No items published — add one below." />
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {items.map((it) => {
            const off = downed.includes(it.id);
            return (
              <LongPressButton
                key={it.id}
                onLongPress={() => {
                  if (!gateSatisfied) return;
                  setDowned((d) => (d.includes(it.id) ? d : [...d, it.id]));
                  onAction({ itemId: it.id, label: it.label, eightySixed: true });
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
      )}
      <PrepItemManager compact title="Menu Catalog" />
    </PicoCard>
  );
}

// ---------- 2.2 Recipe Depletion -----------------------------------------
export function RecipeDepletion({}: PicoBiteProps<Record<string, never>>) {
  return (
    <PicoCard title="Recipe Auto-Deplete" subtitle="Live">
      <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-[12px] text-emerald-800">
        Depletion runs automatically as POS items fire. No manual input required.
      </div>
      <PrepItemManager compact title="Ingredient Catalog" />
    </PicoCard>
  );
}

// ---------- 2.3 Log Waste / Spoilage -------------------------------------
const WASTE_REASONS = ["Spoilage", "Dropped", "Overcook", "Expired"] as const;
export function LogWasteSpoilage({
  onAction,
  gateSatisfied = true,
}: PicoBiteProps<Record<string, never>, { itemId: string; label: string; quantity: number; reason: string }>) {
  const items = useCatalog();
  const [pick, setPick] = useState<Item | null>(null);
  const [qty, setQty] = useState(1);
  const [reason, setReason] = useState<string>(WASTE_REASONS[0]);
  return (
    <PicoCard title="Log Waste">
      {items.length === 0 ? (
        <EmptyCatalog label="No items yet — add one below to log waste." />
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {items.map((it) => (
            <ActionButton
              key={it.id}
              variant={pick?.id === it.id ? "primary" : "ghost"}
              onClick={() => setPick(it)}
            >
              {it.label}
            </ActionButton>
          ))}
        </div>
      )}
      {pick && (
        <>
          <div className="flex items-center justify-between">
            <QuantityStepper value={qty} onChange={setQty} min={1} />
            <select
              className="h-10 rounded-xl bg-secondary px-3 text-[13px]"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              {WASTE_REASONS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
          <ActionButton
            disabled={!gateSatisfied}
            onClick={() => {
              onAction({ itemId: pick.id, label: pick.label, quantity: qty, reason });
              setPick(null);
              setQty(1);
            }}
          >
            Log Waste
          </ActionButton>
        </>
      )}
      <PrepItemManager compact />
    </PicoCard>
  );
}

// ---------- 2.4 Restock Receive ------------------------------------------
export function RestockReceive({
  onAction,
  gateSatisfied = true,
}: PicoBiteProps<Record<string, never>, { itemId: string; label: string; received: number; overrideAuthed?: boolean }>) {
  const items = useCatalog();
  const [pick, setPick] = useState<Item | null>(null);
  const [pad, setPad] = useState(false);
  const [pendingQty, setPendingQty] = useState<number | null>(null);
  const [auth, setAuth] = useState(false);
  return (
    <PicoCard title="Receive Restock">
      {items.length === 0 ? (
        <EmptyCatalog label="No items yet — add one below to receive stock." />
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {items.map((it) => (
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
      )}
      <Numpad
        open={pad}
        title={`Quantity received · ${pick?.label ?? ""}`}
        onCancel={() => setPad(false)}
        onSubmit={(v) => {
          const n = parseInt(v || "0", 10);
          setPad(false);
          setPendingQty(n);
          const expected = pick?.par ?? 0;
          if (expected > 0 && n > expected * 1.5) setAuth(true);
          else if (pick) {
            onAction({ itemId: pick.id, label: pick.label, received: n });
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
              label: pick.label,
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
      <PrepItemManager compact />
    </PicoCard>
  );
}

// ---------- Physical Cycle Count -----------------------------------------
export function PhysicalCount({
  onAction,
  gateSatisfied = true,
}: PicoBiteProps<Record<string, never>, { itemId: string; label: string; counted: number; par?: number; variance: number }>) {
  const items = useCatalog();
  const [pad, setPad] = useState<Item | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  return (
    <PicoCard title="Cycle Count" subtitle="Physical inventory">
      {items.length === 0 ? (
        <EmptyCatalog label="No items yet — add one below to count." />
      ) : (
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
      )}
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
          onAction({ itemId: pad.id, label: pad.label, counted: n, par: pad.par, variance });
          setPad(null);
        }}
      />
      <PrepItemManager compact />
    </PicoCard>
  );
}

// ---------- Timed 86 -----------------------------------------------------
const TIMED_86_PRESETS = [30, 60, 120, 240] as const;
export function Timed86({
  onAction,
  gateSatisfied = true,
}: PicoBiteProps<Record<string, never>, { itemId: string; label: string; until: string; minutes: number }>) {
  const items = useCatalog();
  const [selected, setSelected] = useState<Item | null>(null);
  const trigger = (min: number) => {
    if (!selected) return;
    const until = new Date(Date.now() + min * 60_000).toISOString();
    onAction({ itemId: selected.id, label: selected.label, until, minutes: min });
    setSelected(null);
  };
  return (
    <PicoCard title="Timed 86" subtitle="86 with auto-return">
      {items.length === 0 ? (
        <EmptyCatalog label="No items yet — add one below." />
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {items.map((it) => (
            <button
              key={it.id}
              disabled={!gateSatisfied}
              onClick={() => setSelected(it)}
              className={`min-h-[44px] rounded-xl text-[13px] font-semibold ${
                selected?.id === it.id ? "bg-primary text-primary-foreground" : "bg-secondary"
              }`}
            >
              {it.label}
            </button>
          ))}
        </div>
      )}
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
      <PrepItemManager compact />
    </PicoCard>
  );
}
