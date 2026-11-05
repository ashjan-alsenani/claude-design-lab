# What IT still needs to configure

The project builds, checks and tests itself in GitLab without any settings. Production deployment stays off until the items below are done.

## 1. GitLab CI/CD variables (Settings → CI/CD → Variables)

| Variable | Protected / masked | Value |
|---|---|---|
| `OWNER_USERNAME` | protected | The owner's sign-in name (for example an employee ID). |
| `OWNER_PASSWORD_SHA256` | protected, masked | Output of `npm run hash-password` for a long password (12+ characters). |
| `OWNER_DISPLAY_NAME` | protected | Name shown for the owner. |
| `OWNER_LOGIN_ALIASES` | protected | Optional extra sign-in names, comma-separated. |
| `CREDIT_NAME`, `CREDIT_TEAM` | — | Optional footer credit. Leave unset to hide it. |
| `BASE_PATH` | — | URL path the site is served under. Default `/employee-directory/`. |
| `PRODUCTION_URL` | — | Public URL, shown in GitLab's environment page. |
| `BUILD_IMAGE` | — | `true` to build the container image into the project registry. |
| `DEPLOY_ENABLED` | protected | `true` only once everything below is ready. |
| `DEPLOY_METHOD` and that method's settings | protected | `static-copy`, `kubernetes` or `custom`; see `deploy/deploy.sh`. |

## 2. Runner and images

- A GitLab runner with the Docker executor.
- Access to these images, or internal mirrors set through `NODE_IMAGE`, `PLAYWRIGHT_IMAGE`, `NGINX_IMAGE` and `KANIKO_IMAGE`:
  - `node:22-bookworm-slim`
  - `mcr.microsoft.com/playwright:v1.63.0-noble`
  - `nginxinc/nginx-unprivileged:1.27-alpine`
  - `gcr.io/kaniko-project/executor:v1.23.2-debug`
- Access to the npm registry (or an internal mirror) for `axe-core` and `playwright`. These are test-only; the site itself has no runtime packages.

## 3. Hosting

- Choose static hosting or container hosting, and complete the matching block in `deploy/deploy.sh`. Remove its `exit 1`.
- Serve over **HTTPS**. Offline support needs it.
- Keep the response headers from `deploy/nginx.conf`: the Content-Security-Policy, and `no-cache` for HTML, JavaScript and CSS (file names have no version hash, so this is how updates reach browsers).
- Container: port **8080**, health check **`/healthz`**, runs as a non-root user. nginx writes its configuration at start-up, so if your platform requires a read-only filesystem, mount writable `/etc/nginx/conf.d` and `/tmp`. That setup wasn't tested.
- Restrict access to the corporate network, or put it behind your sign-in gateway.

## 4. Before real employee data is entered

These are open decisions, not configuration. The details are in `docs/HANDOVER.md`, section 3.

- **B1:** data is stored per browser and isn't shared. A server-side database and API are needed.
- **B2:** permissions are enforced only in the browser. Server-side authorization is needed.
- **B3:** sign-in is local. Your organization's SSO should replace it.
- Approval from the data owner and from IT security.
