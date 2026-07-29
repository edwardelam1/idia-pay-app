CREATE TABLE public.pico_dock_layouts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  business_id uuid,
  nano_bite_id text NOT NULL,
  tag_order text[] NOT NULL DEFAULT '{}'::text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX pico_dock_layouts_user_scope_idx
  ON public.pico_dock_layouts (user_id, nano_bite_id, COALESCE(business_id, '00000000-0000-0000-0000-000000000000'::uuid));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pico_dock_layouts TO authenticated;
GRANT ALL ON public.pico_dock_layouts TO service_role;

ALTER TABLE public.pico_dock_layouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pico_dock_layouts_select_own" ON public.pico_dock_layouts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "pico_dock_layouts_insert_own" ON public.pico_dock_layouts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pico_dock_layouts_update_own" ON public.pico_dock_layouts
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pico_dock_layouts_delete_own" ON public.pico_dock_layouts
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.pico_dock_layouts_touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER pico_dock_layouts_set_updated_at
  BEFORE UPDATE ON public.pico_dock_layouts
  FOR EACH ROW EXECUTE FUNCTION public.pico_dock_layouts_touch_updated_at();