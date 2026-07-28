/**
 * Hub Pico-Bite catalog loader.
 *
 * The hydrated blueprint embeds each nano-bite's dock as `{ id, tag, name,
 * slot, weight, mandatory }`, but the Hub currently ships `tag` and `name`
 * as NULL — only the catalog `id` is authoritative. This loader reads the
 * canonical vocabulary from `public.idia_pico_bites` (public-read catalog,
 * no business data) once per session so the resolver can translate ids into
 * telemetry tags.
 *
 * No mock data: if the catalog cannot be read, ids stay unresolved and the
 * dock renders an explicit "unmapped" tile instead of inventing anything.
 */
import { supabase } from "@/integrations/supabase/client";

export type PicoCatalogEntry = {
  id: string;
  tag: string;
  name: string;
  category: string | null;
  default_slot: string | null;
};

const SS_KEY = "idia.picoCatalog.v1";

let memo: Map<string, PicoCatalogEntry> | null = null;
let inflight: Promise<Map<string, PicoCatalogEntry>> | null = null;

function readSession(): PicoCatalogEntry[] | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SS_KEY);
    return raw ? (JSON.parse(raw) as PicoCatalogEntry[]) : null;
  } catch {
    return null;
  }
}

function writeSession(rows: PicoCatalogEntry[]) {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(SS_KEY, JSON.stringify(rows));
  } catch {
    /* ignore quota */
  }
}

function index(rows: PicoCatalogEntry[]): Map<string, PicoCatalogEntry> {
  const m = new Map<string, PicoCatalogEntry>();
  for (const r of rows) {
    if (r.id) m.set(r.id, r);
    if (r.tag) m.set(r.tag, r);
  }
  return m;
}

export async function loadPicoCatalog(): Promise<Map<string, PicoCatalogEntry>> {
  if (memo) return memo;
  if (inflight) return inflight;

  const cached = readSession();
  if (cached && cached.length > 0) {
    memo = index(cached);
    return memo;
  }

  inflight = (async () => {
    const { data, error } = await supabase
      .from("idia_pico_bites")
      .select("id, tag, name, category, default_slot")
      .eq("is_active", true);

    if (error || !data) {
      console.warn("[pico-catalog] catalog read failed", error?.message);
      inflight = null;
      return new Map<string, PicoCatalogEntry>();
    }

    const rows = data as unknown as PicoCatalogEntry[];
    writeSession(rows);
    memo = index(rows);
    console.info(`[pico-catalog] loaded ${rows.length} catalog entries`);
    inflight = null;
    return memo;
  })();

  return inflight;
}

export function clearPicoCatalog() {
  memo = null;
  inflight = null;
  if (typeof sessionStorage !== "undefined") sessionStorage.removeItem(SS_KEY);
}
