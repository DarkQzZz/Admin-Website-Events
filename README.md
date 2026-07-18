# Artopia

> Where art meets community. Compete, vote, and celebrate creativity.

A production-ready event management platform for art communities — built with React, TypeScript, Vite, Framer Motion, and Supabase.

---

## Architecture

This monorepo contains two completely independent applications:

| App | Path | URL | Purpose |
|-----|------|-----|---------|
| **Public Website** | `artifacts/website` | `/` | Artists browse, submit, vote, and view results |
| **Admin Panel** | `artifacts/admin` | `/admin/` | Admins manage events, submissions, voting, and results |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| Auth | Supabase Auth (Discord OAuth) |
| Database | Supabase (PostgreSQL) |
| Storage | Supabase Storage (`artwork-images` bucket) |
| Icons | Lucide React |
| Forms | React Hook Form + Zod |
| Charts (admin) | Recharts |
| Routing | Wouter |

---

## Getting Started

### 1. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Enable Discord OAuth under **Authentication → Providers → Discord**
3. Open the **SQL Editor** and run, in order:
   - `supabase/schema.sql` — creates all tables, triggers, and indexes
   - `supabase/policies.sql` — enables Row Level Security with policies
   - `supabase/storage.sql` — creates the `artwork-images` storage bucket
4. Go to **Project Settings → API** and copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

### 2. Add environment secrets

In Replit, add these as **Secrets** (or a `.env` file locally):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Both the website and admin app use the same two environment variables.

### 3. Create your first admin

After signing in with Discord on the public site, copy your user UUID from **Supabase → Authentication → Users**, then run:

```sql
INSERT INTO admins (user_id) VALUES ('your-user-uuid-here');
```

---

## Database Schema

### Tables

| Table | Purpose |
|-------|---------|
| `profiles` | Auto-created on Discord login. Stores username, avatar, Discord ID, ban status. |
| `admins` | Lookup table — users in this table have full admin access. |
| `categories` | Submission categories (Digital Art, Photography, etc.) |
| `events` | Art events with status enum controlling public website behavior. |
| `submissions` | Artwork submissions. One per user per event. |
| `votes` | Votes with rank 1/2/3 (worth 3/2/1 points). One vote per rank per event. |
| `event_results` | Computed winners after admin generates results. |
| `settings` | Key-value platform config (site name, Discord invite URL, etc.) |

### Event Status Flow

```
draft → submission_open → submission_closed → voting_open → voting_closed → results_published → archived
```

Changing event status instantly updates the public website via Supabase realtime.

---

## Features

### Public Website
- **Home** — Hero, featured artwork, countdown, community stats, hall of fame preview
- **Current Event** — Status-driven UI (submit / vote / view results based on event phase)
- **Gallery** — Pinterest-style masonry with infinite scroll, search, and category filters
- **View Artwork** — Full artwork view with voting panel
- **Hall of Fame** — All past winners grouped by event
- **Login** — Discord OAuth via Supabase
- **Profile** — View and manage own submissions

### Admin Panel
- **Dashboard** — Live stats, quick event controls, analytics charts, recent activity
- **Events** — Full CRUD with banner upload, rules/prizes editor, instant status controls
- **Submissions** — Approve/reject/delete with bulk actions, search, filters
- **Voting** — Leaderboard, suspicious activity detection, individual vote removal
- **Results** — Generate and publish winners, export CSV
- **Users** — Search, ban/unban with reason, view user submissions
- **Analytics** — Charts for registrations, submissions, votes, storage usage
- **Settings** — Platform branding, Discord config, social links

---

## Voting System

- Users rank their Top 3 favorite artworks per event
- Points: 1st choice = 3 pts, 2nd choice = 2 pts, 3rd choice = 1 pt
- Cannot vote for your own artwork
- Cannot vote more than once per rank per event
- Admins can remove suspicious votes

---

## Running Locally

```bash
# Public website (port auto-assigned by Replit)
pnpm --filter @workspace/website run dev

# Admin panel (port auto-assigned by Replit)
pnpm --filter @workspace/admin run dev
```

---

## Supabase SQL Setup

See `supabase/` directory:
- `schema.sql` — Run first: tables, enums, triggers, indexes, default data
- `policies.sql` — Run second: RLS policies for all tables
- `storage.sql` — Run third: artwork-images bucket + storage policies
