/**
 * Nano-Bite ↔ Pico-Bite resolver — blueprint-first.
 *
 * The Hub now embeds the authoritative Pico-Bite dock inline in each
 * `modules.bundles[].nanoBites[].picoBites[]` entry of the hydrated
 * manifest (`idia_schema_manifest_vault.schema_payload`). This resolver
 * reads that payload from the cached blueprint (populated by
 * `ProvisioningEngine.hydrateFromHub`) and applies the same conflict
 * rules the old DB-driven path used:
 *   - Highest `weight` per `slot` wins → rendered normally.
 *   - Losers with `mandatory=true` render dimmed (with "Overridden by …").
 *   - Losers with `mandatory=false` are hidden.
 *   - Untagged slots never conflict.
 *
 * `gate_policy` and `default_config` come from the flat client
 * `PICO_BITE_REGISTRY`, so no extra network round-trip is needed to
 * paint the dock. A legacy `idia_nano_pico_relations` fallback fires
 * only if the blueprint has no inline dock for a given nano bite AND
 * a session cache miss — this keeps first-boot before hydration alive.
 */
import { supabase } from "@/integrations/supabase/client";
import { ProvisioningEngine } from "@/lib/provisioning-engine";
import { PICO_BITE_REGISTRY } from "@/components/pico-bites/registry";

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
const SS_KEY = "idia.nanoPico.layout.v2";

function sessionKey(nanoBiteId: string): string {
  const code =
    (typeof window !== "undefined" &&
      ProvisioningEngine.loadCached()?.provisioningCode) ||
    "unknown";
  return `${SS_KEY}:${code}:${nanoBiteId}`;
}

function readSession(nanoBiteId: string): ResolvedLayout | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(sessionKey(nanoBiteId));
    return raw ? (JSON.parse(raw) as ResolvedLayout) : null;
  } catch {
    return null;
  }
}

function writeSession(layout: ResolvedLayout) {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(sessionKey(layout.nanoBiteId), JSON.stringify(layout));
  } catch {
    /* ignore quota */
  }
}

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
    const defaultConfig = registryEntry?.defaultConfig ?? {};
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
      config: { ...defaultConfig, ...(r.config ?? {}) },
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

function fromBlueprint(nanoBiteId: string): ResolvedLayout | null {
  const bp = ProvisioningEngine.loadCached();
  if (!bp) return null;
  const modules = (bp as unknown as { modules?: Record<string, unknown> }).modules;
  const bundles = (modules?.bundles as Array<Record<string, unknown>>) ?? [];
  for (const bundle of bundles) {
    const bites = (bundle.nanoBites as Array<Record<string, unknown>>) ?? [];
    const match = bites.find((nb) => (nb.id as string) === nanoBiteId);
    if (!match) continue;
    const picos = (match.picoBites as Array<Record<string, unknown>>) ?? [];
    if (picos.length === 0) return null;
    const rows: IncomingPico[] = picos.map((p) => ({
      tag: ((p.tag as string) || (p.id as string)) ?? "",
      name: (p.name as string) ?? "",
      slot: (p.slot as string) ?? null,
      weight: typeof p.weight === "number" ? (p.weight as number) : 10,
      mandatory: Boolean(p.mandatory),
      config: (p.config as Record<string, unknown>) ?? null,
    })).filter((r) => Boolean(r.tag));
    return resolveConflicts(nanoBiteId, rows);
  }
  return null;
}

// Legacy `idia_nano_pico_relations` fallback removed — that table has been
// dropped now that the Hub blueprint is the sole source of truth.

export async function fetchNanoPicoLayout(
  nanoBiteId: string,
): Promise<ResolvedLayout> {
  if (CACHE.has(nanoBiteId)) return CACHE.get(nanoBiteId)!;

  const fromBp = fromBlueprint(nanoBiteId);
  if (fromBp) {
    console.info(
      `[nano-pico-resolver] source=blueprint nano=${nanoBiteId} bites=${fromBp.bites.length}`,
    );
    CACHE.set(nanoBiteId, fromBp);
    writeSession(fromBp);
    return fromBp;
  }

  const cached = readSession(nanoBiteId);
  if (cached) {
    CACHE.set(nanoBiteId, cached);
    return cached;
  }

  console.info(
    `[nano-pico-resolver] source=empty nano=${nanoBiteId} (no blueprint cached)`,
  );
  const empty: ResolvedLayout = { nanoBiteId, bites: [] };
  CACHE.set(nanoBiteId, empty);
  return empty;
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
