#!/usr/bin/env bash
# Production-mode integration test: real PostgreSQL 16 + PostgREST (the API Supabase uses) + a mock
# Resend server, against `next build && next start`. Needs PostgreSQL 16 binaries and network access
# to download PostgREST once. Usage: bash tests/db-integration/run.sh   (from the oneclick folder)
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; APP="$(cd "$HERE/../.." && pwd)"; W="${W:-/tmp/oc-db-it}"
PG=/usr/lib/postgresql/16/bin; JWT_SECRET="local-test-jwt-secret-local-test-jwt-secret-0123456789"
rm -rf "$W"; mkdir -p "$W"; chown -R postgres:postgres "$W" 2>/dev/null || true
cleanup() { kill $(jobs -p) 2>/dev/null || true; su postgres -c "$PG/pg_ctl -D $W/pg stop -m fast" >/dev/null 2>&1 || true; }
trap cleanup EXIT
su postgres -c "$PG/initdb -D $W/pg -A trust -U postgres >/dev/null"
su postgres -c "$PG/pg_ctl -D $W/pg -o '-p 54329 -k /tmp' -l $W/pg.log start" >/dev/null; sleep 2
psql -h /tmp -p 54329 -U postgres -v ON_ERROR_STOP=1 -q <<'SQL'
create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
create role authenticator login noinherit password 'auth';
grant anon, authenticated, service_role to authenticator;
grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
SQL
psql -h /tmp -p 54329 -U postgres -v ON_ERROR_STOP=1 -q -f "$APP/supabase/migrations/20261004000000_server_store.sql"
[ -x "$W/postgrest" ] || { curl -sL -o "$W/p.tar.xz" https://github.com/PostgREST/postgrest/releases/download/v12.2.3/postgrest-v12.2.3-linux-static-x64.tar.xz; tar xf "$W/p.tar.xz" -C "$W"; }
printf 'db-uri = "postgres://authenticator:auth@localhost:54329/postgres"\ndb-schemas = "public"\ndb-anon-role = "anon"\njwt-secret = "%s"\nserver-port = 54340\n' "$JWT_SECRET" > "$W/pgrst.conf"
"$W/postgrest" "$W/pgrst.conf" > "$W/pgrst.log" 2>&1 &
node "$HERE/proxy.mjs" & node "$HERE/resend.mjs" & sleep 2
SERVICE=$(node "$HERE/jwt.mjs" "$JWT_SECRET" service_role); ANON=$(node "$HERE/jwt.mjs" "$JWT_SECRET" anon)
# The public (anon) key must not be able to read or write the private tables.
curl -s -H "apikey: $ANON" -H "Authorization: Bearer $ANON" "http://localhost:54330/rest/v1/oc_leads" | grep -q 42501 && echo "anon access denied: OK"
cd "$APP"
NEXT_PUBLIC_SITE_URL=http://localhost:3600 npx next build >/dev/null
env NODE_ENV=production NEXT_PUBLIC_SITE_URL=http://localhost:3600 SUPABASE_URL=http://localhost:54330 SUPABASE_SERVICE_ROLE_KEY="$SERVICE" \
  LICENSING_SECRET=local-test-licensing-secret-0123456789abcdef EMAIL_PROVIDER=resend RESEND_API_KEY=re_test_key \
  EMAIL_FROM="One Click <hello@oneclick.test>" RESEND_API_URL=http://localhost:54331 ONECLICK_OWNER_EMAILS=owner@oneclick.test \
  npx next start -p 3600 > "$W/next.log" 2>&1 &
for i in $(seq 1 30); do curl -s -o /dev/null http://localhost:3600/en && break; sleep 2; done
npx playwright test -c tests/db-integration/pw.config.ts
P="psql -h /tmp -p 54329 -U postgres -At"
echo "planner rows: $($P -c 'select count(*) from oc_product_data')  leads: $($P -c 'select count(*) from oc_leads')  events: $($P -c 'select count(*) from oc_licensing_events')"
