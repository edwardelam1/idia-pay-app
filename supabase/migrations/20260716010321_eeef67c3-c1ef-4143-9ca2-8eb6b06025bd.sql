
CREATE TABLE public.daily_prep_list (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id text NOT NULL,
  location text NOT NULL,
  item_name text NOT NULL,
  unit text NOT NULL DEFAULT 'Pans',
  on_hand numeric NOT NULL DEFAULT 0,
  par_level numeric NOT NULL DEFAULT 0,
  station text NOT NULL DEFAULT 'Cold' CHECK (station IN ('Cold','Griddle','Assembly')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_prep_list TO authenticated;
GRANT ALL ON public.daily_prep_list TO service_role;

ALTER TABLE public.daily_prep_list ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage prep list"
  ON public.daily_prep_list FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_daily_prep_list_updated_at
BEFORE UPDATE ON public.daily_prep_list
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
