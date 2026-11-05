# Handover: design, security, risks and acceptance

## How it works

```
browser                                   server (Node.js, OpenShift)                PostgreSQL
public/assets/app.js  (the interface)     server/src/app.ts     routes, headers
  ▲ reads/saves "localStorage"            server/src/auth.ts    OIDC sign-in, sessions  ─▶ session
src/bridge/server-mode.ts ──HTTPS──────▶  server/src/state.ts   filter + merge          ─▶ doc_parts
  (only what changed, every save;         server/src/policy.ts  who may read/change     ─▶ change_log (append-only)
   polls for colleagues' changes / 20 s)
```

**The interface.** `public/assets/app.js` is the directory's interface, unchanged from the original site except for small adjustments for the shared version:
- no passwords in Users & access;
- save-status wording;
- accounts without passwords are accepted.

It still keeps its working copy as one document. `src/bridge/server-mode.ts` gives it that document from the server instead of the browser's storage. On every save, the bridge sends only what changed.

**Storage.** The document is stored split into **parts** (`src/shared/parts.ts`): employees, users, activity log, allowance records, parking allocations, ratings, notes, plans and so on.
- Record parts are merged record by record. Two people editing different employees both keep their changes.
- Editing a record someone changed since you opened it is refused with a clear message. Nothing is silently overwritten.

**Access control (`server/src/policy.ts`)** runs on the server for every read and every change:

| Account | Can read | Can change |
|---|---|---|
| Administrator (`ADMIN_EMAILS` or role admin) | everything | everything |
| Department manager | the directory; their own account; modules they have permission for; allowance and parking records only for their departments; ratings and notes only for their own team | employees in their departments (edit / add / delete per permission); the modules they have permission for, within their departments |
| Viewer | the directory without restricted fields (phone, date of birth, payroll, …); their own account | nothing except adding to the activity log and their own correction requests |
| Not in Users & access | nothing (`DEFAULT_ROLE=none`) | nothing |

More rules:
- Fields someone can't see are put back by the server when they save, so a save can never erase them.
- Allowance **amounts** are removed unless the account has "see amounts". Plate numbers are removed unless it has "manage parking".
- The activity log is append-only, and the server records who wrote each entry.
- The server's own `change_log` table can't be edited or deleted, even by the application's database user (a database trigger).

**Sign-in and sessions:**
- Sign-in uses the company identity provider: authorization code with PKCE, state and nonce.
- Sessions are stored in PostgreSQL. The cookie is `HttpOnly` and `SameSite=Lax`, `Secure` in production, and limited to the app path.
- Sessions end after 30 minutes idle or 10 hours at most.
- Signing out ends both the app session and the identity-provider session.
- Changes must come from the app's own pages: an Origin check plus the `X-DTD-Request` header.
- Every response has a strict Content-Security-Policy (scripts only from the app itself), `X-Frame-Options: DENY` and `nosniff`.

**Logs:** one JSON line per event on stdout. Users are identified by a one-way tag, never by email. Request bodies and data are never logged.

## What was tested here (not on your infrastructure)

| Area | Result |
|---|---|
| `npm ci`, `npm run check`, `npm run build`, `npm run build:test` | ✅ |
| Server tests against PostgreSQL 16 (10 tests, run 10× in a row) | ✅: sessions, cross-site refusal, unregistered accounts blocked, viewer filtering and refusal, manager department limits, hidden fields kept, record-level merge and conflicts, version checks, append-only history (database trigger), sign-out |
| Shared version in the browser, several users at once (24 checks) | ✅: deep link kept through sign-in, adding accounts without passwords, a viewer sees an administrator's change, restricted fields hidden, admin pages blocked, an open page picks up a colleague's change within ~20 s, conflict reported and the first save kept, direct out-of-scope request refused (403), sign-out ends the session, unregistered account sees a clear message, no JS errors, no CSP violations |
| Company sign-in against a local OpenID Connect provider (`oidc-provider`, 10 checks) | ✅: PKCE / state / nonce, landing on the requested page, ADMIN_EMAILS administrator, cookie flags, sign-out through the provider ends both sessions |
| Standalone version (all pages, both languages, phone and desktop, dark mode, accessibility rules) | ✅ 145 checks |
| Backup from the current site → database → export | ✅ identical employees and allowance records |
| Container image | ✅ The runtime image (Red Hat UBI Node.js 22) was built and run as an arbitrary UID, the way OpenShift runs it. `/healthz` and `/readyz` answer; production mode refuses dev sign-in and non-https addresses; the multi-user browser suite passes against the container. ⚠️ The Dockerfile's `npm ci` step couldn't reach the npm registry from this sandbox, so the full two-stage build runs for the first time in your CI. |

