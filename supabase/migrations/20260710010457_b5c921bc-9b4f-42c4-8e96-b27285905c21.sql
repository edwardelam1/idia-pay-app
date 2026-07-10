
-- Enable RLS on the three proposal tables
ALTER TABLE public.dao_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.governance_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_proposals ENABLE ROW LEVEL SECURITY;

-- dao_proposals: drop public/anon SELECT policies; keep authenticated read
DROP POLICY IF EXISTS "Allow read access to dao_proposals" ON public.dao_proposals;
DROP POLICY IF EXISTS "Public read official proposals" ON public.dao_proposals;
DROP POLICY IF EXISTS "Read dao_proposals" ON public.dao_proposals;
DROP POLICY IF EXISTS "Sovereigns can read all proposals" ON public.dao_proposals;

-- governance_proposals: drop public SELECT; keep authenticated read
DROP POLICY IF EXISTS "Read governance_proposals" ON public.governance_proposals;

-- user_proposals: drop public read-all; keep owner-scoped policies
DROP POLICY IF EXISTS "Read user_proposals" ON public.user_proposals;
DROP POLICY IF EXISTS "Users can view all proposals" ON public.user_proposals;

-- profiles: replace public "read all" with owner-only read
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
-- "Users can view their own profile" already exists with auth.uid() = user_id
