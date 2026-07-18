# Artopia

Event management platform for an art community — two independent apps powered by Supabase.

## Run & Operate

- `pnpm --filter @workspace/website run dev` — public website (preview at `/`)
- `pnpm --filter @workspace/admin run dev` — admin panel (preview at `/admin/`)
- `pnpm run typecheck` — full typecheck across all packages

## Environment Variables (required)

Both apps need these set as Secrets:
- `VITE_SUPABASE_URL` — your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — your Supabase anon/public API key

## Supabase Setup (run once)

1. Create project at supabase.com
2. Enable Discord OAuth under Authentication → Providers → Discord
3. Run SQL files **in order** in the Supabase SQL Editor:
   - `supabase/schema.sql` — tables, enums, triggers, indexes
   - `supabase/policies.sql` — Row Level Security policies
   - `supabase/storage.sql` — artwork-images storage bucket

4. Create your first admin (after signing in once with Discord):
   ```sql
   INSERT INTO admins (user_id) VALUES ('your-user-uuid');
   ```

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 18, Vite, Tailwind CSS v4, Framer Motion
- Auth/DB/Storage: Supabase (Discord OAuth)
- Routing: Wouter
- Forms: React Hook Form + Zod
- Icons: Lucide React
- Charts (admin): Recharts

## Where things live

- `artifacts/website/` — public-facing React app (gallery, events, voting, hall of fame)
- `artifacts/admin/` — admin React app (event management, moderation, analytics)
- `supabase/schema.sql` — all tables, triggers, indexes
- `supabase/policies.sql` — all RLS policies
- `supabase/storage.sql` — storage bucket + policies

## Architecture Decisions

- Both apps talk directly to Supabase — no custom Express backend needed
- Supabase RLS enforces all security rules at the database level
- Discord OAuth is handled entirely by Supabase Auth
- Event `status` enum drives all public website behavior (no polling needed — Supabase realtime)
- Artwork images stored in `artwork-images` Supabase Storage bucket (public read, authenticated write)

## User Preferences

_Populate as you build._

## Gotchas

- Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before the apps will connect
- Run supabase/schema.sql → policies.sql → storage.sql in that exact order
- First admin must be manually inserted into the admins table
- Both VITE_ env vars are exposed to the browser — never put the service_role key here
