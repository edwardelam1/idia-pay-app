
-- ============ kds_stations ============
CREATE TABLE public.kds_stations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL,
  name text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  is_expediter boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kds_stations TO authenticated;
GRANT ALL ON public.kds_stations TO service_role;
ALTER TABLE public.kds_stations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kds_stations tenant access" ON public.kds_stations
  FOR ALL TO authenticated
  USING (business_id IN (SELECT business_id FROM public.business_users WHERE user_id = auth.uid()))
  WITH CHECK (business_id IN (SELECT business_id FROM public.business_users WHERE user_id = auth.uid()));
CREATE INDEX kds_stations_business_idx ON public.kds_stations(business_id, sort_order);

-- ============ kds_devices ============
CREATE TABLE public.kds_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL,
  device_id text NOT NULL,
  role text NOT NULL DEFAULT 'expediter' CHECK (role IN ('expediter','prep')),
  station_ids uuid[] NOT NULL DEFAULT '{}',
  last_seen_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (business_id, device_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kds_devices TO authenticated;
GRANT ALL ON public.kds_devices TO service_role;
ALTER TABLE public.kds_devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kds_devices tenant access" ON public.kds_devices
  FOR ALL TO authenticated
  USING (business_id IN (SELECT business_id FROM public.business_users WHERE user_id = auth.uid()))
  WITH CHECK (business_id IN (SELECT business_id FROM public.business_users WHERE user_id = auth.uid()));

-- ============ kds_tickets ============
CREATE TABLE public.kds_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL,
  ticket_number text NOT NULL,
  source text NOT NULL DEFAULT 'pos' CHECK (source IN ('pos','online','kiosk','other')),
  order_type text,
  table_label text,
  server_name text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','fulfilled','recalled')),
  fired_at timestamptz NOT NULL DEFAULT now(),
  fulfilled_at timestamptz,
  recalled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kds_tickets TO authenticated;
GRANT ALL ON public.kds_tickets TO service_role;
ALTER TABLE public.kds_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kds_tickets tenant access" ON public.kds_tickets
  FOR ALL TO authenticated
  USING (business_id IN (SELECT business_id FROM public.business_users WHERE user_id = auth.uid()))
  WITH CHECK (business_id IN (SELECT business_id FROM public.business_users WHERE user_id = auth.uid()));
CREATE INDEX kds_tickets_active_idx ON public.kds_tickets(business_id, status, fired_at);

-- ============ kds_ticket_items ============
CREATE TABLE public.kds_ticket_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.kds_tickets(id) ON DELETE CASCADE,
  business_id uuid NOT NULL,
  menu_item_id text,
  name text NOT NULL,
  quantity int NOT NULL DEFAULT 1,
  modifiers jsonb NOT NULL DEFAULT '[]'::jsonb,
  station_id uuid REFERENCES public.kds_stations(id) ON DELETE SET NULL,
  course int NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','fulfilled')),
  fulfilled_at timestamptz,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kds_ticket_items TO authenticated;
GRANT ALL ON public.kds_ticket_items TO service_role;
ALTER TABLE public.kds_ticket_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kds_ticket_items tenant access" ON public.kds_ticket_items
  FOR ALL TO authenticated
  USING (business_id IN (SELECT business_id FROM public.business_users WHERE user_id = auth.uid()))
  WITH CHECK (business_id IN (SELECT business_id FROM public.business_users WHERE user_id = auth.uid()));
CREATE INDEX kds_ticket_items_ticket_idx ON public.kds_ticket_items(ticket_id);
CREATE INDEX kds_ticket_items_station_idx ON public.kds_ticket_items(business_id, station_id, status);

-- ============ menu_item_station_routes ============
CREATE TABLE public.menu_item_station_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL,
  menu_item_id text,
  menu_item_name text,
  station_id uuid NOT NULL REFERENCES public.kds_stations(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.menu_item_station_routes TO authenticated;
GRANT ALL ON public.menu_item_station_routes TO service_role;
ALTER TABLE public.menu_item_station_routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "menu_item_station_routes tenant access" ON public.menu_item_station_routes
  FOR ALL TO authenticated
  USING (business_id IN (SELECT business_id FROM public.business_users WHERE user_id = auth.uid()))
  WITH CHECK (business_id IN (SELECT business_id FROM public.business_users WHERE user_id = auth.uid()));
CREATE INDEX menu_item_station_routes_lookup_idx
  ON public.menu_item_station_routes(business_id, menu_item_id, menu_item_name);

-- ============ updated_at trigger ============
CREATE OR REPLACE FUNCTION public.kds_touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER kds_stations_touch BEFORE UPDATE ON public.kds_stations
  FOR EACH ROW EXECUTE FUNCTION public.kds_touch_updated_at();
CREATE TRIGGER kds_devices_touch BEFORE UPDATE ON public.kds_devices
  FOR EACH ROW EXECUTE FUNCTION public.kds_touch_updated_at();
CREATE TRIGGER kds_tickets_touch BEFORE UPDATE ON public.kds_tickets
  FOR EACH ROW EXECUTE FUNCTION public.kds_touch_updated_at();
CREATE TRIGGER kds_ticket_items_touch BEFORE UPDATE ON public.kds_ticket_items
  FOR EACH ROW EXECUTE FUNCTION public.kds_touch_updated_at();

-- ============ auto-seed default stations for new businesses ============
CREATE OR REPLACE FUNCTION public.kds_seed_default_stations()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.kds_stations (business_id, name, sort_order, is_expediter)
    VALUES (NEW.id, 'Expo', 0, true);
  INSERT INTO public.kds_stations (business_id, name, sort_order, is_expediter)
    VALUES (NEW.id, 'Kitchen', 1, false);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER kds_seed_default_stations_after_business
  AFTER INSERT ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION public.kds_seed_default_stations();

-- backfill existing businesses
INSERT INTO public.kds_stations (business_id, name, sort_order, is_expediter)
SELECT b.id, 'Expo', 0, true FROM public.businesses b
WHERE NOT EXISTS (SELECT 1 FROM public.kds_stations s WHERE s.business_id = b.id AND s.name = 'Expo');
INSERT INTO public.kds_stations (business_id, name, sort_order, is_expediter)
SELECT b.id, 'Kitchen', 1, false FROM public.businesses b
WHERE NOT EXISTS (SELECT 1 FROM public.kds_stations s WHERE s.business_id = b.id AND s.name = 'Kitchen');

-- ============ realtime publication ============
ALTER PUBLICATION supabase_realtime ADD TABLE public.kds_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.kds_ticket_items;
