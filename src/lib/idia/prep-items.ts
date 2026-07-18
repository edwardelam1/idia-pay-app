/**
 * Operator-managed prep/inventory catalog, backed by public.daily_prep_list.
 *
 * This is the SINGLE source of truth for every inventory-flavored Pico-Bite
 * (log waste, restock receive, cycle count, timed 86, long-press 86) as well
 * as the Prep Nano-Bite item manager. No mock rows, no seed data — an empty
 * catalog reads as an empty grid with an inline "Add item" action.
 */
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type PrepItem = {
  id: string;
  business_id: string;
  location: string;
  item_name: string;
  unit: string;
  on_hand: number;
  par_level: number;
  station: string;
};

const CHANNEL = "prep-items";

async function fetchAll(businessId: string): Promise<PrepItem[]> {
  const { data, error } = await supabase
    .from("daily_prep_list")
    .select("*")
    .eq("business_id", businessId)
    .order("item_name", { ascending: true });
  if (error) {
    console.warn("[prep-items] fetch failed:", error.message);
    return [];
  }
  return (data ?? []) as PrepItem[];
}

export function usePrepItems(businessId: string | null | undefined) {
  const [items, setItems] = useState<PrepItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!businessId) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setItems(await fetchAll(businessId));
    setLoading(false);
  }, [businessId]);

  useEffect(() => {
    void refresh();
    if (!businessId) return;
    const ch = supabase
      .channel(`${CHANNEL}:${businessId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "daily_prep_list",
          filter: `business_id=eq.${businessId}`,
        },
        () => void refresh(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
  }, [businessId, refresh]);

  return { items, loading, refresh };
}

export async function addPrepItem(input: {
  businessId: string;
  itemName: string;
  station?: string;
  unit?: string;
  parLevel?: number;
  location?: string;
}): Promise<PrepItem | null> {
  const { data, error } = await supabase
    .from("daily_prep_list")
    .insert({
      business_id: input.businessId,
      item_name: input.itemName.trim(),
      station: input.station ?? "Cold",
      unit: input.unit ?? "Pans",
      par_level: input.parLevel ?? 0,
      on_hand: 0,
      location: input.location ?? "Primary",
    })
    .select()
    .single();
  if (error) {
    console.warn("[prep-items] insert failed:", error.message);
    return null;
  }
  return data as PrepItem;
}

export async function removePrepItem(id: string): Promise<boolean> {
  const { error } = await supabase.from("daily_prep_list").delete().eq("id", id);
  if (error) {
    console.warn("[prep-items] delete failed:", error.message);
    return false;
  }
  return true;
}

export async function adjustPrepOnHand(
  id: string,
  onHand: number,
): Promise<boolean> {
  const { error } = await supabase
    .from("daily_prep_list")
    .update({ on_hand: onHand })
    .eq("id", id);
  if (error) {
    console.warn("[prep-items] update failed:", error.message);
    return false;
  }
  return true;
}
