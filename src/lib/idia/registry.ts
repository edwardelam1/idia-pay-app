// IDIA Pay - Live Registry: normalizes a hydrated blueprint (from
// ProvisioningEngine.hydrateFromHub, the single hydration entry point) into a
// VerticalCarton for LiquidOS. No direct table reads — RLS blocks anon.
import { ProvisioningEngine } from "@/lib/provisioning-engine";


export type BlueprintPicoBite = {
  tag: string;
  name: string;
  slot: string | null;
  weight: number;
  mandatory: boolean;
  source?: string;
  config?: Record<string, unknown>;
};

export type NanoBiteSpec = {
  id: string;
  screen: string;
  order: number;
  task?: string;
  microElement?: string;
  valueChainStage?: string;
  cadence?: string;
  requiresTier?: string;
  /** Optional per-bite config schema from the Hub blueprint. */
  config?: Record<string, unknown>;
  /** Inline Pico-Bite dock declared by the Hub (authoritative). */
  picoBites?: BlueprintPicoBite[];
};

export type SubModule = {
  id: string;
  label: string;
  description: string;
  industry: string;
  nanoBites: NanoBiteSpec[];
};

export type VerticalCarton = {
  provisioningCode: string;
  industry: string;
  subModules: SubModule[];
  raw?: unknown;
};

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function pickScreen(nb: Record<string, unknown>): string {
  const screenTag = (nb.screenTag as string) || (nb.screen as string);
  if (screenTag) return screenTag;
  const me = nb.microElement as string | undefined;
  if (me) return me;
  const vcs = nb.valueChainStage as string | undefined;
  if (vcs) {
    return vcs
      .split(/[_\s]+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }
  return "General";
}

function normalizeBundle(bundle: Record<string, unknown>, idx: number): SubModule {
  const name = (bundle.name as string) || `Module ${idx + 1}`;
  const vertical = (bundle.vertical as string) || "General";
  const rawBites = (bundle.nanoBites as Array<Record<string, unknown>>) || [];
  const nanoBites: NanoBiteSpec[] = rawBites.map((nb, i) => ({
    id: (nb.id as string) || `nb-${i}`,
    screen: pickScreen(nb),
    order: i,
    task: nb.task as string | undefined,
    microElement: nb.microElement as string | undefined,
    valueChainStage: nb.valueChainStage as string | undefined,
    cadence: nb.cadence as string | undefined,
    requiresTier: nb.requiresTier as string | undefined,
    config: (nb.config as Record<string, unknown>) ?? undefined,
  }));
  return {
    id: slugify(`${vertical}-${name}`),
    label: name,
    description: `${vertical} · ${nanoBites.length} Nano-Bites`,
    industry: `${vertical} · ${name}`,
    nanoBites,
  };
}

function normalizePayload(code: string, payload: Record<string, unknown>): VerticalCarton {
  const modules = (payload.modules as Record<string, unknown>) || payload;
  const bundles = (modules.bundles as Array<Record<string, unknown>>) || [];
  const subModules = bundles.map(normalizeBundle).filter((b) => b.nanoBites.length > 0);
  const industry =
    subModules[0]?.industry?.split(" · ")[0] ||
    (payload.vertical as string) ||
    "Sovereign Vertical";
  return { provisioningCode: code, industry, subModules, raw: payload };
}

export async function fetchProvisioningBlueprint(
  code: string,
): Promise<VerticalCarton | null> {
  const trimmed = code.trim().toUpperCase();
  console.log(`[DATABASE_HANDSHAKE]: START - Requesting manifest for code ${trimmed}`);
  let payload: Record<string, unknown> | null = null;
  try {
    const blueprint = await ProvisioningEngine.hydrateFromHub(trimmed);
    payload = (blueprint as unknown as Record<string, unknown>) ?? null;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`[DATABASE_HANDSHAKE]: END - hydration failed: ${msg}`);
    return null;
  }
  if (!payload) {
    console.log(`[DATABASE_HANDSHAKE]: END - no manifest for ${trimmed}`);
    return null;
  }
  console.log(`[DATABASE_HANDSHAKE]: END - Success. JSON payload retrieved.`);
  const carton = normalizePayload(trimmed, payload);

  console.log(
    `[OS_HYDRATION]: START - Analyzing screenTags for sidebar generation (${carton.subModules.length} sub-modules).`,
  );
  console.log(`[OS_HYDRATION]: END - Carton normalized.`);
  return carton;
}
