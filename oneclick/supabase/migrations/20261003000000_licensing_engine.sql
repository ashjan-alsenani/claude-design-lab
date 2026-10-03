-- One Click: Digital Product Licensing, Delivery & Access Engine
-- Mirrors src/lib/licensing/types.ts. Applied after 20261002000000_initial_schema.sql.
--
-- Principles:
--   * THE PRODUCT BELONGS TO THE CUSTOMER ACCOUNT, NOT THE URL.
--   * Licenses are created/activated only by the server (service role) after a verified
--     payment event or an audited admin grant. Customers can READ their own records and
--     can never insert/update licenses, orders or payment state (no write policies).
--   * Tokens and one-time codes are stored only as HMAC digests and are never readable
--     by customers (column-level grants below).

-- ---------- Types ----------
create type account_status as enum ('pending_verification', 'active', 'suspended', 'closed');
create type license_status as enum ('pending', 'active', 'suspended', 'revoked', 'expired');
create type access_type as enum ('INTERACTIVE_PRIVATE', 'SECURE_DOWNLOAD', 'HYBRID', 'PUBLIC_FREE', 'CUSTOM_SERVICE');
create type device_status as enum ('trusted', 'removed');
create type challenge_purpose as enum ('signin', 'claim', 'new_device', 'email_change', 'recovery');
alter type order_status add value if not exists 'chargeback';
alter type entitlement_source add value if not exists 'bundle';

-- ---------- Accounts ----------
alter table profiles
  add column account_status account_status not null default 'pending_verification',
  add column email_verified_at timestamptz,
  add column email text check (email = lower(email)),
  add column email_history jsonb not null default '[]';
create unique index profiles_email_idx on profiles(email) where email is not null;

-- ---------- Per-product security settings (editable in Admin, no code changes) ----------
alter table products
  add column access_type access_type not null default 'INTERACTIVE_PRIVATE',
  add column device_limit int check (device_limit between 1 and 20), -- null = global default
  add column default_license license_type not null default 'personal',
  add column download_enabled boolean not null default false,
  add column download_limit int check (download_limit > 0),         -- null = unlimited
  add column watermark boolean not null default true,
  add column license_duration_days int check (license_duration_days > 0), -- null = lifetime
  add column security_status text not null default 'active' check (security_status in ('active', 'paused'));

create table bundle_items (
  bundle_id uuid references products(id) on delete cascade,
  product_id uuid references products(id) on delete restrict,
  primary key (bundle_id, product_id)
);

-- Global business rules (singleton).
create table licensing_policy (
  id boolean primary key default true check (id),
  default_device_limit int not null default 2,
  max_active_sessions int not null default 5,
  session_days int not null default 30,
  otp_ttl_minutes int not null default 10,
  otp_max_attempts int not null default 5,
  otp_per_email_per_hour int not null default 5,
  claim_link_days int not null default 14,
  download_link_seconds int not null default 120,
  on_refund text not null default 'revoke' check (on_refund in ('revoke', 'suspend')),
  on_chargeback text not null default 'suspend' check (on_chargeback in ('revoke', 'suspend')),
  on_cancel text not null default 'revoke' check (on_cancel in ('revoke', 'suspend')),
  updated_at timestamptz not null default now()
);
insert into licensing_policy (id) values (true);

-- ---------- Orders: guest purchases, purchase email, provider reference ----------
alter table orders
  alter column user_id drop not null,                                  -- guest until claimed
  add column purchase_email text not null default '' check (purchase_email = lower(purchase_email)),
  add column external_payment_reference text,
  add column is_sandbox boolean not null default false,
  add column locale text not null default 'en' check (locale in ('en', 'ar'));
create index orders_purchase_email_idx on orders(purchase_email);

-- ---------- Licenses (product_licenses) ----------
-- The existing `entitlements` table becomes the license table; `product_licenses` is a view alias.
alter table entitlements
  alter column user_id drop not null,                                  -- null = pending account claim
  add column status license_status not null default 'active',
  add column purchase_email text check (purchase_email = lower(purchase_email)),
  add column order_item_id uuid references order_items(id),
  add column parent_license_id uuid references entitlements(id),
  add column activated_at timestamptz,
  add column suspended_at timestamptz,
  add column claimed_at timestamptz,
  add column status_reason text,
  add column device_ids uuid[] not null default '{}';
alter table entitlements rename column ends_at to expires_at;
create index entitlements_purchase_email_idx on entitlements(purchase_email) where user_id is null;
create index entitlements_order_idx on entitlements(order_id);
create view product_licenses with (security_invoker = true) as select * from entitlements;

-- ---------- Devices & sessions ----------
create table authorized_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token_hash text not null,                                           -- HMAC of the HttpOnly device cookie
  name text not null,                                                 -- "Chrome on iPhone"
  platform text not null check (platform in ('ios', 'android', 'mac', 'windows', 'linux', 'other')),
  first_verified_at timestamptz not null default now(),
  last_used_at timestamptz not null default now(),
  status device_status not null default 'trusted'
);
create index authorized_devices_user_idx on authorized_devices(user_id) where status = 'trusted';
create unique index authorized_devices_token_idx on authorized_devices(user_id, token_hash) where status = 'trusted';

