# J.A.S. Caffeinated — QR Menu

A Next.js + Supabase app for an in-restaurant QR-driven menu and ordering system. This repository contains the Next.js frontend (App Router, TypeScript, Tailwind) and SQL / Supabase configuration for local development with Supabase or using a hosted Supabase instance.

This README explains the two Supabase options (online vs local), how to configure environment variables, and how to test the app from another device (phone).

## Quick summary

- Framework: Next.js (App Router) with TypeScript
- Styling: Tailwind CSS
- Database / Auth: Supabase (hosted or local Docker/Supabase CLI)
- Purpose: Customer-facing menu, admin dashboard, ordering, reviews, and inventory management.

## Prerequisites

- Node >= 18 — [Node.js](https://nodejs.org/)
- npm (bundled with Node) or your preferred package manager
- Docker Desktop (only required for local Supabase)
- (Optional) Supabase CLI (recommended if you want the CLI workflow)

## Repository layout (high level)

- `app/` — Next.js app router pages and layouts
- `components/` — React components used by pages (admin/customer/ui)
- `lib/` — app helpers (Supabase client wrapper, utils)
- `sql/` — SQL schema, indexes, policies, and sample data
- `supabase/` — local supabase project config / seed files

## Supabase — Online vs Local

You can use a hosted Supabase project (online) or run a local Supabase stack (Docker + Supabase CLI). Choose one and set environment variables accordingly.

### Hosted Supabase (recommended when you don't need a local DB)

- Use the Supabase project URL (for example `https://xyzcompany.supabase.co`) and the project's anon/public key.
- Set your `.env.local` like:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<YOUR_PROJECT_ID>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=<ANON_PUBLIC_KEY>
```

- When using hosted Supabase you do not need to run Docker or the Supabase CLI locally. The site can talk to your online Supabase from any device that has network access.

### Local Supabase (useful for offline dev, seeds, and local migrations)

- Run a local Supabase stack using the Supabase CLI or Docker. This repository includes a `supabase/` folder with config and a `seed.sql` used for local development.
- Typical ports in this repo's config (see `supabase/config.toml`):
  - Supabase API: 54321
  - Postgres DB: 54322
  - Supabase Studio: 54323

- Example `.env.local` for local testing (replace `<HOST_IP>` with your machine's LAN IP when testing from a phone):

```env
NEXT_PUBLIC_SUPABASE_URL=http://<HOST_IP>:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=<ANON_KEY>
```

- Start with the Supabase CLI:

```powershell
# from the repo root
supabase start
# stop when done
supabase stop
```

- Apply migrations or reset/seed the DB when needed:

```powershell
supabase db push    # apply migrations
supabase db reset   # wipe local DB and re-run seed.sql
```

## Environment variables and phone testing

- If you plan to open the site from a phone on the same network, use a reachable IP in `NEXT_PUBLIC_SUPABASE_URL` (for local Supabase) and bind Next's dev server to `0.0.0.0`.
- Example `.env.local` (local):

```env
NEXT_PUBLIC_SUPABASE_URL=http://192.168.1.100:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=<ANON_KEY>
```

- Example `.env.local` (hosted):

```env
NEXT_PUBLIC_SUPABASE_URL=https://<YOUR_PROJECT_ID>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=<ANON_KEY>
```

- Start Next.js dev server bound to all interfaces so your phone can connect:

```powershell
# bind runtime to 0.0.0.0 for the session then run dev
$env:HOST = '0.0.0.0'; npm run dev
# or, if supported by your Next version:
npx next dev --hostname 0.0.0.0
```

- Then open `http://<HOST_IP>:3000` on the phone.

Note: when using hosted Supabase you don't need to change the host IP — just use the hosted project URL.

## Common commands

- Install deps: `npm install`
- Start dev server: `npm run dev`
- Build: `npm run build`
- Start production server: `npm run start`
- Lint: `npm run lint`

## Key developer workflow (local stack)

1. Start Supabase: `supabase start`
2. Create `.env.local` with the proper `NEXT_PUBLIC_SUPABASE_URL` and anon key
3. Start Next bound to `0.0.0.0`: `$env:HOST='0.0.0.0'; npm run dev`
4. Visit `http://<HOST_IP>:3000` from your phone or desktop

## Troubleshooting

- If the app can't reach Supabase from your phone, open Supabase Studio at `http://<HOST_IP>:54323` to confirm the stack is reachable.
- After changing `supabase/config.toml`, restart the stack: `supabase stop && supabase start`.
- If data is missing, run `supabase db reset` to reseed the local DB.
- If you don't have the anon key, copy it from Studio → Settings → API.
- For TypeScript/compile errors after edits: stop the dev server, delete `.next`, and run `npm run dev` again.

## Files of interest

- `supabase/config.toml` — local Supabase configuration (ports, seeds, studio, api_url)
- `supabase/seed.sql` — seed data loaded by `supabase db reset`
- `supabase/migrations/` — SQL migration files

## Checklist for new contributors

- [ ] Docker Desktop running (if using local Supabase)
- [ ] `supabase start` (or equivalent Docker compose)
- [ ] `supabase db push` (migrations) or `supabase db reset` (reset + seed)
- [ ] Create `.env.local` with NEXT_PUBLIC_SUPABASE_URL and anon key
- [ ] Start Next binding to 0.0.0.0 and test from phone
