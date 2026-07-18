/**
 * Nano-Bite ↔ Pico-Bite resolver.
 *
 * Loads the DB-defined relationship matrix for a given Nano-Bite container
 * and produces an ordered layout. Conflicts within the same `slot` are
 * resolved by `relationship_weight` (higher wins). Losers with
 * `is_mandatory=true` are kept as `dimmed`, others are hidden.
 *
 * Falls back to an empty layout if the fetch fails so the container's
 * bespoke chrome renders normally offline. Results are cached per session.
 */
import { supabase } from "@/integrations/supabase/client";

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

const CACHE = new Map<string, ResolvedLayout>();
const SS_KEY = "idia.nanoPico.layout.v1";

function readSession(id: string): ResolvedLayout | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(`${SS_KEY}:${id}`);
    return raw ? (JSON.parse(raw) as ResolvedLayout) : null;
  } catch {
    return null;
  }
}

function writeSession(layout: ResolvedLayout) {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(`${SS_KEY}:${layout.nanoBiteId}`, JSON.stringify(layout));
  } catch {
    /* ignore quota */
  }
}

export async function fetchNanoPicoLayout(
  nanoBiteId: string,
): Promise<ResolvedLayout> {
  if (CACHE.has(nanoBiteId)) return CACHE.get(nanoBiteId)!;
  const cached = readSession(nanoBiteId);
  if (cached) {
    CACHE.set(nanoBiteId, cached);
    return cached;
  }

  const empty: ResolvedLayout = { nanoBiteId, bites: [] };

  try {
    const { data, error } = await supabase
      .from("idia_nano_pico_relations")
      .select(
        "relationship_weight, is_mandatory, slot, config_override, idia_pico_bites!inner ( tag, name, gate_policy, default_config )",
      )
      .eq("nano_bite_id", nanoBiteId)
      .order("relationship_weight", { ascending: false });

    if (error) throw error;
    if (!data) {
      CACHE.set(nanoBiteId, empty);
      return empty;
    }

    // Normalize (supabase !inner select yields an object here).
    type Row = {
      relationship_weight: number;
      is_mandatory: boolean;
      slot: string | null;
      config_override: Record<string, unknown> | null;
      idia_pico_bites:
        | {
            tag: string;
            name: string;
            gate_policy: "none" | "shift-lock";
            default_config: Record<string, unknown> | null;
          }
        | Array<{
            tag: string;
            name: string;
            gate_policy: "none" | "shift-lock";
            default_config: Record<string, unknown> | null;
          }>;
    };

    const rows = (data as unknown as Row[]).map((r) => {
      const pico = Array.isArray(r.idia_pico_bites)
        ? r.idia_pico_bites[0]
        : r.idia_pico_bites;
      return {
        tag: pico.tag,
        name: pico.name,
        gate_policy: pico.gate_policy,
        weight: r.relationship_weight,
        slot: r.slot,
        mandatory: r.is_mandatory,
        config: {
          ...(pico.default_config ?? {}),
          ...(r.config_override ?? {}),
        } as Record<string, unknown>,
      };
    });

    // Conflict resolution per slot. Untagged slots never conflict.
    const winnerBySlot = new Map<string, { tag: string; weight: number }>();
    for (const r of rows) {
      if (!r.slot) continue;
      const cur = winnerBySlot.get(r.slot);
      if (!cur || r.weight > cur.weight) {
        winnerBySlot.set(r.slot, { tag: r.tag, weight: r.weight });
      }
    }

    const bites: ResolvedPico[] = [];
    for (const r of rows) {
      const slotWinner = r.slot ? winnerBySlot.get(r.slot) : undefined;
      const isWinner = !r.slot || slotWinner?.tag === r.tag;
      if (isWinner) {
        bites.push({ ...r, status: "active" });
      } else if (r.mandatory) {
        bites.push({
          ...r,
          status: "dimmed",
          overriddenBy: slotWinner?.tag,
        });
      }
      // non-mandatory losers are hidden
    }

    const layout: ResolvedLayout = { nanoBiteId, bites };
    CACHE.set(nanoBiteId, layout);
    writeSession(layout);
    return layout;
  } catch (err) {
    console.warn("[nano-pico-resolver] fetch failed", err);
    CACHE.set(nanoBiteId, empty);
    return empty;
  }
}

export function clearNanoPicoCache() {
  CACHE.clear();
  if (typeof sessionStorage !== "undefined") {
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const k = sessionStorage.key(i);
      if (k && k.startsWith(`${SS_KEY}:`)) sessionStorage.removeItem(k);
    }
  }
}
