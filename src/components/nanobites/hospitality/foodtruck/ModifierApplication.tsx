/**
 * Pico-Bite 1.2 · hosp.ft.pos.mod_apply
 * Modifier Application — modal with checkbox multi-select, radio single-select,
 * and quantity stepper.
 */
import { useState } from "react";
import { recordExecution } from "@/lib/idia/executions";
import {
  ActionButton,
  PicoCard,
  QuantityStepper,
  SUBMODULE_ID,
  useCartonCode,
} from "@/components/foodtruck-inputs/shared";

const NANO_BITE_ID = "hosp.ft.pos.mod_apply";
const SCREEN = "POS & Order Routing";

const TOPPINGS = ["Cheese", "Guac (+$1)", "Salsa Verde", "Pickled Onion", "Cilantro"];
const PROTEINS = ["Carne Asada", "Al Pastor", "Chicken", "Veggie"];

export default function ModifierApplication() {
  const cartonCode = useCartonCode();
  const [open, setOpen] = useState(false);
  const [toppings, setToppings] = useState<string[]>([]);
  const [protein, setProtein] = useState<string>(PROTEINS[0]);
  const [qty, setQty] = useState(1);

  const toggle = (t: string) =>
    setToppings((cur) =>
      cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t],
    );

  const apply = () => {
    recordExecution({
      cartonCode,
      subModuleId: SUBMODULE_ID,
      nanoBiteId: NANO_BITE_ID,
      screen: SCREEN,
      action: NANO_BITE_ID,
      payload: { protein, toppings, qty },
    });
    setOpen(false);
  };

  return (
    <PicoCard title="Modifier Application" subtitle="Attach modifiers to the last cart item">
      <ActionButton onClick={() => setOpen(true)}>Open Modifiers</ActionButton>
      {open && (
        <div className="fixed inset-0 z-[80] bg-black/50 flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-muted-foreground">
              Modifiers
            </p>

            <p className="mt-4 text-[13px] font-semibold">Protein (choose one)</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {PROTEINS.map((p) => (
                <label
                  key={p}
                  className={`h-12 rounded-xl border flex items-center justify-center text-[13px] cursor-pointer ${
                    protein === p
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary border-transparent"
                  }`}
                >
                  <input
                    type="radio"
                    name="protein"
                    className="sr-only"
                    checked={protein === p}
                    onChange={() => setProtein(p)}
                  />
                  {p}
                </label>
              ))}
            </div>

            <p className="mt-4 text-[13px] font-semibold">Toppings (multi-select)</p>
            <div className="mt-2 flex flex-col gap-1">
              {TOPPINGS.map((t) => (
                <label
                  key={t}
                  className="flex items-center gap-3 h-11 px-3 rounded-xl bg-secondary/60 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="h-5 w-5"
                    checked={toppings.includes(t)}
                    onChange={() => toggle(t)}
                  />
                  <span className="text-[14px]">{t}</span>
                </label>
              ))}
            </div>

            <p className="mt-4 text-[13px] font-semibold">Quantity</p>
            <div className="mt-2">
              <QuantityStepper value={qty} onChange={setQty} min={1} max={99} />
            </div>

            <div className="mt-6 flex gap-2">
              <ActionButton
                variant="ghost"
                className="flex-1"
                onClick={() => setOpen(false)}
              >
                Cancel
              </ActionButton>
              <ActionButton className="flex-1" onClick={apply}>
                Apply
              </ActionButton>
            </div>
          </div>
        </div>
      )}
    </PicoCard>
  );
}
