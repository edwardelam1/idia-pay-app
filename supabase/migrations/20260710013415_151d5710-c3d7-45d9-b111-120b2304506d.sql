CREATE POLICY "Enable read access for all users"
  ON public.profiles
  FOR SELECT
  TO public
  USING (true);