/**
 * Pico-Bite 2.4 · hosp.ft.inv.receive_stock
 * Restock Receive — search + qty numpad + cost basis numpad + confirm.
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

const NANO_BITE_ID = "hosp.ft.inv.receive_stock";
const SCREEN = "Dynamic Inventory";

const CATALOG = ["Carne Asada", "Al Pastor", "Tortillas", "Cheese", "Horchata mix"];

const schema = z.object({
  item: z.string().trim().min(1),
  qty: z.number().positive(),
  cost: z.number().nonnegative(),
});

export default function RestockReceive() {
  const cartonCode = useCartonCode();
  const [query, setQuery] = useState("");
  const [item, setItem] = useState<string | null>(null);
  const [qty, setQty] = useState<number | null>(null);
  const [cost, setCost] = useState<number | null>(null);
  const [qtyPad, setQtyPad] = useState(false);
  const [costPad, setCostPad] = useState(false);

  const filtered = CATALOG.filter((c) =>
    c.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const submit = () => {
    const parsed = schema.safeParse({ item, qty, cost });
    if (!parsed.success) {
      toast.error("Enter item, quantity, and cost.");
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
    toast.success(`Received ${parsed.data.qty} × ${parsed.data.item}`);
    setItem(null);
    setQty(null);
    setCost(null);
  };

  return (
    <PicoCard title="Restock Receive" subtitle="Log commissary or supplier delivery">
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
        <div className="flex flex-col gap-1">
          {filtered.map((c) => (
            <button
              key={c}
              onClick={() => setItem(c)}
              className="h-10 px-3 rounded-lg bg-secondary text-left text-[13px]"
            >
              {c}
            </button>
          ))}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setQtyPad(true)}
          className="h-16 rounded-2xl bg-secondary text-left px-4"
        >
          <p className="text-[11px] text-muted-foreground">Quantity</p>
          <p className="text-[18px] font-semibold tabular-nums">{qty ?? "—"}</p>
        </button>
        <button
          onClick={() => setCostPad(true)}
          className="h-16 rounded-2xl bg-secondary text-left px-4"
        >
          <p className="text-[11px] text-muted-foreground">Cost Basis</p>
          <p className="text-[18px] font-semibold tabular-nums">
            {cost != null ? `$${cost.toFixed(2)}` : "—"}
          </p>
        </button>
      </div>
      <ActionButton onClick={submit}>Log Restock</ActionButton>

      <Numpad
        open={qtyPad}
        title="Quantity"
        mode="number"
        onCancel={() => setQtyPad(false)}
        onSubmit={(v) => {
          setQty(Number(v));
          setQtyPad(false);
        }}
      />
      <Numpad
        open={costPad}
        title="Cost Basis"
        mode="currency"
        onCancel={() => setCostPad(false)}
        onSubmit={(v) => {
          setCost(Number(v));
          setCostPad(false);
        }}
      />
    </PicoCard>
  );
}
