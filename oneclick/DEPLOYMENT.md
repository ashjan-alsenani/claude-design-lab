# Deployment

Status: **BUILT LOCALLY**. Not deployed (hosting account approval pending, see OWNER_ACTIONS.md).

## Local development
```bash
cd oneclick
npm install
cp .env.example .env.local      # optional; defaults work for development
npm run dev                     # http://localhost:3000 (redirects to /en or /ar)
```
Demo mode is on in development: `/en/account/dashboard` and `/en/admin` show sample data.

## Checks before any deploy
```bash
npm run lint        # TypeScript type check
npm test            # unit tests (Vitest)
npm run test:e2e    # browser tests (Playwright, desktop + mobile, EN + AR)
npm run build       # production build
```

## Vercel (planned)
1. Import the GitHub repo, set **Root Directory = `oneclick`**, framework Next.js.
2. Environment variables (Production + Preview): `NEXT_PUBLIC_SITE_URL`, Supabase keys,
   `PAYMENT_PROVIDER=none` until the bank gateway is ready, email provider keys.
3. Preview deployments per branch; production only from `main` after owner authorization.
4. Domain: add the approved domain; Vercel issues HTTPS automatically.

## Supabase (planned)
1. Create project in a region close to the GCC (e.g. `ap-south-1` Mumbai or `eu-central-1`
   Frankfurt; confirm data-residency advice from OMAN_LAUNCH_CHECKLIST.md §3).
2. Apply `supabase/migrations/*.sql` in order (Supabase CLI `supabase db push` or MCP).
3. Create storage buckets: `public-media` (public) and `paid-files` (private).
4. Seed catalog from `src/content` (seed script to be written when the project exists).
5. Grant the owner's user the `owner` role in `user_roles`.

## Brand assets
`node scripts/build-brand.mjs && node scripts/render-brand-png.mjs` regenerates all logo SVG/PNG files.

## Rollback
Vercel keeps every deployment; promote the previous one from the dashboard. Database changes
are forward-only migrations; take a backup before applying (see docs/BACKUPS.md).
