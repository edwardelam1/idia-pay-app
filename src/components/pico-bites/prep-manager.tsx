/**
 * PrepItemManager — inline add/remove UI for operator-managed prep items.
 * Backed by public.daily_prep_list via `usePrepItems`. Zero mock data.
 * Rendered inside inventory-flavored Pico-Bites so operators never see a
 * static taco/burrito/protein list — the catalog is theirs to author.
 */
import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";
import {
  usePrepItems,
  addPrepItem,
  removePrepItem,
  type PrepItem,
} from "@/lib/idia/prep-items";
import { useActiveBusinessId } from "@/lib/idia/ActiveBusinessContext";

type Props = {
  compact?: boolean;
  title?: string;
  emptyLabel?: string;
  station?: string;
};

export function PrepItemManager({
  compact = false,
  title = "Prep Catalog",
  emptyLabel = "No items yet — add your first below.",
  station,
}: Props) {
  const businessId = useActiveBusinessId();
  const { items, loading } = usePrepItems(businessId);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const visible = station ? items.filter((i) => i.station === station) : items;

  const add = async () => {
    const name = draft.trim();
    if (!name) return;
    if (!businessId) {
      toast.error("No active business — hydrate a blueprint first.");
      return;
    }
    setBusy(true);
    const row = await addPrepItem({ businessId, itemName: name, station });
    setBusy(false);
    if (row) {
      setDraft("");
      toast.success(`Added ${row.item_name}`);
    } else {
      toast.error("Could not add item");
    }
  };

  const remove = async (row: PrepItem) => {
    const ok = await removePrepItem(row.id);
    if (ok) toast.success(`Removed ${row.item_name}`);
    else toast.error("Could not remove item");
  };

  return (
    <div
      className={`rounded-xl border border-border bg-card/60 ${compact ? "p-2" : "p-3"} flex flex-col gap-2`}
    >
      <header className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {title}
        </p>
        <span className="text-[10px] text-muted-foreground tabular-nums">
          {visible.length}
        </span>
      </header>

      {loading ? (
        <p className="text-[11px] text-muted-foreground">Loading…</p>
      ) : visible.length === 0 ? (
        <p className="text-[11px] text-muted-foreground">{emptyLabel}</p>
      ) : (
        <ul className="flex flex-col gap-1 max-h-40 overflow-y-auto">
          {visible.map((it) => (
            <li
              key={it.id}
              className="flex items-center justify-between rounded-lg bg-secondary px-2 py-1.5 text-[12px]"
            >
              <span className="truncate font-medium">{it.item_name}</span>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-muted-foreground tabular-nums">
                  par {Number(it.par_level)}
                </span>
                <button
                  onClick={() => void remove(it)}
                  aria-label={`Remove ${it.item_name}`}
                  className="text-destructive/70 hover:text-destructive"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-2 pt-1 border-t border-border">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void add();
          }}
          placeholder="New item name"
          className="flex-1 h-8 rounded-lg bg-secondary px-2 text-[12px] outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          disabled={busy || draft.trim().length === 0}
          onClick={() => void add()}
          className="h-8 px-3 rounded-lg bg-primary text-primary-foreground text-[12px] font-semibold disabled:opacity-40 flex items-center gap-1"
        >
          <Plus size={14} /> Add
        </button>
      </div>
    </div>
  );
}
