# Backups and disaster recovery

| Asset | Primary | Backup | Restore |
|---|---|---|---|
| Source code | GitHub | Every clone; Vercel keeps deployed builds | Re-clone / redeploy |
| Database | Supabase | Daily automatic backups (Pro plan); weekly `pg_dump` export to private storage (to automate) | Supabase restore or `psql` import |
| Paid files & media | Supabase Storage | Weekly sync to a second private bucket/provider (to automate) | Re-upload script |
| Configuration | Hosting env vars | Documented names in `.env.example`; values in owner's password manager | Re-enter values |
| Brand assets | `public/brand` in Git | Regenerate with `scripts/build-brand.mjs` | Run scripts |

Targets: lose at most 24 h of data (RPO), back online within 4 h (RTO).
One Click Digital Hub does not depend on any single laptop: everything needed lives in GitHub + the hosting
and database providers. Test a restore once before launch and every quarter after.
