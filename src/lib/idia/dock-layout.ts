/**
 * Per-operator Pico-Bite dock ordering.
 *
 * The Hub manifest stays authoritative for WHICH tiles exist in a dock and
 * for conflict resolution / dimming. This module only remembers the ORDER a
 * given operator dragged them into, keyed by (user, business, nano-bite).
 *
 * Golden rules honoured here:
 *  - no upsert: discrete SELECT → INSERT or UPDATE.
 *  - no mock data: a missing row simply means "manifest order".
 */
import { supabase } from "@/integrations/supabase/client";

const NIL_BUSINESS = "00000000-0000-0000-0000-000000000000";

async function currentUserId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.user?.id ?? null;
  } catch {
    return null;
  }
}

function scopeFilter(
  query: ReturnType<typeof supabase.from>["select"] extends never ? never : any,
  businessId: string | null,
) {
  return businessId
    ? query.eq("business_id", businessId)
    : query.is("business_id", null);
}

/**
 * Returns the saved tag order for this dock, or null when nothing is stored
 * (or the operator is not signed in).
 */
export async function loadDockOrder(
  nanoBiteId: string,
  businessId: string | null,
): Promise<string[] | null> {
  const userId = await currentUserId();
  if (!userId) return null;

  try {
    const base = supabase
      .from("pico_dock_layouts")
      .select("tag_order")
      .eq("user_id", userId)
      .eq("nano_bite_id", nanoBiteId);

    const { data, error } = await scopeFilter(base, businessId).maybeSingle();
    if (error) throw error;
    const order = (data as { tag_order?: string[] } | null)?.tag_order;
    return Array.isArray(order) && order.length > 0 ? order : null;
  } catch (err) {
    console.warn("[dock-layout] load failed", err);
    return null;
  }
}

/**
 * Persists the tag order. Discrete read → insert/update, never upsert.
 */
export async function saveDockOrder(
  nanoBiteId: string,
  businessId: string | null,
  tagOrder: string[],
): Promise<boolean> {
  const userId = await currentUserId();
  if (!userId) return false;

  try {
    const base = supabase
      .from("pico_dock_layouts")
      .select("id")
      .eq("user_id", userId)
      .eq("nano_bite_id", nanoBiteId);

    const { data: existing, error: readErr } = await scopeFilter(
      base,
      businessId,
    ).maybeSingle();
    if (readErr) throw readErr;

    if (existing?.id) {
      const { error } = await supabase
        .from("pico_dock_layouts")
        .update({ tag_order: tagOrder })
        .eq("id", existing.id);
      if (error) throw error;
      return true;
    }

    const { error } = await supabase.from("pico_dock_layouts").insert([
      {
        user_id: userId,
        business_id: businessId,
        nano_bite_id: nanoBiteId,
        tag_order: tagOrder,
      },
    ]);
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn("[dock-layout] save failed", err);
    return false;
  }
}

/**
 * Applies a saved order over a manifest-resolved list.
 * Unknown saved tags are ignored; newly published tags append in manifest order.
 */
export function applyDockOrder<T extends { tag: string }>(
  bites: T[],
  order: string[] | null,
): T[] {
  if (!order || order.length === 0) return bites;
  const rank = new Map(order.map((tag, i) => [tag, i]));
  return [...bites].sort((a, b) => {
    const ra = rank.has(a.tag) ? (rank.get(a.tag) as number) : Number.MAX_SAFE_INTEGER;
    const rb = rank.has(b.tag) ? (rank.get(b.tag) as number) : Number.MAX_SAFE_INTEGER;
    if (ra !== rb) return ra - rb;
    return bites.indexOf(a) - bites.indexOf(b);
  });
}

export { NIL_BUSINESS };
