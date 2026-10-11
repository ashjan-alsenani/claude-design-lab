#!/usr/bin/env bash
# «حكاية قدوم» database race test: many guests at once on the last gift and the last visit seats.
# Real PostgreSQL 16, the real migration. Usage (from the oneclick folder): bash tests/db-integration/qudoom-race.sh
set -euo pipefail
APP="$(cd "$(dirname "$0")/../.." && pwd)"; W="${W:-/tmp/oc-qd-race}"; PG=/usr/lib/postgresql/16/bin; PORT=54352
rm -rf "$W"; mkdir -p "$W"; chown -R postgres:postgres "$W" 2>/dev/null || true
cleanup() { su postgres -c "$PG/pg_ctl -D $W/pg stop -m fast" >/dev/null 2>&1 || true; }
trap cleanup EXIT
su postgres -c "$PG/initdb -D $W/pg -A trust -U postgres >/dev/null"
su postgres -c "$PG/pg_ctl -D $W/pg -o '-p $PORT -k /tmp' -l $W/pg.log start" >/dev/null; sleep 2
P="psql -h /tmp -p $PORT -U postgres -At -v ON_ERROR_STOP=1"
$P -q -c "create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;"
$P -q -f "$APP/supabase/migrations/20261011000000_qudoom.sql"
$P -q -c "insert into oc_qd_owners(owner_id, projection) values ('u1', '{\"gifts\":[{\"id\":\"g1\",\"qtyNeeded\":1},{\"id\":\"g2\",\"qtyNeeded\":3}],\"visits\":{\"settings\":{\"maxPeople\":4},\"manual\":{\"2030-01-05T17:00\":1}}}')"
for i in $(seq 1 40); do $P -c "select oc_qd_reserve_gift('u1','g1',1,'c$i','n',false,'h$i', now()+interval '7 days', false)" > "$W/g$i" & done; wait
for i in $(seq 1 40); do $P -c "select oc_qd_reserve_gift('u1','g2',1,'d$i','n',false,'k$i', now()+interval '7 days', false)" > "$W/e$i" & done; wait
for i in $(seq 1 40); do $P -c "select oc_qd_request_visit('u1','v$i','n',null,1,'2030-01-05','17:00',null,'vh$i', now()+interval '1 day')" > "$W/v$i" & done; wait
g1=$(cat "$W"/g* | grep -c '^ok$' || true); g2=$(cat "$W"/e* | grep -c '^ok$' || true); v=$(cat "$W"/v* | grep -c '^ok$' || true)
echo "last gift (qty 1): $g1 winner(s); gift with 3: $g2; visit slot cap 4 with 1 manual: $v requests"
[ "$g1" = 1 ] && [ "$g2" = 3 ] && [ "$v" = 3 ] || { echo "RACE TEST FAILED"; exit 1; }
# An expired reservation stops holding; a cancelled one frees the gift.
$P -q -c "update oc_qd_gift_claims set expires_at = now() - interval '1 minute' where gift_id = 'g1'"
[ "$($P -c "select oc_qd_reserve_gift('u1','g1',1,'z1','n',false,'zh1', now()+interval '7 days', false)")" = ok ] || { echo "EXPIRY FAILED"; exit 1; }
[ "$($P -c "select oc_qd_claim_action('zh1','cancel')")" = ok ] || { echo "CANCEL FAILED"; exit 1; }
# The public API roles can't touch the tables or call the functions.
$P -c "set role anon; select count(*) from oc_qd_owners" >/dev/null 2>&1 && { echo "ANON CAN READ"; exit 1; }
$P -c "set role anon; select oc_qd_reserve_gift('u1','g2',1,'a','n',false,'ah', now(), false)" >/dev/null 2>&1 && { echo "ANON CAN CALL"; exit 1; }
echo "qudoom race test: OK"
