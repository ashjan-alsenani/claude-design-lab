-- One Click: server-side store (v1). This is the migration to run on the Supabase project.
--
-- The licensing engine works on one consistent record set (accounts, sessions, devices, orders,
-- licenses, claims, policy) and commits every change as a single compare-and-swap on
-- `oc_licensing_state.version`, so two requests can never overwrite each other. Access and audit
-- entries are also appended to `oc_licensing_events`, which keeps the full history while the
-- working record keeps only the most recent entries.
--
-- Security: only the server reaches these tables, with the service role key (which bypasses RLS).
-- RLS is enabled with no policies and all privileges are revoked from the public API roles, so the
-- anon key and signed-in browser sessions can read or write nothing here.
--
-- The earlier migrations (20261002…, 20261003…) describe a future fully normalized schema. They are
-- not needed to run the site today.

create table if not exists public.oc_licensing_state (
  id smallint primary key check (id = 1),
  version bigint not null check (version > 0),
  doc jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.oc_licensing_events (
  id bigint generated always as identity primary key,
  kind text not null check (kind in ('access', 'audit')),
  at timestamptz not null,
  entry jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists oc_licensing_events_at_idx on public.oc_licensing_events (at desc);

-- Per-customer, per-product private data (e.g. a bride's planner). The server writes here only
-- after the licensing engine has authorized the request.
create table if not exists public.oc_product_data (
  user_id text not null,
  product_id text not null,
  data jsonb,
  version integer not null default 0 check (version >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

-- Custom solution requests and support messages from the public forms.
create table if not exists public.oc_leads (
  id bigint generated always as identity primary key,
  kind text not null check (kind in ('custom_request', 'support_request')),
  reference text not null unique,
  status text not null,
  data jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists oc_leads_kind_created_idx on public.oc_leads (kind, created_at desc);

alter table public.oc_licensing_state enable row level security;
alter table public.oc_licensing_events enable row level security;
alter table public.oc_product_data enable row level security;
alter table public.oc_leads enable row level security;

do $$
declare r text;
begin
  foreach r in array array['anon', 'authenticated'] loop
    if exists (select 1 from pg_roles where rolname = r) then
      execute format('revoke all on public.oc_licensing_state, public.oc_licensing_events, public.oc_product_data, public.oc_leads from %I', r);
    end if;
  end loop;
end $$;
