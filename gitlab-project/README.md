# Employee Directory (Digital & Technology)

A static web app (plain HTML, CSS and JavaScript, no framework and no backend) for the employee directory, organisation structure, development, recognition, technical allowances and parking. It ships with **fictional sample data**.

> **Read [docs/HANDOVER.md](docs/HANDOVER.md) before using real data.** Data is stored in each user's browser, and permissions are enforced only in the browser. Both need a server before employees can rely on the site.

```
src/            the site itself; edit these files directly (no compile step)
  index.html, sw.js, manifest.webmanifest
  assets/app.js      application code
  assets/styles.css  styles
  assets/boot.js     language/theme before first paint
  assets/fonts, icons, tour
scripts/        build, local server, checks, password hashing (Node.js, no dependencies)
tests/          browser checks (Playwright + axe-core)
deploy/         Dockerfile, nginx.conf, deploy.sh (production step, disabled by default)
docs/           HANDOVER.md (readiness, risks, acceptance criteria), IT-SETUP.md (what IT must configure)
```

## 1. Run it locally

You need Node.js 20 or newer.

```bash
npm ci                      # installs the test tools only; the site has no runtime dependencies
cp .env.example .env        # optional: owner account and footer
npm run hash-password       # type the owner password; copy the output into OWNER_PASSWORD_SHA256 in .env
npm start                   # builds dist/ and serves it at http://127.0.0.1:8080/employee-directory/
```

Without owner settings the site still opens, but nobody can sign in as the administrator.

Other commands:

| Command | What it does |
|---|---|
| `npm run build` | Writes `dist/` (deployable files). `config.js` is generated from `.env` or the environment. |
| `npm run build:single` | Also writes `dist-single/employee-directory.html`, one file that opens straight from disk. |
| `npm run check` | Syntax, offline-cache list, external URLs, accidental secrets. |
| `npm test` | Browser checks against a running server (`npm start` in another terminal first). The first time, run `npx playwright install chromium` to download the test browser. |

To run the owner sign-in checks too, set `TEST_OWNER_USERNAME` and `TEST_OWNER_PASSWORD` to the values the site was built with.

## 2. Upload to GitLab

```bash
git init -b main
git add .
git commit -m "Employee directory"
git remote add origin https://gitlab.<your-company>/<group>/employee-directory.git
git push -u origin main
```

`.gitignore` keeps `.env`, `node_modules/`, `dist/` and test output out of the repository. The pipeline (`.gitlab-ci.yml`) runs `check`, `build` and `browser-tests` on every push.

## 3. Deploy

Deployment is **off** until IT configures it (see [docs/IT-SETUP.md](docs/IT-SETUP.md)). There are two ways to publish:

- **Static files:** publish the `dist/` artifact from the `build` job to any web server under `BASE_PATH` (default `/employee-directory/`). The page uses relative links, so any subfolder works and no rewrite rules are needed. Send `Cache-Control: no-cache` for HTML, JavaScript and CSS, and the security headers in `deploy/nginx.conf`.
- **Container:** set `BUILD_IMAGE=true` to build `deploy/Dockerfile` (non-root nginx on port 8080, health check at `/healthz`) into the project's container registry. Then run it on your cloud platform.

Then set `DEPLOY_ENABLED=true`, fill in `deploy/deploy.sh`, and start the **deploy-production** job by hand.

Each build gets a new offline-cache id, so users get the new version on their next visit. **To roll back,** redeploy the previous pipeline's artifact or image tag.

## 4. Moving existing data

The live copy keeps its data **in each user's browser** (`localStorage`), not on a server. A new address starts empty because browsers keep data per address. Nothing is transferred automatically, and this project contains only sample data.

To move one person's data:

1. On the old site: open the **data menu** in the top bar (the button that says "Sample data", or the name of your data) and choose **Download a backup**. This saves a JSON file. Do this for each browser that holds data you need.
2. On the new site: sign in as the owner, open the same data menu, choose **Restore from a backup**, and pick that file. Restoring replaces the data in that browser.

Treat backup files as confidential HR records. Transfer them only through a channel your organization approves. Uploaded profile photos and logos are inside the backup file; there are no separate upload folders.
