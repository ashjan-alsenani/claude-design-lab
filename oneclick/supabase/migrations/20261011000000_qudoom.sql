-- «حكاية قدوم» (Hikayat Qudoom): the parts of a mother's plan that other people touch.
-- Additive only: new tables and functions, nothing existing is changed or dropped.
--
-- The mother's private plan stays in oc_product_data. These tables hold only what her public
-- links need (a projection she publishes by saving), the guests' reservations and visit
-- requests, and the helpers she invited. Every check that must not race (the last gift, the last
-- seats of a visit slot) runs inside one PL/pgSQL function that first locks the owner's row, so
-- two guests can never both take the last one.
--
-- Same model as the other tables: server only (service role). RLS on, no policies, every
-- privilege revoked from the public API roles, functions executable by the service role only.

create table if not exists public.oc_qd_owners (
  owner_id text primary key,
  projection jsonb not null default '{}'::jsonb,
  reserve_days integer not null default 7 check (reserve_days between 1 and 30),
  updated_at timestamptz not null default now()
);

create table if not exists public.oc_qd_links (
  owner_id text not null references public.oc_qd_owners (owner_id) on delete cascade,
  kind text not null check (kind in ('gifts', 'visits')),
  token_hash text not null unique,
  token_sealed text not null,
  active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (owner_id, kind)
);

