-- One Click Digital Hub initial schema (PostgreSQL / Supabase).
-- STATUS: written, NOT YET APPLIED (no Supabase project exists yet; see OWNER_ACTIONS.md).
-- Principles:
--   * Money in integer minor units + ISO currency (OMR = 3 decimals). No floats.
--   * Bilingual text as jsonb {"en": "...", "ar": "..."} so languages can be added later.
--   * Row Level Security on every table. Customers see only their own rows.
--     Admin writes go through server code using the service role, after a role check.
--   * Paid files live in a PRIVATE storage bucket; access via short-lived signed URLs
--     issued only after an entitlement check.

create extension if not exists "pgcrypto";

-- ---------- Enums ----------
create type product_kind as enum ('interactive', 'download', 'bundle', 'custom-service');
create type access_model as enum ('lifetime', 'subscription', 'limited', 'download', 'free');
create type product_status as enum ('preview', 'available', 'coming-soon', 'archived');
create type order_status as enum ('pending', 'paid', 'failed', 'refunded', 'partially_refunded', 'cancelled');
create type license_type as enum ('personal', 'commercial', 'team');
create type entitlement_source as enum ('purchase', 'free', 'gift', 'admin_grant', 'subscription');
create type custom_request_status as enum ('new', 'reviewing', 'need_info', 'quoted', 'accepted', 'in_progress', 'review', 'completed', 'closed');
create type support_status as enum ('open', 'waiting_customer', 'resolved', 'closed');
create type review_status as enum ('pending', 'approved', 'rejected');
create type social_status as enum ('draft', 'review', 'approved', 'scheduled', 'published', 'failed');
create type app_role as enum ('customer', 'admin', 'owner');

-- ---------- People ----------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  locale text not null default 'en' check (locale in ('en', 'ar')),
  country text,
  marketing_consent boolean not null default false,
  marketing_consent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table user_roles (
  user_id uuid references auth.users(id) on delete cascade,
  role app_role not null,
  primary key (user_id, role)
);

create or replace function public.has_role(r app_role) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from user_roles where user_id = auth.uid() and (role = r or role = 'owner'));
$$;

-- ---------- Catalog ----------
create table categories (
  slug text primary key,
  parent_slug text references categories(slug),
  name jsonb not null,
  description jsonb not null default '{}',
  hue text not null default 'brand',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table tags (slug text primary key, name jsonb not null);

create table products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name jsonb not null,
  tagline jsonb not null default '{}',
  summary jsonb not null default '{}',
  content jsonb not null default '{}', -- problem, audience, story, benefits, features, included, faqs, disclaimer
  kind product_kind not null,
  access access_model not null,
  status product_status not null default 'preview',
  hue text not null default 'brand',
  languages text[] not null default '{ar,en}',
  featured boolean not null default false,
  is_new boolean not null default false,
  demo_id text,
  is_sample boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table product_categories (product_id uuid references products(id) on delete cascade, category_slug text references categories(slug) on delete cascade, primary key (product_id, category_slug));
create table product_tags (product_id uuid references products(id) on delete cascade, tag_slug text references tags(slug) on delete cascade, primary key (product_id, tag_slug));

-- Explicit price per currency. No automatic conversion.
create table product_prices (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  currency char(3) not null,
  amount_minor bigint not null check (amount_minor >= 0),
  compare_at_minor bigint,
  license license_type not null default 'personal',
  active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  unique (product_id, currency, license, starts_at)
);

create table product_versions (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  version text not null,
  notes jsonb not null default '{}',
  released_at timestamptz not null default now()
);

create table product_media (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  kind text not null check (kind in ('screenshot', 'video', 'mockup', 'cover')),
  storage_path text not null, -- public bucket
  alt jsonb not null default '{}',
  sort_order int not null default 0
);

create table downloads (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  title jsonb not null,
  storage_path text not null, -- PRIVATE bucket "paid-files"
  file_size bigint,
  version text,
  created_at timestamptz not null default now()
);

-- ---------- Commerce ----------
create table discounts (
  code text primary key,
  kind text not null check (kind in ('percent', 'fixed')),
  value bigint not null check (value >= 0),
  currency char(3),
  product_ids uuid[],
  starts_at timestamptz,
  expires_at timestamptz,
  max_uses int,
  used_count int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table referral_codes (
  code text primary key,
  owner_name text not null,
  commission_percent numeric(5,2),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table orders (
  id text primary key, -- public reference e.g. OC-7K3M9Q
  user_id uuid not null references auth.users(id),
  status order_status not null default 'pending',
  currency char(3) not null,
  subtotal_minor bigint not null,
  discount_minor bigint not null default 0,
  tax_minor bigint not null default 0,
  total_minor bigint not null,
  discount_code text references discounts(code),
  referral_code text references referral_codes(code),
  utm jsonb not null default '{}',
  payment_provider text,
  provider_reference text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references orders(id) on delete cascade,
  product_id uuid not null references products(id),
  license license_type not null default 'personal',
  unit_price_minor bigint not null,
  quantity int not null default 1 check (quantity > 0)
);

-- Raw provider events (audit trail; idempotency on provider event id).
create table payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text not null,
  order_id text references orders(id),
  type text not null,
  payload jsonb not null,
  received_at timestamptz not null default now(),
  unique (provider, provider_event_id)
);

create table entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references products(id),
  source entitlement_source not null,
  license license_type not null default 'personal',
  order_id text references orders(id),
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);
create index entitlements_user_idx on entitlements(user_id);

create table download_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  download_id uuid not null references downloads(id),
  created_at timestamptz not null default now()
);

