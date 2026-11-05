# Employee Directory: audit and handover

**Status: not ready for multi-user production.**
This is a polished, single-browser prototype that works fully offline with fictional sample data. Three blockers (B1–B3 below) need a server-side component and your organization's decisions before employees can rely on it.

This document records what was checked in the build environment and what must be repeated in your organization's environment. It does not claim the site is free of defects.

---

## 1. What the site is

**Purpose.** An internal employee directory for the Digital & Technology function. People use it to:

- find colleagues;
- see the organisation structure;
- follow up on skills, development plans, succession and vacancies;
- manage recognition, occasions, technical allowances and parking allocation.

**Intended users and roles.** Roles are configured in *Data management → Users & access*:

| Role | Can do (as implemented in the browser) |
|---|---|
| Owner / Administrator | Everything: add, edit and delete employees, import, manage users, all modules. |
| Department manager | Sees only the departments selected for the account. Has granular permissions (edit, add, delete, sensitive fields, recognition, allowances, parking, vacancies, criticality, plans, succession, continuity, report, Excel). An optional "My team only" mode limits the account to the manager's own staff. |
| Viewer | Read-only. Restricted fields (for example phone, date of birth, payroll code) are hidden. Admin pages show "This page isn't available to your account". |

**Main journeys.**

1. Sign in, then land on Home (role-specific greeting, key figures, needs-action list).
2. Search the directory, filter it, open a profile, then go Back with the search and filters kept.
3. Add or edit an employee. The form validates input and warns about unsaved changes before you leave. Saving records an entry in the activity log.
4. Import employees from Excel: preview, then commit. The import is recorded as a batch.
5. Request a data correction (employee), then review and apply it (administrator).
6. Rate my team: a manager rates each team member monthly and writes notes.
7. Manage technical allowances (eligibility rules, register, analytics) and parking (spaces, allocations, waiting list, rules).
8. Generate the monthly report, then print or save it as PDF.
9. Back up and restore data (Data management).

---

## 2. Architecture

| Part | Detail |
|---|---|
| Type | Static single-page app in `src/`: `index.html`, `assets/app.js` (about 1.5 MB, 5,800 lines), `assets/styles.css`, `assets/boot.js`, fonts, icons, tour images. |
| Build | `scripts/build.mjs` copies `src/` to `dist/`, generates `config.js` from environment settings, and stamps the offline-cache id. There's no compile step: `app.js` is a pre-built bundle that is edited directly, and the project it was originally compiled from isn't available (see risk R1). |
| Routing | Hash routes (`#/directory`, `#/employee/6`, …). |
| "API" | `window.fetch` is intercepted. Calls to `/api/...` (auth, employees, users, import, audit, settings, meta) are answered inside the browser. |
| Data | One JSON document in `localStorage` key `dtd-review-v5` (employees, users, audit log, import batches, parking, allowances, vacancies, settings). About 110 code paths write that document directly, so not everything goes through the `/api` layer. |
| Settings | `config.js` (generated): owner account, owner display name, footer credit. See `.env.example`. |
| Session | `sessionStorage` flag plus user id. Ends when the tab closes. There is an automatic sign-out after 30 minutes of inactivity, with a warning 2 minutes before. |
| Offline | `sw.js` service worker: network-first, falling back to cache. It only registers on `http(s)`. |
| External requests at runtime | **None.** No CDNs, analytics, web fonts, AI services or third-party APIs. This was verified by loading every page with request logging. |

### External dependencies

| Dependency | Used for | Essential? | Approval needed? | If unavailable |
|---|---|---|---|---|
| Carlito and Noto Sans Arabic fonts, bundled in `assets/fonts/` (SIL OFL, licences included) | Text | Yes (falls back to system fonts) | Licence review only | Text renders in system fonts. |
| Browser `localStorage` | All data | Yes, in the current design | Check your browser policy: some organizations clear storage on exit | **All data is lost** if the profile is cleared (see B1). |
| User's email client (`mailto:` links) | "Send to confirm", occasion emails | No | No | The mail client doesn't open; nothing else is affected. |
| Playwright 1.63.0 and axe-core 4.10.2 (`tests/` only) | Automated checks | Development only | Only if tests run inside your network | Nothing; they aren't shipped to users. |

No secrets, API keys, development URLs or links back to an AI builder exist in the source. The owner account and footer credit, previously hard-coded, now come from environment settings. `npm run check` fails if a private key, an access token or a 64-character hash is committed.

---

## 3. Blockers before employees rely on it

