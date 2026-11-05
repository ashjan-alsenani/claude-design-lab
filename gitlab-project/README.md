# Digital & Technology Employee Directory

Employee directory, organisation, development, recognition, technical allowances and parking for the Digital & Technology function.

**Stack:**
- web app: Vite + TypeScript;
- server: Node.js 22 + Express + TypeScript;
- database: PostgreSQL;
- sign-in: the company identity provider (OpenID Connect, e.g. Microsoft Entra ID);
- hosting: OpenShift.

Data is shared by everyone and stored on the server. Every read and every change is checked against the person's role and permissions on the server.

```
src/           web app entry and the bridge to the server (TypeScript)
public/        the directory's interface (assets/app.js, styles, fonts, icons), copied as-is into the build
server/        API server: sign-in, permissions (src/policy.ts), data (src/state.ts), migrations/
tools/         db.ts (migrate, seed, import a backup, export), check.mjs, sample-data.json (fictional)
tests/         server tests, browser tests (standalone and shared versions, company sign-in)
openshift/     Deployment, Service, Route, ConfigMap, NetworkPolicy, example Secret, optional test database
docs/          IT-SETUP.md (what IT configures), HANDOVER.md (design, security, risks, acceptance criteria)
Dockerfile     image for OpenShift (Red Hat UBI Node.js, non-root)
```

Build output is not committed: `dist/` (web app), `dist-test/` (standalone build for tests), `server-dist/` (compiled server), `test-output/`.

## 1. Run it locally

You need **Node.js 22** and **PostgreSQL 14+**.

```bash
npm ci
cp .env.example .env               # then edit DATABASE_URL and SESSION_SECRET
createdb directory                 # or any empty database
npm run build                      # web app + server
npm start                          # http://127.0.0.1:8080/employee-directory/
```

With `AUTH_MODE=dev` (the default in `.env.example`) you sign in by typing any email. Use `admin@example.com`, or whatever is in `ADMIN_EMAILS`. `INITIAL_DATA=sample` starts an empty database with fictional data.

While developing, run `npm run dev:server` (restarts on changes) and `npm run dev` (web app with hot reload on port 5173).

**Checks and tests:**

```bash
npm run check                                                        # type checks + static checks
TEST_DATABASE_URL=postgres://…/directory_test npm run test:server    # server tests (database is wiped)
npx playwright install chromium                                      # once, for browser tests
npm run build:test && npm run test:e2e                               # standalone version, ~130 checks
E2E_DATABASE_URL=postgres://…/directory_e2e npm run test:e2e:server  # shared version + company sign-in
```

## 2. Upload to GitLab

Unzip into your project folder. If the folder holds the previous version, delete its old `scripts/`, `deploy/`, `src/`, `tests/` and `docs/` first; this version replaces them. Then:

```bash
git init -b main                 # skip if the folder is already a repository
git add .
git commit -m "Employee directory with server, database and company sign-in"
git remote add origin https://gitlab.<company>/<group>/employee-directory.git
git push -u origin main
```

`.gitignore` keeps `.env`, `node_modules/`, build output and data exports out of the repository. The pipeline (`.gitlab-ci.yml`) runs:
- `check`;
- `tests` (server and browser tests against a throwaway PostgreSQL);
- `image` (builds the container and pushes it to the project's registry).

## 3. Deploy to OpenShift

Production deployment is **off** until IT sets it up: see **[docs/IT-SETUP.md](docs/IT-SETUP.md)**. In short:

1. Register the app with the identity provider. The redirect URI is `https://<host>/employee-directory/auth/callback`.
2. Provide a PostgreSQL database and create the Secret:
   ```bash
   oc create secret generic employee-directory-secrets \
     --from-literal=DATABASE_URL='postgres://USER:PASSWORD@HOST:5432/DB' \
     --from-literal=SESSION_SECRET="$(openssl rand -hex 32)" \
     --from-literal=OIDC_CLIENT_SECRET='…'
   ```
3. Fill in `openshift/configmap.yaml` (host, tenant, client ID, first administrator) and `openshift/route.yaml` (host).
4. In GitLab, set `DEPLOY_ENABLED=true` and the `OPENSHIFT_*` variables. Then start the **deploy-openshift** job by hand. Or run `oc apply -k openshift/` yourself after setting the image in `openshift/kustomization.yaml`.

The server applies database migrations on start (safe with several replicas).

**To roll back:** `oc rollout undo deployment/employee-directory`. Or redeploy an earlier image tag.

## 4. Moving data from the current site

The current site keeps its data **in each user's browser**. Nothing moves automatically.

1. On the current site, open the **data menu** in the top bar (the button that says "Sample data", or your data's name) and choose **Download a backup**. Use the browser of the person who holds the real data.
2. Load it into the new database, from a machine that can reach it:
   ```bash
   DATABASE_URL=postgres://… npm run db:seed -- --file employee-directory-backup-….json
   ```
   This only loads into an empty database. To overwrite, add `--replace --yes`; the replacement is recorded in the change history.
3. Accounts: the old site's usernames and passwords don't carry over. People sign in with their company account. In **Users & access**, change each account's username to the email they sign in with. Anyone listed in `ADMIN_EMAILS` is added as an administrator automatically.

Profile photos and the logo are inside the backup file; there are no separate upload folders. Treat backup files as confidential HR records.

For a copy of the server data, use `npm run db:export -- --out file.json`. The file is in the same format and can be loaded back with `db:seed --file`.