-- Per-user product data for interactive products (lists, plans...). One row per product.
create table product_data (
  user_id uuid references auth.users(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  data jsonb not null default '{}',
  updated_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table favorites (
  user_id uuid references auth.users(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  body text check (char_length(body) <= 2000),
  locale text not null default 'en',
  verified_purchase boolean not null default false, -- set by trigger, never by the client
  status review_status not null default 'pending',
  moderation_note text,
  created_at timestamptz not null default now(),
  unique (product_id, user_id)
);

-- ---------- Leads, support, marketing ----------
create table custom_requests (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null,
  status custom_request_status not null default 'new',
  user_id uuid references auth.users(id),
  name text not null,
  email text not null,
  phone text,
  country text,
  locale text not null,
  brief jsonb not null, -- goal, type, audience, features, references, languages, deadline, budget, branding, payments, notes
  attachments text[] not null default '{}',
  quote_minor bigint,
  quote_currency char(3),
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table support_requests (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null,
  status support_status not null default 'open',
  user_id uuid references auth.users(id),
  topic text not null,
  order_reference text,
  name text not null,
  email text not null,
  message text not null,
  locale text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table newsletter_subscribers (
  email text primary key,
  locale text not null default 'en',
  consent_text text not null,
  consented_at timestamptz not null default now(),
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  source text
);

create table campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  utm_campaign text unique not null,
  starts_at date,
  ends_at date,
  notes text
);

create table social_posts (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id),
  campaign_id uuid references campaigns(id),
  format text not null check (format in ('reel', 'carousel', 'story', 'post')),
  language text not null check (language in ('ar', 'en', 'bilingual')),
  caption jsonb not null default '{}',
  cta jsonb not null default '{}',
  link text,
  media_paths text[] not null default '{}',
  status social_status not null default 'draft',
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  scheduled_at timestamptz,
  published_at timestamptz,
  external_id text,
  last_error text,
  attempts int not null default 0,
  created_at timestamptz not null default now()
);

create table video_assets (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  product_id uuid references products(id),
  aspect text not null default '9:16',
  tool text, -- which tool produced it (e.g. HyperFrames, editor)
  storage_path text,
  script jsonb not null default '{}',
  status text not null default 'concept',
  cost_note text,
  created_at timestamptz not null default now()
);

create table testimonials (
  id uuid primary key default gen_random_uuid(),
  review_id uuid references reviews(id), -- testimonials must come from real reviews
  quote jsonb not null,
  attribution text not null,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

create table faqs (
  id text primary key,
  group_key text not null,
  question jsonb not null,
  answer jsonb not null,
  sort_order int not null default 0
);

create table guides (
  slug text primary key,
  title jsonb not null,
  excerpt jsonb not null,
  body jsonb not null,
  category_slug text references categories(slug),
  related_product uuid references products(id),
  published_at timestamptz,
  updated_at timestamptz not null default now()
);

create table announcements (
  id uuid primary key default gen_random_uuid(),
  message jsonb not null,
  link text,
  starts_at timestamptz,
  ends_at timestamptz,
  active boolean not null default false
);

-- Business settings: single row. Tax rules editable (never hard-coded).
create table business_settings (
  id boolean primary key default true check (id),
  legal_name text,
  commercial_registration text,
  vat_number text,
  address text,
  support_email text,
  business_phone text,
  show_legal_identity boolean not null default false,
  base_currency char(3) not null default 'OMR',
  tax_enabled boolean not null default false,
  tax_rate_percent numeric(5,2),
  prices_include_tax boolean not null default true,
  updated_at timestamptz not null default now()
);
insert into business_settings (id) values (true);

create table audit_log (
  id bigint generated always as identity primary key,
  actor uuid references auth.users(id),
  action text not null,
  entity text not null,
  entity_id text,
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- ---------- Triggers ----------
-- Verified Purchase is derived from entitlements, never from client input.
create or replace function set_verified_purchase() returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.verified_purchase := exists (
    select 1 from entitlements e
    where e.user_id = new.user_id and e.product_id = new.product_id and e.source = 'purchase' and e.revoked_at is null
  );
  return new;
end $$;
create trigger reviews_verified before insert or update on reviews for each row execute function set_verified_purchase();

-- New auth user -> profile + customer role.
create or replace function handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name, locale) values (new.id, new.raw_user_meta_data->>'full_name', coalesce(new.raw_user_meta_data->>'locale', 'en'));
  insert into user_roles (user_id, role) values (new.id, 'customer');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

-- ---------- Row Level Security ----------
alter table profiles enable row level security;
alter table user_roles enable row level security;
alter table categories enable row level security;
alter table tags enable row level security;
alter table products enable row level security;
alter table product_categories enable row level security;
alter table product_tags enable row level security;
alter table product_prices enable row level security;
alter table product_versions enable row level security;
alter table product_media enable row level security;
alter table downloads enable row level security;
alter table discounts enable row level security;
alter table referral_codes enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table payment_events enable row level security;
alter table entitlements enable row level security;
alter table download_events enable row level security;
alter table product_data enable row level security;
alter table favorites enable row level security;
alter table reviews enable row level security;
alter table custom_requests enable row level security;
alter table support_requests enable row level security;
alter table newsletter_subscribers enable row level security;
alter table campaigns enable row level security;
alter table social_posts enable row level security;
alter table video_assets enable row level security;
alter table testimonials enable row level security;
alter table faqs enable row level security;
alter table guides enable row level security;
alter table announcements enable row level security;
alter table business_settings enable row level security;
alter table audit_log enable row level security;

-- Public catalog (read-only, non-archived)
create policy "public read categories" on categories for select using (true);
create policy "public read tags" on tags for select using (true);
create policy "public read products" on products for select using (status <> 'archived' or has_role('admin'));
create policy "public read product_categories" on product_categories for select using (true);
create policy "public read product_tags" on product_tags for select using (true);
create policy "public read prices" on product_prices for select using (active or has_role('admin'));
create policy "public read versions" on product_versions for select using (true);
create policy "public read media" on product_media for select using (true);
create policy "public read faqs" on faqs for select using (true);
create policy "public read guides" on guides for select using (published_at is not null and published_at <= now());
create policy "public read announcements" on announcements for select using (active);
create policy "public read approved reviews" on reviews for select using (status = 'approved' or user_id = auth.uid() or has_role('admin'));
create policy "public read approved testimonials" on testimonials for select using (approved);

-- Downloads metadata only for entitled users (files themselves are in a private bucket)
create policy "entitled read downloads" on downloads for select using (
  has_role('admin') or exists (
    select 1 from entitlements e where e.user_id = auth.uid() and e.product_id = downloads.product_id
      and e.revoked_at is null and e.starts_at <= now() and (e.ends_at is null or e.ends_at > now())
  )
);

-- Own rows
create policy "own profile" on profiles for select using (id = auth.uid() or has_role('admin'));
create policy "update own profile" on profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "own roles" on user_roles for select using (user_id = auth.uid() or has_role('owner'));
create policy "own orders" on orders for select using (user_id = auth.uid() or has_role('admin'));
create policy "own order items" on order_items for select using (exists (select 1 from orders o where o.id = order_id and (o.user_id = auth.uid() or has_role('admin'))));
create policy "own entitlements" on entitlements for select using (user_id = auth.uid() or has_role('admin'));
create policy "own product data" on product_data for all using (
  user_id = auth.uid() and exists (
    select 1 from entitlements e where e.user_id = auth.uid() and e.product_id = product_data.product_id and e.revoked_at is null
      and e.starts_at <= now() and (e.ends_at is null or e.ends_at > now())
  )
) with check (user_id = auth.uid());
create policy "own favorites" on favorites for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "write own review" on reviews for insert with check (user_id = auth.uid() and status = 'pending');
create policy "own custom requests" on custom_requests for select using (user_id = auth.uid() or has_role('admin'));
create policy "own support requests" on support_requests for select using (user_id = auth.uid() or has_role('admin'));

-- Admin-only reads (writes happen server-side with the service role after role checks)
create policy "admin discounts" on discounts for select using (has_role('admin'));
create policy "admin referrals" on referral_codes for select using (has_role('admin'));
create policy "admin payment events" on payment_events for select using (has_role('admin'));
create policy "admin download events" on download_events for select using (has_role('admin'));
create policy "admin newsletter" on newsletter_subscribers for select using (has_role('admin'));
create policy "admin campaigns" on campaigns for select using (has_role('admin'));
create policy "admin social" on social_posts for select using (has_role('admin'));
create policy "admin video" on video_assets for select using (has_role('admin'));
create policy "admin settings" on business_settings for select using (has_role('admin'));
create policy "admin audit" on audit_log for select using (has_role('owner'));