| # | Severity | Issue | Why it matters | What resolves it |
|---|---|---|---|---|
| **B1** | Critical | **Data isn't shared.** Each browser profile has its own copy, so employee A's edits are invisible to employee B. Clearing browser data deletes everything. | The directory can't be a source of truth for more than one person on one device. | A server-side database with an API. The in-browser `/api` layer is a ready seam: implement the same endpoints on a server and remove the interceptor. Modules that write the document directly (parking, allowances, vacancies, studio, recognition) need to move onto API calls, or the whole document needs to be stored server-side with version checks. |
| **B2** | Critical | **Access control runs only in the browser.** Roles, department scopes and hidden fields are enforced by JavaScript. Anyone using the browser can read the full dataset, including restricted fields and password hashes, from developer tools, and can change it. | Hiding a button or field isn't access control. Confidential HR data (date of birth, payroll code, allowance amounts) is exposed to every account on that device. | Server-side authentication (ideally your organization's SSO), plus server-side authorization on every endpoint. The server returns only fields and records the role allows, and exports are generated or filtered server-side. |
| **B3** | High | **Credentials are handled in the browser.** The owner account's unsalted SHA-256 password hash is delivered to the browser in `config.js` (set by `OWNER_PASSWORD_SHA256`). Other accounts use one round of salted SHA-256 stored in `localStorage`. The lockout after failed attempts can be bypassed. | The owner hash can be attacked offline, and fast hashes are weak for passwords. | Replace with SSO or a server-side identity provider, and remove the embedded owner account. If local accounts must stay, use a slow password hash (Argon2id or bcrypt) on the server, with server-side rate limiting. |

### Other risks

| # | Severity | Risk | Mitigation |
|---|---|---|---|
| R1 | High (maintainability) | No original source project or build: `app.js` is a large, partly minified bundle maintained by direct edits. | Before long-term ownership, rebuild the front end as a maintained source project, or accept the bundle as-is with the browser test suite as the safety net. |
| R2 | Medium | Storage quota is about 5 MB per site, and profile photos are stored as data URLs. A "storage full" error is shown and the save is refused (nothing is silently lost), but the limit is reachable. | Moving to a server (B1) resolves it. Until then, keep photos small. |
| R3 | Medium | Concurrent edits: within one browser, tabs now reload each other's saves (fixed in this pass). Across devices there is no sync at all (B1). A server must add record versions to detect conflicting edits. | Server-side `updated_at` or `ETag` checks; return HTTP 409 on conflict and show a "this record changed" message. |
| R4 | Medium | "Report an error" and correction requests are stored in the same browser, so the administrator only sees them on that device. | Works once B1 is resolved. Until then, treat it as demonstration only. |
| R5 | Low | Tested in Chromium only. | Repeat the staging checks in your organization's supported browsers (Edge, Chrome, Firefox or Safari as applicable). |
| R6 | Low | Inline styles are used throughout the app. | The CSP in `deploy/nginx.conf` allows `'unsafe-inline'` for styles only. Scripts are limited to `'self'`: the inline scripts were moved into files. |

---

## 4. Demonstration features and simulated behaviour

These are presented in the app, but don't work as multi-user features yet:

- **Sign-in and user accounts:** real in the browser, local only (B2, B3).
- **The `/api` layer:** simulated inside the browser.
- **Correction requests and "Report an error":** stored locally (R4).
- **Notifications (bell):** calculated from the local data; nothing is sent to anyone.
- **"Send to confirm" and occasion emails:** open the user's own mail client with a pre-filled message. Nothing is sent automatically.
- **Sample data:** all 25 employees and every allowance, parking and vacancy record are fictional. The top bar shows "Sample data" until real data is imported, and printouts say "sample data" too.

---

## 5. Hosting compatibility (checked here)

| Check | Result here | Repeat in your environment |
|---|---|---|
| Served from a subfolder (`/employee-directory/`) | Works: all paths are relative. | Yes, at the real path. |
| Direct links and page refresh (`#/employee/6`) | Work without server rewrite rules (hash routing). | Yes |
| Opening a link in a new tab | Works. You need to sign in again because the session is per tab. | Yes |
| Back and Forward | Work. Scroll position is restored on Back; the search query and filters are kept. | Yes |
| Unknown page or missing record | Clear "Page not found" / "Employee not found" pages with a way back. | No |
| Offline (service worker) | Requires HTTPS, or `localhost`. | Yes: confirm HTTPS and that service workers are allowed. |
| Opening `index.html` from a file share | Works. The service worker doesn't register. | Optional |

