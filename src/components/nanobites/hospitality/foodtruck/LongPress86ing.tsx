/**
 * Pico-Bite 2.1 · hosp.ft.inv.status_86
 * Long-Press 86ing — hold a grid tile to flip an item out of stock.
 */
import { useState } from "react";
import { toast } from "sonner";
import { recordExecution } from "@/lib/idia/executions";
import {
  ActionButton,
  LongPressButton,
  PicoCard,
  SUBMODULE_ID,
  useCartonCode,
} from "@/components/foodtruck-inputs/shared";

const NANO_BITE_ID = "hosp.ft.inv.status_86";
const SCREEN = "Dynamic Inventory";

const ITEMS = [
  { id: "sku.taco", label: "Taco" },
  { id: "sku.burrito", label: "Burrito" },
  { id: "sku.quesadilla", label: "Quesadilla" },
  { id: "sku.nachos", label: "Nachos" },
  { id: "sku.horchata", label: "Horchata" },
  { id: "sku.jarritos", label: "Jarritos" },
];

export default function LongPress86ing() {
  const cartonCode = useCartonCode();
  const [pending, setPending] = useState<(typeof ITEMS)[number] | null>(null);
  const [status, setStatus] = useState<Record<string, boolean>>({});

  const confirm = () => {
    if (!pending) return;
    const nextInStock = !(status[pending.id] ?? true);
    setStatus((s) => ({ ...s, [pending.id]: nextInStock }));
    recordExecution({
      cartonCode,
      subModuleId: SUBMODULE_ID,
      nanoBiteId: NANO_BITE_ID,
      screen: SCREEN,
      action: NANO_BITE_ID,
      payload: { sku: pending.id, inStock: nextInStock, source: "long_press" },
    });
    console.log(
      `[HARDWARE_STUB]: 3rd-party API suspend sku=${pending.id} inStock=${nextInStock}`,
    );
    toast.success(
      `${pending.label} → ${nextInStock ? "In stock" : "86'd"}`,
    );
    setPending(null);
  };

  return (
    <PicoCard title="Long-Press 86ing" subtitle="Hold a tile 600ms to toggle stock">
      <div className="grid grid-cols-3 gap-3">
        {ITEMS.map((it) => {
          const inStock = status[it.id] ?? true;
          return (
            <LongPressButton
              key={it.id}
              onLongPress={() => setPending(it)}
              className={`min-h-[92px] flex flex-col items-center justify-center gap-1 ${
                inStock ? "bg-primary/10" : "bg-destructive/15 line-through"
              }`}
            >
              <span className="text-[14px] font-semibold">{it.label}</span>
              <span className="text-[11px] text-muted-foreground">
                {inStock ? "In stock" : "86'd"}
              </span>
            </LongPressButton>
          );
        })}
      </div>

      {pending && (
        <div className="fixed inset-0 z-[80] bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl">
            <p className="text-[13px] font-semibold">
              Toggle {pending.label} to{" "}
              {status[pending.id] === false ? "In Stock" : "86'd"}?
            </p>
            <p className="text-[12px] text-muted-foreground mt-1">
              This will suspend the item at the POS grid and delivery integrations.
            </p>
            <div className="mt-4 flex gap-2">
              <ActionButton
                variant="ghost"
                className="flex-1"
                onClick={() => setPending(null)}
              >
                Cancel
              </ActionButton>
              <ActionButton className="flex-1" onClick={confirm}>
                Confirm
              </ActionButton>
            </div>
          </div>
        </div>
      )}
    </PicoCard>
  );
}
