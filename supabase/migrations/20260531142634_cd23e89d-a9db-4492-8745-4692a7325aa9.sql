
-- Index for ODM lookups by item
CREATE INDEX IF NOT EXISTS inventory_demand_item_idx
  ON public.inventory_demand (inventory_item_id);

-- Ensure grants (idempotent)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory_demand TO authenticated;
GRANT ALL ON public.inventory_demand TO service_role;

-- Enable RLS
ALTER TABLE public.inventory_demand ENABLE ROW LEVEL SECURITY;

-- Tenant-scoped policies via business_users membership
DROP POLICY IF EXISTS "demand_select_members" ON public.inventory_demand;
CREATE POLICY "demand_select_members"
  ON public.inventory_demand
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.business_users bu
      WHERE bu.business_id = inventory_demand.business_id
        AND bu.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "demand_insert_members" ON public.inventory_demand;
CREATE POLICY "demand_insert_members"
  ON public.inventory_demand
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.business_users bu
      WHERE bu.business_id = inventory_demand.business_id
        AND bu.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "demand_update_members" ON public.inventory_demand;
CREATE POLICY "demand_update_members"
  ON public.inventory_demand
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.business_users bu
      WHERE bu.business_id = inventory_demand.business_id
        AND bu.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.business_users bu
      WHERE bu.business_id = inventory_demand.business_id
        AND bu.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "demand_delete_members" ON public.inventory_demand;
CREATE POLICY "demand_delete_members"
  ON public.inventory_demand
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.business_users bu
      WHERE bu.business_id = inventory_demand.business_id
        AND bu.user_id = auth.uid()
    )
  );

-- Modifier groups column on menu_items
ALTER TABLE public.menu_items
  ADD COLUMN IF NOT EXISTS modifier_groups jsonb NOT NULL DEFAULT '[]'::jsonb;