create table if not exists public.oc_qd_gift_claims (
  id text primary key,
  owner_id text not null references public.oc_qd_owners (owner_id) on delete cascade,
  gift_id text not null,
  qty integer not null check (qty between 1 and 99),
  status text not null check (status in ('reserved', 'purchased', 'cancelled')),
  guest_name text not null default '' check (char_length(guest_name) <= 60),
  anonymous boolean not null default false,
  manage_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists oc_qd_gift_claims_owner_gift_idx on public.oc_qd_gift_claims (owner_id, gift_id);

create table if not exists public.oc_qd_visit_requests (
  id text primary key,
  owner_id text not null references public.oc_qd_owners (owner_id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  phone text check (char_length(phone) <= 30),
  people integer not null check (people between 1 and 30),
  day date not null,
  slot text not null check (slot ~ '^[0-2][0-9]:[0-5][0-9]$'),
  note text check (char_length(note) <= 300),
  status text not null check (status in ('pending', 'approved', 'declined', 'cancelled')),
  hold_until timestamptz not null,
  manage_hash text not null unique,
  created_at timestamptz not null default now(),
  decided_at timestamptz
);
create index if not exists oc_qd_visit_requests_owner_slot_idx on public.oc_qd_visit_requests (owner_id, day, slot);

create table if not exists public.oc_qd_helpers (
  id text primary key,
  owner_id text not null references public.oc_qd_owners (owner_id) on delete cascade,
  email text not null check (char_length(email) <= 254),
  sections text[] not null default '{}',
  can_edit boolean not null default false,
  status text not null check (status in ('invited', 'active', 'revoked')),
  invite_hash text not null unique,
  invite_sealed text not null,
  user_id text,
  created_at timestamptz not null default now(),
  accepted_at timestamptz
);
create index if not exists oc_qd_helpers_owner_idx on public.oc_qd_helpers (owner_id);
create index if not exists oc_qd_helpers_user_idx on public.oc_qd_helpers (user_id);

-- Reserve a gift (or record it as bought straight away). 'ok' | 'full' | 'not_found'.
create or replace function public.oc_qd_reserve_gift(
  p_owner text, p_gift text, p_qty integer, p_id text, p_name text, p_anonymous boolean,
  p_manage_hash text, p_expires timestamptz, p_purchased boolean
) returns text language plpgsql set search_path = public as $$
declare
  v_needed integer;
  v_taken integer;
begin
  perform 1 from oc_qd_owners where owner_id = p_owner for update;
  if not found then return 'not_found'; end if;
  select (g->>'qtyNeeded')::integer into v_needed
    from oc_qd_owners o, jsonb_array_elements(coalesce(o.projection->'gifts', '[]'::jsonb)) g
    where o.owner_id = p_owner and g->>'id' = p_gift;
  if v_needed is null then return 'not_found'; end if;
  select coalesce(sum(qty), 0) into v_taken from oc_qd_gift_claims
    where owner_id = p_owner and gift_id = p_gift
      and (status = 'purchased' or (status = 'reserved' and expires_at > now()));
  if v_taken + p_qty > v_needed then return 'full'; end if;
  insert into oc_qd_gift_claims (id, owner_id, gift_id, qty, status, guest_name, anonymous, manage_hash, expires_at)
    values (p_id, p_owner, p_gift, p_qty, case when p_purchased then 'purchased' else 'reserved' end, coalesce(p_name, ''), p_anonymous, p_manage_hash, p_expires);
  return 'ok';
end $$;

-- A guest confirms the purchase or cancels, through her private manage link. An expired
-- reservation can still be confirmed if the quantity is still free. 'ok' | 'full' | 'not_found'.
create or replace function public.oc_qd_claim_action(p_manage_hash text, p_action text)
returns text language plpgsql set search_path = public as $$
declare
  c oc_qd_gift_claims%rowtype;
  v_needed integer;
  v_taken integer;
begin
  select * into c from oc_qd_gift_claims where manage_hash = p_manage_hash;
  if not found or c.status = 'cancelled' then return 'not_found'; end if;
  perform 1 from oc_qd_owners where owner_id = c.owner_id for update;
  select * into c from oc_qd_gift_claims where id = c.id;
  if p_action = 'cancel' then
    if c.status <> 'reserved' then return 'not_found'; end if;
    update oc_qd_gift_claims set status = 'cancelled', updated_at = now() where id = c.id;
    return 'ok';
  end if;
  if p_action <> 'purchase' then return 'not_found'; end if;
  if c.status = 'purchased' then return 'ok'; end if;
  if c.expires_at <= now() then
    select (g->>'qtyNeeded')::integer into v_needed
      from oc_qd_owners o, jsonb_array_elements(coalesce(o.projection->'gifts', '[]'::jsonb)) g
      where o.owner_id = c.owner_id and g->>'id' = c.gift_id;
    select coalesce(sum(qty), 0) into v_taken from oc_qd_gift_claims
      where owner_id = c.owner_id and gift_id = c.gift_id and id <> c.id
        and (status = 'purchased' or (status = 'reserved' and expires_at > now()));
    if v_needed is null or v_taken + c.qty > v_needed then return 'full'; end if;
  end if;
  update oc_qd_gift_claims set status = 'purchased', updated_at = now() where id = c.id;
  return 'ok';
end $$;

-- Seats taken in one slot: the mother's own confirmed visits (published in the projection)
-- plus approved requests plus pending requests still inside their hold.
create or replace function public.oc_qd_slot_taken(p_owner text, p_day date, p_slot text, p_except text)
returns integer language sql stable set search_path = public as $$
  select coalesce((select (projection->'visits'->'manual'->>(to_char(p_day, 'YYYY-MM-DD') || 'T' || p_slot))::integer from oc_qd_owners where owner_id = p_owner), 0)
       + coalesce((select sum(people)::integer from oc_qd_visit_requests
           where owner_id = p_owner and day = p_day and slot = p_slot and id is distinct from p_except
             and (status = 'approved' or (status = 'pending' and hold_until > now()))), 0)
$$;

-- A visitor asks for a slot. The slot itself (open day, opening hours, not paused) is checked by
-- the server before calling; capacity is checked here, under the lock. 'ok' | 'full' | 'not_found'.
create or replace function public.oc_qd_request_visit(
  p_owner text, p_id text, p_name text, p_phone text, p_people integer, p_day date, p_slot text,
  p_note text, p_manage_hash text, p_hold_until timestamptz
) returns text language plpgsql set search_path = public as $$
declare
  v_cap integer;
begin
  select (projection->'visits'->'settings'->>'maxPeople')::integer into v_cap from oc_qd_owners where owner_id = p_owner for update;
  if not found or v_cap is null then return 'not_found'; end if;
  if oc_qd_slot_taken(p_owner, p_day, p_slot, null) + p_people > v_cap then return 'full'; end if;
  insert into oc_qd_visit_requests (id, owner_id, name, phone, people, day, slot, note, status, hold_until, manage_hash)
    values (p_id, p_owner, p_name, nullif(p_phone, ''), p_people, p_day, p_slot, nullif(p_note, ''), 'pending', p_hold_until, p_manage_hash);
  return 'ok';
end $$;

-- The mother approves or declines. Approving a request whose hold ran out re-checks capacity.
create or replace function public.oc_qd_decide_visit(p_owner text, p_id text, p_decision text)
returns text language plpgsql set search_path = public as $$
declare
  r oc_qd_visit_requests%rowtype;
  v_cap integer;
begin
  select (projection->'visits'->'settings'->>'maxPeople')::integer into v_cap from oc_qd_owners where owner_id = p_owner for update;
  if not found then return 'not_found'; end if;
  select * into r from oc_qd_visit_requests where id = p_id and owner_id = p_owner;
  if not found or r.status <> 'pending' then return 'not_found'; end if;
  if p_decision = 'decline' then
    update oc_qd_visit_requests set status = 'declined', decided_at = now() where id = p_id;
    return 'ok';
  end if;
  if p_decision <> 'approve' then return 'not_found'; end if;
  if r.hold_until <= now() and oc_qd_slot_taken(p_owner, r.day, r.slot, r.id) + r.people > coalesce(v_cap, 0) then return 'full'; end if;
  update oc_qd_visit_requests set status = 'approved', decided_at = now() where id = p_id;
  return 'ok';
end $$;

alter table public.oc_qd_owners enable row level security;
alter table public.oc_qd_links enable row level security;
alter table public.oc_qd_gift_claims enable row level security;
alter table public.oc_qd_visit_requests enable row level security;
alter table public.oc_qd_helpers enable row level security;

revoke all on function public.oc_qd_reserve_gift(text, text, integer, text, text, boolean, text, timestamptz, boolean) from public;
revoke all on function public.oc_qd_claim_action(text, text) from public;
revoke all on function public.oc_qd_slot_taken(text, date, text, text) from public;
revoke all on function public.oc_qd_request_visit(text, text, text, text, integer, date, text, text, text, timestamptz) from public;
revoke all on function public.oc_qd_decide_visit(text, text, text) from public;

do $$
declare r text;
begin
  foreach r in array array['anon', 'authenticated'] loop
    if exists (select 1 from pg_roles where rolname = r) then
      execute format('revoke all on public.oc_qd_owners, public.oc_qd_links, public.oc_qd_gift_claims, public.oc_qd_visit_requests, public.oc_qd_helpers from %I', r);
      execute format('revoke all on function public.oc_qd_reserve_gift(text, text, integer, text, text, boolean, text, timestamptz, boolean), public.oc_qd_claim_action(text, text), public.oc_qd_slot_taken(text, date, text, text), public.oc_qd_request_visit(text, text, text, text, integer, date, text, text, text, timestamptz), public.oc_qd_decide_visit(text, text, text) from %I', r);
    end if;
  end loop;
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant select, insert, update, delete on public.oc_qd_owners, public.oc_qd_links, public.oc_qd_gift_claims, public.oc_qd_visit_requests, public.oc_qd_helpers to service_role;
    grant execute on function public.oc_qd_reserve_gift(text, text, integer, text, text, boolean, text, timestamptz, boolean), public.oc_qd_claim_action(text, text), public.oc_qd_slot_taken(text, date, text, text), public.oc_qd_request_visit(text, text, text, text, integer, date, text, text, text, timestamptz), public.oc_qd_decide_visit(text, text, text) to service_role;
  end if;
end $$;
