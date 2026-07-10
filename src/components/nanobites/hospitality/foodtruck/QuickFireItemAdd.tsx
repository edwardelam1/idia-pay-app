/**
 * Pico-Bite 1.1 · hosp.ft.pos.item_add
 * Quick-Fire Item Add — dynamic grid button emits an item add to the cart.
 */
import { useState } from "react";
import { toast } from "sonner";
import { recordExecution } from "@/lib/idia/executions";
import {
  ActionButton,
  PicoCard,
  SUBMODULE_ID,
  useCartonCode,
  useShiftLock,
} from "@/components/foodtruck-inputs/shared";

const NANO_BITE_ID = "hosp.ft.pos.item_add";
const SCREEN = "POS & Order Routing";

const GRID = [
  { id: "sku.taco", label: "Taco", price: 4.5 },
  { id: "sku.burrito", label: "Burrito", price: 9.0 },
  { id: "sku.quesadilla", label: "Quesadilla", price: 7.25 },
  { id: "sku.nachos", label: "Nachos", price: 6.5 },
  { id: "sku.horchata", label: "Horchata", price: 3.0 },
  { id: "sku.jarritos", label: "Jarritos", price: 3.5 },
];

export default function QuickFireItemAdd() {
  const cartonCode = useCartonCode();
  const { ready, location, clockedIn, drifted, driftMeters } = useShiftLock();
  const [cart, setCart] = useState<{ id: string; label: string; price: number }[]>([]);

  const tap = (item: (typeof GRID)[number]) => {
    if (!ready) {
      toast.error(
        drifted
          ? "Location drift detected — re-lock GPS before taking orders."
          : "Lock Location + Clock In required to take orders.",
      );
      return;
    }
    setCart((c) => [...c, item]);
    recordExecution({
      cartonCode,
      subModuleId: SUBMODULE_ID,
      nanoBiteId: NANO_BITE_ID,
      screen: SCREEN,
      action: NANO_BITE_ID,
      payload: { sku: item.id, label: item.label, price: item.price },
    });
  };

  const total = cart.reduce((s, i) => s + i.price, 0);

  return (
    <PicoCard title="Quick-Fire Item Add" subtitle="Tap a tile to add to cart">
      {!ready && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[12px] text-amber-800">
          Locked · {location ? "location set" : "no location"} ·{" "}
          {clockedIn ? "clocked in" : "not clocked in"}. Complete Fleet check-in
          + Time Punch first.
        </div>
      )}
      <div className="grid grid-cols-3 gap-3">
        {GRID.map((it) => (
          <button
            key={it.id}
            onClick={() => tap(it)}
            disabled={!ready}
            className="min-h-[92px] rounded-2xl bg-primary/10 hover:bg-primary/15 disabled:opacity-40 flex flex-col items-center justify-center gap-1 active:scale-[0.97] transition-all"
          >
            <span className="text-[15px] font-semibold">{it.label}</span>
            <span className="text-[12px] text-muted-foreground">
              ${it.price.toFixed(2)}
            </span>
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between border-t pt-3">
        <span className="text-[12px] text-muted-foreground">
          Cart: {cart.length} item{cart.length === 1 ? "" : "s"}
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