create table user_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token_hash text not null unique,
  device_id uuid references authorized_devices(id),
  device_state text not null default 'trusted' check (device_state in ('trusted', 'pending')),
  pending_device_token_hash text,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  expires_at timestamptz not null,
  verified_at timestamptz,
  revoked_at timestamptz,
  revoked_reason text
);
create index user_sessions_user_idx on user_sessions(user_id) where revoked_at is null;

-- ---------- Verification codes & claim links (server-only) ----------
create table email_verification_challenges (
  id uuid primary key default gen_random_uuid(),
  email text not null check (email = lower(email)),
  purpose challenge_purpose not null,
  code_hash text not null,                                            -- HMAC(secret, id:code); never the code
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  attempts int not null default 0,
  consumed_at timestamptz,
  locked_at timestamptz,
  user_id uuid references auth.users(id) on delete cascade,
  new_email text
);
create index challenges_email_idx on email_verification_challenges(email, created_at);

create table license_claims (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,                                    -- the link only starts verification
  order_id text not null references orders(id) on delete cascade,
  purchase_email text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  last_used_at timestamptz
);

-- ---------- Logs ----------
-- Access & security events. Never contains codes, tokens, passwords or secrets.
create table access_logs (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  event text not null,
  outcome text not null check (outcome in ('allowed', 'denied', 'info', 'suspicious')),
  user_id uuid references auth.users(id) on delete set null,
  product_id uuid references products(id),
  license_id uuid references entitlements(id),
  device_id uuid references authorized_devices(id),
  reason text,
  meta jsonb not null default '{}'
);
create index access_logs_user_idx on access_logs(user_id, at desc);
create index access_logs_suspicious_idx on access_logs(at desc) where outcome = 'suspicious';

alter table audit_log add column reason text;
alter table download_events add column entitlement_id uuid references entitlements(id);

-- ---------- Central rule in SQL (used by RLS) ----------
-- Mirrors canUserAccessProduct() for data-level checks (account, product, license).
-- Session/device checks happen in the server engine.
create or replace function public.has_active_license(p_product uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from entitlements e
    join profiles pr on pr.id = e.user_id
    join products p on p.id = e.product_id
    where e.user_id = auth.uid()
      and e.product_id = p_product
      and e.status = 'active'
      and (e.expires_at is null or e.expires_at > now())
      and e.starts_at <= now()
      and pr.account_status = 'active'
      and pr.email_verified_at is not null
      and p.security_status = 'active'
  );
$$;

-- Replace entitlement checks from the initial schema with the license status model.
drop policy "entitled read downloads" on downloads;
create policy "licensed read downloads" on downloads for select using (has_role('admin') or has_active_license(product_id));

drop policy "own product data" on product_data;
create policy "own product data" on product_data for all
  using (user_id = auth.uid() and has_active_license(product_id))
  with check (user_id = auth.uid() and has_active_license(product_id));

create or replace function set_verified_purchase() returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.verified_purchase := exists (
    select 1 from entitlements e
    where e.user_id = new.user_id and e.product_id = new.product_id and e.source in ('purchase', 'bundle') and e.status = 'active'
  );
  return new;
end $$;

-- ---------- Row Level Security ----------
alter table bundle_items enable row level security;
alter table licensing_policy enable row level security;
alter table authorized_devices enable row level security;
alter table user_sessions enable row level security;
alter table email_verification_challenges enable row level security;
alter table license_claims enable row level security;
alter table access_logs enable row level security;

create policy "public read bundle items" on bundle_items for select using (true);
create policy "admin read policy" on licensing_policy for select using (has_role('admin'));
create policy "own devices" on authorized_devices for select using (user_id = auth.uid() or has_role('admin'));
create policy "own sessions" on user_sessions for select using (user_id = auth.uid() or has_role('admin'));
create policy "own access logs" on access_logs for select using (user_id = auth.uid() or has_role('admin'));
-- email_verification_challenges and license_claims: no policies = no client access at all.

-- Column-level privileges: hashes are never readable from the browser, even for own rows.
revoke all on authorized_devices, user_sessions, email_verification_challenges, license_claims, access_logs, licensing_policy from anon, authenticated;
grant select (id, user_id, name, platform, first_verified_at, last_used_at, status) on authorized_devices to authenticated;
grant select (id, user_id, device_id, device_state, created_at, last_seen_at, expires_at, revoked_at) on user_sessions to authenticated;
grant select (id, at, event, outcome, user_id, product_id, license_id, device_id, reason) on access_logs to authenticated;
grant select on licensing_policy to authenticated;
-- Licenses, orders and payment state: read-only for customers (initial schema has select-only policies).
revoke insert, update, delete on entitlements, orders, order_items, payment_events from anon, authenticated;
grant select on product_licenses to authenticated;