**Not verified here** (needs your environment):
- your Entra ID / ADFS tenant and its claims;
- your OpenShift cluster: Route, network policies, pull secrets, SCC;
- your managed PostgreSQL: TLS, backups;
- GitLab runners and registry;
- Edge, Firefox and Safari;
- screen readers;
- load beyond a few concurrent users;
- usability testing with employees.

## Known limits and risks

| # | Severity | Item | Mitigation |
|---|---|---|---|
| R1 | High (maintainability) | `public/assets/app.js` is a large pre-built file (about 5,800 lines, partly minified) that is maintained by direct edits. The original source project isn't available. | Keep changes small and covered by the browser tests. Plan a rewrite of the interface into `src/` module by module if the app becomes long-lived. |
| R2 | Medium | Field-level validation (formats, required fields) runs in the browser. The server enforces **who** may change **what**, but not the format of each value. | Add server-side validation for the employee fields that matter most (e.g. employee number format) once the business rules are agreed. |
| R3 | Medium | Vacancies, continuity, recognition studio and development plans are limited by permission, but not by department on the server. | Add department scoping for these modules in `policy.ts` if managers should only see their own departments there. |
| R4 | Medium | Each part is one database row. Very busy editing of the same part (hundreds of saves a minute) would queue on that row. | Fine for a directory of this size. If it grows a lot, move employees to their own table. |
| R5 | Low | Colleagues' changes arrive by polling every 20 seconds, not instantly. | Acceptable for a directory. Server-sent events could replace polling later. |
| R6 | Low | Profile photos are stored inside the employee data (as data URLs). | Keep photos small. Move them to object storage later if needed. |
| R7 | Low | No rate limiting on the API (sign-in is rate-limited by the identity provider). | Add an OpenShift Route rate limit or a reverse proxy rule if required. |

## Acceptance criteria for staging

1. An employee in `ADMIN_EMAILS` signs in with their company account and lands on the page they opened.
2. The administrator adds a viewer and a department manager in Users & access, using their sign-in emails.
3. The viewer sees the directory without restricted fields and can't open admin pages. A direct API call to change data returns 403.
4. The manager edits an employee in their department (saved, visible to the viewer within ~20 s) and can't edit one outside it.
5. Two people edit the same employee: the second sees the conflict message, and the first change is kept.
6. Sign-out returns to the company sign-out page, and the directory then asks for sign-in again.
7. A real backup from the current site loads with `db:seed --file` and shows the same employees.
8. `oc rollout undo` returns to the previous version without data loss. Migrations only add, never remove.
9. The database backup and restore procedure (IT's) is tested once.

## Rollback

- **Application:** `oc rollout undo deployment/employee-directory`, or redeploy an earlier image tag from the GitLab registry.
- **Data:** use the managed database's point-in-time restore. Or, for a single workspace: `db:export` before risky changes, then `db:seed --file <export> --replace --yes`.
- Migrations are forward-only and additive. A rollback of the app doesn't need a schema rollback.

## Troubleshooting

| Symptom | Likely cause | Check |
|---|---|---|
| Pod restarts at start | configuration problem | `oc logs`: the server prints each problem (missing `DATABASE_URL`, short `SESSION_SECRET`, `AUTH_MODE=dev` in production, …) |
| Readiness fails | database unreachable | network policy, `DATABASE_URL`, `DATABASE_SSL` |
| Sign-in loops back to the provider | wrong `PUBLIC_URL`, `BASE_PATH` or redirect URI; cookies not `Secure` behind HTTPS | `PUBLIC_URL` must match the Route host exactly; `TRUST_PROXY=1` |
| "Your sign-in did not include an email address" | provider doesn't send the email claim | set `OIDC_EMAIL_CLAIM` (Entra: `preferred_username`) |
| "Your account hasn't been added" | user isn't in Users & access | an administrator adds them with their sign-in email |
| Changes don't appear for others | browser offline or session expired | the save chip in the top bar shows "Not saved"; sign in again |
