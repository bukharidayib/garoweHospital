# Supabase project

Project ref: `aruzkoysgvkatxrdytnx`

The schema and security migrations have been applied to the remote Supabase project through the Supabase integration because the Supabase CLI is not installed in this workspace. Keep the remote migration names in `docs/supabase-integration-audit.md` and export them into `supabase/migrations/` before making this repository the migration source of truth.

Never commit `.env.local`, a service-role key, or any secret key. Browser code must use only `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
