/**
 * Nano-Bite ↔ Pico-Bite resolver — manifest-only, cache-free.
 *
 * The Hub embeds the authoritative Pico-Bite dock inline in each
 * `modules.bundles[].nanoBites[].picoBites[]` entry of the hydrated
 * manifest. `src/lib/idia/registry.ts` normalizes that into
 * `NanoBiteSpec.picoBites`, and this module turns that list into a
 * render-ready layout by applying the conflict rules:
 *   - Highest `weight` per `slot` wins → rendered normally.
 *   - Losers with `mandatory=true` render dimmed (with "Overridden by …").
 *   - Losers with `mandatory=false` are hidden.
 *   - Untagged slots never conflict.
 *
 * There is deliberately NO cache here (no module map, no sessionStorage).
 * Layout is derived from the live manifest on every render, so a Hub
 * redeploy can never leave ghost tiles behind.
 *
 * `gate_policy` comes from the flat client `PICO_BITE_REGISTRY`. Entries
 * the Hub still ships without a `tag` (bare UUIDs) are translated through
 * the published pico catalog.
 */
import {
  PICO_BITE_REGISTRY,
  canonicalPicoTag,
} from "@/components/pico-bites/registry";
import { loadPicoCatalog, type PicoCatalogEntry } from "@/lib/idia/pico-catalog";
import type { BlueprintPicoBite } from "@/lib/idia/registry";

export type ResolvedPico = {
  tag: string;
  name: string;
  gate_policy: "none" | "shift-lock";
  weight: number;
  slot: string | null;
  mandatory: boolean;
  status: "active" | "dimmed";
  overriddenBy?: string;
  config: Record<string, unknown>;
};

export type ResolvedLayout = {
  nanoBiteId: string;
  bites: ResolvedPico[];
};

type IncomingPico = {
  tag: string;
  name: string;
  slot: string | null;
  weight: number;
  mandatory: boolean;
  config?: Record<string, unknown> | null;
};

function resolveConflicts(nanoBiteId: string, rows: IncomingPico[]): ResolvedLayout {
  // Sort by weight desc so first-seen per slot is the winner.
  const sorted = [...rows].sort((a, b) => b.weight - a.weight);

  const winnerBySlot = new Map<string, { tag: string; weight: number }>();
  for (const r of sorted) {
    if (!r.slot) continue;
    const cur = winnerBySlot.get(r.slot);
    if (!cur || r.weight > cur.weight) {
      winnerBySlot.set(r.slot, { tag: r.tag, weight: r.weight });
    }
  }

  const bites: ResolvedPico[] = [];
  for (const r of sorted) {
    const registryEntry = PICO_BITE_REGISTRY[r.tag];
    const gate_policy = registryEntry?.gate ?? "shift-lock";
    const slotWinner = r.slot ? winnerBySlot.get(r.slot) : undefined;
    const isWinner = !r.slot || slotWinner?.tag === r.tag;
    const merged: ResolvedPico = {
      tag: r.tag,
      name: r.name,
      gate_policy,
      weight: r.weight,
      slot: r.slot,
      mandatory: r.mandatory,
      status: isWinner ? "active" : "dimmed",
      overriddenBy: isWinner ? undefined : slotWinner?.tag,
      config: r.config ?? {},
    };
    if (isWinner) {
      bites.push(merged);
    } else if (r.mandatory) {
      bites.push(merged);
    }
    // non-mandatory losers hidden
  }
  return { nanoBiteId, bites };
}

/**
 * Pure resolver: manifest pico list → render-ready layout.
 * The only async work is the catalog lookup for entries the Hub shipped
 * without a human tag/name.
 */
export async function resolveLayoutFromSpec(
  nanoBiteId: string,
  picos: BlueprintPicoBite[] | undefined,
): Promise<ResolvedLayout> {
  if (!picos || picos.length === 0) return { nanoBiteId, bites: [] };

  const needsCatalog = picos.some(
    (p) => !p.name || !PICO_BITE_REGISTRY[canonicalPicoTag(p.tag)],
  );
  const catalog = needsCatalog
    ? await loadPicoCatalog()
    : new Map<string, PicoCatalogEntry>();

  const rows: IncomingPico[] = picos
    .map((p) => {
      const entry = catalog.get(p.tag);
      const tag = canonicalPicoTag(entry?.tag || p.tag);
      return {
        tag,
        name: p.name || entry?.name || tag,
        slot: p.slot ?? entry?.default_slot ?? null,
        weight: typeof p.weight === "number" ? p.weight : 10,
        mandatory: Boolean(p.mandatory),
        config: p.config ?? null,
      };
    })
    .filter((r) => Boolean(r.tag));

  return resolveConflicts(nanoBiteId, rows);
}
