# Employee directory: notes for contributors and coding assistants

- **Data and privacy:** this app handles HR data. Use only the fictional data in `tools/sample-data.json` for development and tests. Never commit `.env`, backups or exports (`.gitignore` covers them).
- **Access control lives in `server/src/policy.ts`.** Any new module that stores data needs a policy entry. Without one, a part is administrator-only, which is safe but probably not what you want. Hiding a button in the interface is not access control.
- **Data shape:** the interface works on one document. `src/shared/parts.ts` says how it is split into stored parts. Add new record lists to `RECORD_PARTS` so they merge record by record.
- **The interface (`public/assets/app.js`)** is a pre-built file edited directly. Keep edits small and guarded with `__SRV()` when behaviour differs between the shared and standalone versions. Run the browser tests after every change.
- **Before pushing:** `npm run check`, `npm run test:server`, `npm run build:test && npm run test:e2e`, and `npm run test:e2e:server` (needs a throwaway PostgreSQL; the tests wipe it).
- **Migrations:** add a new numbered file in `server/migrations/` (`002_….sql`). Never edit an applied one. Changes must be additive so a rollback of the app keeps working.
- **Configuration** comes only from environment variables (see `.env.example`). No company URLs, tenant IDs or secrets in code.
- **Deployment** is manual and disabled until IT enables it (`docs/IT-SETUP.md`). Don't enable it from code.
