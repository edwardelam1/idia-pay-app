## Root cause

The Prep screen (`DailyPrepList.tsx`) queries `public.daily_prep_list`, but that table does not exist in the database. Every mount fails, the toast shows "Discovery Failed: Artifact registry unreachable", and the spinner stays until the catch block runs (which it does — so if it appears "stuck," it's the initial fetch failing repeatedly / the empty list state after failure).

`inventory_demand` (used by the "VAULT DEMAND SIGNAL" action) does exist.

## Fix

Create the missing `public.daily_prep_list` table via migration, with the columns the component reads/writes:

- `business_id` (text)
- `location` (text)
- `item_name` (text)
- `unit` (text)
- `on_hand` (numeric)
- `par_level` (numeric)
- `station` (text, constrained to Cold/Griddle/Assembly)
- standard `id`, `created_at`, `updated_at`

Add:
- GRANTs to `authenticated` and `service_role` (public schema requirement)
- RLS enabled
- Policy allowing authenticated users to manage rows for now (matches how the component queries — no auth.uid scoping since `business_id` is a free-form string, not a user id)
- `updated_at` trigger

No component changes needed — once the table exists, discovery returns `[]` cleanly and the spinner resolves.

## Follow-up (not in this change)

The component uses `.from("daily_prep_list" as any)` casts because types weren't generated. After the migration runs, types regenerate and those casts can be removed later.