**Static hosting needs:** any web server (IIS, nginx, Apache, SharePoint static hosting if allowed). No server language or database is needed *for the prototype*. Recommended headers:

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: same-origin`
- `X-Frame-Options: DENY`
- a CSP (see R6)
- `Cache-Control: no-cache` for HTML, JavaScript and CSS, so updates arrive

All of these are already set in `deploy/nginx.conf` and in the local server (`scripts/serve.mjs`).

---

## 6. Deploying (static prototype)

1. Set the owner settings (`OWNER_USERNAME`, `OWNER_PASSWORD_SHA256`) as protected CI/CD variables. Then run the pipeline, or run `npm run build` locally.
2. Publish `dist/` (or the container image). The offline-cache id changes automatically on every build.
3. To change the owner password, generate a new hash and rebuild. Choose a password that isn't used anywhere else.
4. Real data: use *Data management → Import* with your Excel template. **Don't import real employee data until B1–B3 are resolved and your data-protection officer approves.**

**Rollback.** Redeploy the previous pipeline's `dist/` artifact or image tag. A new build id makes browsers drop the newer cached files; if you republish an old artifact unchanged, rebuild it from the old commit so it gets a fresh id. Data in `localStorage` isn't touched by deploys. If a release changes the data format, users restore from the backup file they downloaded before the release (top-bar data menu → Restore from a backup).

**Backup and restore (current design).** Each user downloads a JSON backup from the top-bar data menu (Download a backup). Restoring replaces that browser's data. There is no central backup until B1 is resolved.

### Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| An old version still shows after a deploy | Service worker cache, or `index.html`/`sw.js` served with long caching | Check the `no-cache` headers. As a user: hard refresh, or clear site data. |
| "Storage is full" message | `localStorage` quota (R2) | Remove large photos, or move to a server. |
| Data disappeared | Browser profile cleared, private window, a different browser or device, or a **new site address** | Restore from the backup file. Long term: B1. |
| Owner can't sign in | `OWNER_USERNAME` / `OWNER_PASSWORD_SHA256` not set at build time, or the hash was made from a different password | The build prints a warning; set the variables and rebuild. |
| Signed out unexpectedly | 30-minute inactivity sign-out, or the tab was closed | Sign in again. A warning appears 2 minutes before. |
| "This page isn't available to your account" | The role or permissions don't include the page | An administrator adjusts the account in Users & access. |

---

## 7. Migration checklist (to a real multi-user service)

Decisions needed from you are marked ❓.

- [ ] ❓ Hosting target (IIS or another intranet server, cloud tenant, SharePoint) and URL path.
- [ ] ❓ Authentication: organization SSO (Entra ID / Azure AD, ADFS, Okta…) or local accounts.
- [ ] ❓ Database and API platform approved by IT, and who operates it.
- [ ] ❓ Which roles exist in practice, and who approves access.
- [ ] ❓ Data classification for HR fields (date of birth, payroll code, allowance amounts) and retention rules.
- [ ] ❓ Supported browsers and devices.
- [ ] ❓ Expected number of users and concurrent editors.
- [ ] Implement the server API matching the in-browser endpoints. Move direct-write modules onto it. Add record versions (R3).
- [ ] Enforce authorization and field filtering on the server, including for exports.
- [ ] Remove the embedded owner account and the in-browser auth (B3).
- [ ] Keep the server audit log append-only; only administrators can read it.
- [ ] Set up central backups with a tested restore.
- [ ] Log errors without personal data.
- [ ] Run the staging plan below, then the acceptance criteria.
- [ ] Get approval from the data owner and from IT security before go-live.

## 8. Staging validation plan

Run on the staging URL in each supported browser, with two test accounts per role. Use fictional data only.

1. `npm ci && npx playwright install chromium && BASE_URL=https://staging.example/employee-directory/ npm test`. Expect "ALL FILES PASSED".
   - **The tests sign in by setting the session flag directly, so they only work against the prototype.** After B2 they need a test sign-in step.
2. Manually: sign in and out; direct link to a profile while signed out (sign-in appears); refresh on several pages; Back and Forward from a profile to the directory (filters and scroll kept).
3. Permissions: a viewer opens an admin page by URL and sees "not available". **After B2, also call the API directly as a viewer and confirm HTTP 403 and that restricted fields are absent.**
4. Two users on two devices edit different records, then the same record. Confirm both changes persist, or that a conflict is reported (needs B1 and R3).
5. Print the monthly report and a profile. Confirm the print date, the user and the "sample data" or real-data marking.
6. Keyboard only: skip link; Tab through the navigation; open and close a dialog with Esc (focus returns to the button that opened it).
7. 200% zoom, and a 320 px wide window: no sideways scrolling.

## 9. Acceptance criteria (main employee workflows)

