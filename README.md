 # J.A.S. Caffeinated — QR Menu

A Next.js + Supabase app for an in-restaurant QR-driven menu and ordering system. This repository contains the Next.js frontend (App Router, TypeScript, Tailwind) and SQL / Supabase configuration to run a local Supabase stack for development.

This README helps you get started locally, run the app, and connect a phone on the same network/hotspot for testing.

## Quick summary

- Framework: Next.js (App Router) with TypeScript
- Styling: Tailwind CSS
- Database / Auth: Supabase (local Docker stack supported in `supabase/`)
- Purpose: Customer-facing menu, admin dashboard, ordering, reviews, and inventory management.

## Prerequisites

- Node >= 18 (install from https://nodejs.org/)
- npm (bundled with Node) or your preferred package manager
- Docker (for local Supabase) if you want to run the full stack locally
- (Optional) Supabase CLI if you prefer `supabase start` for the local stack

## Repository layout (high level)

- `app/` — Next.js app router pages and layouts
- `components/` — React components used by pages (admin/customer/ui)
- `lib/` — app helpers (Supabase client wrapper, utils)
- `sql/` — SQL schema, indexes, policies, and sample data
- `supabase/` — local supabase project config / seed files

## Setup (local development)

1. Install dependencies

```powershell
npm install
```

2. Environment variables

Create a `.env.local` file in the project root. Minimal variables required by the app:

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=http://<YOUR_MACHINE_IP>:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=<anon-public-key>
# (Optional) Service role or server keys go into server-only environment variables if needed
# SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

Notes:
- When testing from a phone on the same network/hotspot, set `NEXT_PUBLIC_SUPABASE_URL` to your desktop/laptop IP (e.g. `http://192.168.1.100:54321`) so the phone can reach the local Supabase instance. Make sure Docker/Supabase is bound to 0.0.0.0 and firewall allows the port.
- The `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY` is typically found in the Supabase project's settings or the local seed. For local Supabase it may be in `supabase/seed.sql` or the Supabase CLI output when the stack starts.

3. Start Supabase (local)

- Option A: Using the Supabase CLI
  - Install: https://supabase.com/docs/guides/cli
  - From the repo root: `supabase start` (or follow the `supabase/README` if present)

- Option B: Using Docker compose
  - If the repo includes a docker-compose / supabase config, run the provided compose or the Supabase CLI generated compose files. Use `docker ps` to confirm the stack is running and note the Postgres/API port (commonly `54321` for local Supabase in some setups).

4. Start Next.js (dev)

This project uses Next's dev server. In PowerShell, run:

```powershell
npm run dev
```

If you need to access the Next dev server from another device on your network, run Next bound to all interfaces (example):

```powershell
npx next dev --hostname 0.0.0.0
# or
npm run dev -- --hostname 0.0.0.0
```

Then open `http://<YOUR_MACHINE_IP>:3000` on the phone to view the site.

## Database migrations & seed

- The `sql/` directory contains schema and sample data. To apply schema changes to a running Supabase instance, use the Supabase UI or `psql` to run the SQL files.
- If you added/changed categories (for example `Desserts`), make sure to run the appropriate migration SQL so the DB constraint and sample data include the new category.

## Common commands

- Start dev server: `npm run dev`
- Build: `npm run build`
- Start production server: `npm run start`
- Lint: `npm run lint`

## Testing from a phone (hotspot / LAN)

1. Connect your phone to the same network (Wi‑Fi or phone-hosted hotspot).
2. Ensure your machine's firewall allows inbound connections on ports 3000 (Next) and 54321 (local Supabase) or whatever your stack uses.
3. Use your machine IP (e.g. `192.168.1.100`) in both the phone's browser and in the `.env.local` `NEXT_PUBLIC_SUPABASE_URL` value, then restart the Next dev server if you changed envs.

Note: Browsers may block mixed-content if your site is served over HTTPS but Supabase is on HTTP. For local testing use HTTP consistently.

# J.A.S. Caffeinated — QR Menu

A Next.js + Supabase app for an in-restaurant QR-driven menu and ordering system. This repository contains the Next.js frontend (App Router, TypeScript, Tailwind) and SQL / Supabase configuration to run a local Supabase stack for development.

This README provides a concise project overview plus a detailed "Development" section that explains how to run the local Supabase stack, apply migrations and seeds, and test the site from another device (phone).

## Quick summary

- Framework: Next.js (App Router) with TypeScript
- Styling: Tailwind CSS
- Database / Auth: Supabase (local Docker stack supported in `supabase/`)
- Purpose: Customer-facing menu, admin dashboard, ordering, reviews, and inventory management.

## Prerequisites

- Node >= 18
- npm (bundled with Node) or your preferred package manager
- Docker Desktop (for local Supabase)
- (Optional) Supabase CLI (recommended for `supabase start`)

## Repository layout (high level)

- `app/` — Next.js App Router pages and layouts
- `components/` — React components used by pages (admin/customer/ui)
- `lib/` — app helpers (Supabase client wrapper, utils)
- `sql/` — SQL schema, indexes, policies, and sample data
- `supabase/` — local supabase project config / seed files

## Getting started (quick)

1. Install dependencies:

```powershell
npm install
```

2. Create `.env.local` (see Development -> Environment variables for details)

3. Start local services (Supabase + Next) — see Development for step-by-step commands.

## Common commands

- Start dev server: `npm run dev`
- Build: `npm run build`
- Start production server: `npm run start`
- Lint: `npm run lint`

## Development (local Supabase + Next)

This project includes a `supabase/` folder with configuration, migrations and a seed file. The following steps show the recommended developer workflow for running the full local stack and testing from another device (phone).

Key ports (from `supabase/config.toml`):

- Supabase API: 54321
- Postgres DB: 54322
- Supabase Studio: 54323
- Next.js dev server: 3000

Prereqs recap

- Docker Desktop (Windows)
- Supabase CLI (recommended): https://supabase.com/docs/guides/cli
- Node.js and npm (or pnpm/yarn)

Start the local Supabase stack (Supabase CLI — recommended)

```powershell
# from the repo root
supabase start

# stop when done
supabase stop
```

Notes: `supabase start` will create and manage the containers using the config in `supabase/config.toml`. If you don't want to use the CLI you can run the containers manually with Docker, but the CLI avoids manual compose management.

Apply migrations and seed (optional / when needed)

- Push migrations (apply incremental migrations):

```powershell
supabase db push
```

- Reset the DB and re-run seeds (wipes the local DB):

```powershell
supabase db reset
```

The `config.toml` in this repo enables migrations and configures `supabase/seed.sql` to run on reset.

Find the anon (publishable) key

When the stack is running you can copy the anon/public key from Supabase Studio: open `http://localhost:54323` (or `http://<HOST_IP>:54323`), navigate to Project Settings → API and copy the anon key. The CLI also prints keys on startup.

Environment variables (.env.local)

Create a file named `.env.local` at the project root and add:

```env
NEXT_PUBLIC_SUPABASE_URL=http://<HOST_IP>:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=<ANON_KEY>
```

Important: replace `<HOST_IP>` with your machine's LAN IP (for phone testing use the IP visible to the phone, not `localhost`).

Find your machine IP (Windows PowerShell)

```powershell
Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.PrefixOrigin -ne 'WellKnown' } | Select-Object IPAddress
```

Run Next.js and bind to all interfaces (so the phone can connect)

PowerShell example (binds runtime to 0.0.0.0 for the session):

```powershell
$env:HOST = '0.0.0.0'; npm run dev
```

Alternatively, if your Next version supports a hostname flag:

```powershell
npx next dev --hostname 0.0.0.0
```

Firewall & routing

- Ensure Windows Firewall allows inbound connections on ports 3000 (Next) and 54321/54323 (Supabase) when testing from another device.
- If using a phone hotspot, confirm the phone and the machine are on the same subnet.

Example quick test flow

1. Start Supabase: `supabase start`
2. Create `.env.local` with `NEXT_PUBLIC_SUPABASE_URL=http://<HOST_IP>:54321` and the anon key
3. Start Next bound to `0.0.0.0`: `$env:HOST='0.0.0.0'; npm run dev`
4. Open `http://<HOST_IP>:3000` on the phone

Troubleshooting tips

- If the app can't reach Supabase from the phone, open Studio at `http://<HOST_IP>:54323` to confirm the API is reachable.
- After changing `supabase/config.toml`, restart the stack: `supabase stop && supabase start`.
- If data is missing, run `supabase db reset` to reseed the local DB.
- If you don't have the anon key, copy it from Studio → Settings → API.

Files of interest

- `supabase/config.toml` — local Supabase configuration (ports, seeds, studio, api_url)
- `supabase/seed.sql` — seed data loaded by `supabase db reset`
- `supabase/migrations/` — SQL migration files

Checklist for new contributors

- [ ] Docker Desktop running
- [ ] `supabase start` (or equivalent Docker compose)
- [ ] `supabase db push` (migrations) or `supabase db reset` (reset + seed)
- [ ] Create `.env.local` with NEXT_PUBLIC_SUPABASE_URL and anon key
- [ ] Start Next binding to 0.0.0.0 and test from phone

## Database migrations & seed

- The `sql/` directory contains schema and sample data. To apply schema changes to a running Supabase instance, use the Supabase UI or `psql` to run the SQL files, or use the Supabase CLI migration commands above.

## Testing from a phone (hotspot / LAN)

1. Connect your phone to the same network (Wi‑Fi or phone-hosted hotspot).
2. Ensure your machine's firewall allows inbound connections on ports 3000 (Next) and 54321 (local Supabase) or whatever your stack uses.
3. Use your machine IP (e.g. `192.168.1.100`) in both the phone's browser and in the `.env.local` `NEXT_PUBLIC_SUPABASE_URL` value, then restart the Next dev server if you changed envs.

Note: Browsers may block mixed-content if your site is served over HTTPS but Supabase is on HTTP. For local testing use HTTP consistently.

## Common commands

- Start dev server: `npm run dev`
- Build: `npm run build`
- Start production server: `npm run start`
- Lint: `npm run lint`

## Troubleshooting

- TypeScript/compile errors after edits:
  - Try a full rebuild: stop dev server, delete `.next` and run `npm run dev`.
- If the admin taskbar items are grayed out, confirm the admin permissions rows include the correct permission columns (some admin pages fetch specific permission columns).
- If images or icons don't load, confirm they exist in `public/` and the `Image` components use `unoptimized` or Next image config allows local files.

## Contributing

- Create a branch for your change: `git checkout -b feat/some-change`
- Make small commits and open a PR against `ui-fixes` (or the main branch as appropriate)

Suggested commit for this README:

```powershell
git add README.md
git commit -m "docs: merge developer guide into README"
git push -u origin ui-fixes
```

---

If you'd like, I can also:

- Add a `.env.example` to the repo with the two `NEXT_PUBLIC_*` lines (safe to commit without keys)
- Tidy the README to satisfy markdown-lint rules (headings, bare URLs)
