/**
 * Pico-Bite 2.3 · hosp.ft.inv.log_waste
 * Log Waste/Spoilage — search + numpad + reason dropdown.
 */
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { recordExecution } from "@/lib/idia/executions";
import {
  ActionButton,
  Numpad,
  PicoCard,
  SUBMODULE_ID,
  useCartonCode,
} from "@/components/foodtruck-inputs/shared";

const NANO_BITE_ID = "hosp.ft.inv.log_waste";
const SCREEN = "Dynamic Inventory";
const REASONS = ["Spoiled", "Dropped", "Overcooked", "Expired", "Prep error"];

const CATALOG = [
  "Carne Asada",
  "Al Pastor",
  "Chicken",
  "Cilantro",
  "Onion",
  "Cheese",
  "Tortillas",
  "Salsa Verde",
];

const schema = z.object({
  item: z.string().trim().min(1).max(80),
  qty: z.number().positive().max(9999),
  reason: z.enum(["Spoiled", "Dropped", "Overcooked", "Expired", "Prep error"]),
});

export default function LogWasteSpoilage() {
  const cartonCode = useCartonCode();
  const [query, setQuery] = useState("");
  const [item, setItem] = useState<string | null>(null);
  const [qty, setQty] = useState<number | null>(null);
  const [reason, setReason] = useState(REASONS[0]);
  const [padOpen, setPadOpen] = useState(false);

  const filtered = CATALOG.filter((c) =>
    c.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const submit = () => {
    const parsed = schema.safeParse({ item, qty, reason });
    if (!parsed.success) {
      toast.error("Enter an item, quantity, and reason.");
      return;
    }
    recordExecution({
      cartonCode,
      subModuleId: SUBMODULE_ID,
      nanoBiteId: NANO_BITE_ID,
      screen: SCREEN,
      action: NANO_BITE_ID,
      payload: parsed.data,
    });
    toast.success(`Logged ${parsed.data.qty} × ${parsed.data.item}`);
    setItem(null);
    setQty(null);
    setQuery("");
  };

  return (
    <PicoCard title="Log Waste / Spoilage" subtitle="Record any inventory pulled from service">
      <input
        className="h-11 rounded-xl border px-3 text-[14px] bg-white"
        placeholder="Search item"
        value={item ?? query}
        onChange={(e) => {
          setItem(null);
          setQuery(e.target.value);
        }}
      />
      {!item && query && (
        <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
          {filtered.map((c) => (
            <button
              key={c}
              onClick={() => {
                setItem(c);
                setQuery("");
              }}
              className="h-10 px-3 rounded-lg bg-secondary text-left text-[13px]"
            >
              {c}
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-[12px] text-muted-foreground">No matches.</p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-[13px] text-muted-foreground">Quantity</span>
        <button
          onClick={() => setPadOpen(true)}
          className="h-11 px-4 rounded-xl bg-secondary text-[16px] font-semibold tabular-nums"
        >
          {qty ?? "—"}
        </button>
      </div>

      <select
        className="h-11 rounded-xl border px-3 text-[14px] bg-white"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      >
        {REASONS.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>

      <ActionButton onClick={submit}>Log Waste</ActionButton>

      <Numpad
        open={padOpen}
        title="Quantity"
        mode="number"
        onCancel={() => setPadOpen(false)}
        onSubmit={(v) => {
          setQty(Number(v));
          setPadOpen(false);
        }}
      />
    </PicoCard>
  );
}