| # | Workflow | Accepted when | Verified here? |
|---|---|---|---|
| A1 | Sign in | A wrong password shows a clear message and focus returns to the field; repeated failures lock for 60 s; sign-out returns to the sign-in page and Back doesn't reveal data. | ✅ in the browser (local auth) |
| A2 | Find a colleague | Search by name returns matches; opening a profile and pressing Back keeps the query, filters and scroll position. | ✅ |
| A3 | Edit an employee | Required fields are validated; leaving with unsaved changes asks first; Cancel keeps your input; Save shows "Changes saved" and records an activity-log entry. Clicking Save three times saves once. An empty required field shows an error summary that receives focus, and the field is marked invalid. | ✅ |
| A4 | Two tabs open | Saving in one tab doesn't erase changes saved in another. The other tab refreshes, or warns if it has unsaved edits. | ✅ fixed in this pass (single browser only) |
| A5 | Role limits | A viewer can't open admin pages and sees no edit actions. **On a server, the API refuses the request.** | ⚠️ browser only; server check pending (B2) |
| A6 | Report | The monthly report prints with the date, period and data marking; every page prints without buttons and with a printed-on line. | ✅ |
| A7 | Shared data | User A's change is visible to user B on another device. | ❌ not possible yet (B1) |
| A8 | Accessibility | No automated axe violations (WCAG 2 A/AA rules) on any page, in both languages, desktop and phone, light and dark; keyboard and dialog focus work. | ✅ automated, plus manual keyboard checks |

## 10. Employee usability test (prepared, **not yet run**)

Recruit 5–6 people who represent your roles (2 managers, 2 HR or administrators, 2 regular employees). Use staging and fictional data, and don't coach them. Record whether they completed each task, the time taken, errors and hesitations.

1. "Find the phone number of the manager of Digital IT Infrastructure."
2. "A colleague's job title is wrong. Report it."
3. (Manager) "Rate your team for this month and add a note for one person."
4. (HR) "Add a new employee who starts next Sunday."
5. (HR) "Which employees receive an allowance they aren't entitled to?"
6. "Print this month's report as PDF."
7. "Who has a parking space but no longer qualifies for one?"

Ask afterwards: what was confusing, what they expected to find but didn't, and which page they would use most often.

---

## 11. What was tested

**Portable project, tested from a clean folder** (unzipped into an empty directory, Node.js 22.23):

| Step | Result |
|---|---|
| `npm ci` | ✅ 3 packages (test tools only) |
| `npm run hash-password`, then `.env` with a test owner | ✅ |
| `npm run build:single` | ✅ `dist/` (5.7 MB) and `dist-single/employee-directory.html` (6.7 MB) |
| `npm run check` | ✅ syntax, offline-cache list, no external URLs, no committed secrets |
| A build without owner settings and `REQUIRE_OWNER=true` | ✅ fails, as intended |
| `npm start`, then `npm test` (the local server, with the same security headers as nginx) | ✅ 9 test files, 152 checks |
| `docker build -f deploy/Dockerfile`, then run it and `npm test` against the container | ✅ 9 test files, 152 checks. `/healthz` returns 200. Redirects are relative. `no-cache` on html/js/css. The CSP is sent and nothing on the 38 pages violates it. |
| Owner sign-in from settings; wrong password refused; "Export the site with my data", then sign in to the exported file | ✅ |
| Data transfer: backup on the old site, restore on the new site; the changed record appears | ✅ |
| `git init`: `.env`, `node_modules/`, `dist/` and test screenshots are ignored | ✅ |
| `.gitlab-ci.yml` is valid YAML; deploy job is manual and disabled by default | ✅ parsed only |

**Not run here (needs your company environment):**

- The GitLab pipeline on your runners.
- The Kaniko image push to your registry.
- `deploy/deploy.sh` (intentionally empty).
- HTTPS, and the service worker over HTTPS.
- Your sign-in gateway, proxy or WAF.
- Edge, Firefox and Safari.
- Real screen readers and real phones.

**Earlier audit** (same browser engine):

- **Sizes:** 320, 390, 640, 768, 1024 and 1440 px wide.
- **Other conditions:** Arabic RTL and English LTR, light and dark mode, reduced motion, print.
- **Journeys:**
  - sign in (wrong password, lockout), sign out and Back, deep links while signed out, refresh;
  - Back and Forward with scroll and filters;
  - unsaved-changes prompts, dialog focus;
  - two-tab editing;
  - viewer and department-manager accounts;
  - idle-sign-out warning;
  - printing.
- **Automated:** axe-core WCAG 2 A/AA rules on every page.
