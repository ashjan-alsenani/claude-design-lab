# What IT still needs to configure

The project builds and tests itself in GitLab with no company settings. Production deployment stays **off** until the items below are done.

## 1. Identity provider (company sign-in)

- Register an application (in Entra ID: App registrations → New registration).
  - **Redirect URI (Web):** `https://<route-host>/employee-directory/auth/callback`
  - **Front-channel / post-logout URL:** `https://<route-host>/employee-directory/`
  - Create a **client secret**. The app uses the authorization-code flow with PKCE.
- Make sure the ID token or userinfo includes the user's email.
  - For Entra ID, set `OIDC_EMAIL_CLAIM=preferred_username`, or add the optional `email` claim.
- Optional: limit sign-in to a group. Set `OIDC_ALLOWED_GROUPS` and include the groups claim.
- Put the issuer URL and client ID in `openshift/configmap.yaml`. The client secret goes in the Secret (§3).

## 2. PostgreSQL

- A PostgreSQL 14+ database with its own user that owns the database (the app creates its tables on start).
- **Backups and point-in-time recovery:** the app does not back itself up.
- TLS: set `DATABASE_SSL=require`, or `verify` when the server certificate is trusted inside the cluster.
- For a test namespace only, `openshift/postgresql-dev.yaml` runs a single PostgreSQL pod.

## 3. OpenShift

- A project (namespace) for the app.
- Create the Secret `employee-directory-secrets` with:
  - `DATABASE_URL`
  - `SESSION_SECRET` (64 random hex characters)
  - `OIDC_CLIENT_SECRET`

  `openshift/secret.example.yaml` shows the command.
- Fill in the placeholders in `openshift/configmap.yaml`:
  - `PUBLIC_URL`
  - `OIDC_ISSUER_URL`
  - `OIDC_CLIENT_ID`
  - `ADMIN_EMAILS` (the first administrator)
- Fill in the `host` in `openshift/route.yaml`.
- The image runs as non-root with an arbitrary UID, on port 8080. Probes are `/healthz` (liveness) and `/readyz` (readiness, checks the database).
- Allow outbound traffic from the pods to the database and to the identity provider. `openshift/networkpolicy.yaml` limits only inbound traffic, to the router.
- The cluster must be able to pull from the GitLab container registry. Give it an image pull secret if the registry is private.

## 4. GitLab CI/CD variables (Settings → CI/CD → Variables)

| Variable | Protected / masked | Value |
|---|---|---|
| `DEPLOY_ENABLED` | protected | `true` once everything above is ready |
| `OPENSHIFT_SERVER` | protected | API URL, e.g. `https://api.cluster.example:6443` |
| `OPENSHIFT_TOKEN` | protected, masked | Token of a service account with edit rights in the project |
| `OPENSHIFT_PROJECT` | protected | The namespace |
| `OPENSHIFT_CA_FILE` | protected (File type) | Only if the API certificate isn't publicly trusted |
| `PRODUCTION_URL` | — | `https://<route-host>/employee-directory/` |

Runners need the Docker executor. They must reach these images, or set the `*_IMAGE` variables to internal mirrors:
- `node:22-bookworm-slim`
- `mcr.microsoft.com/playwright:v1.63.0-noble`
- `postgres:16-alpine`
- `gcr.io/kaniko-project/executor:v1.23.2-debug`
- `quay.io/openshift/origin-cli:4.16`
- `registry.access.redhat.com/ubi9/nodejs-22`

They also need the npm registry, or an internal mirror.

## 5. Before real employee data goes in

- The data owner (HR) and IT security approve the deployment and the data classification.
- Decide who the first administrators are (`ADMIN_EMAILS`). They then add everyone else in **Users & access**, using each person's sign-in email.
- Keep `DEFAULT_ROLE=none` unless every signed-in employee should get read-only access.
- Load the real data from a backup of the current site (README.md §4), or start empty (`INITIAL_DATA=empty`) and import from Excel inside the app.
