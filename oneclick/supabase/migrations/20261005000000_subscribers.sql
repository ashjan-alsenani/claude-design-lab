-- One Click: newsletter and "notify me" sign-ups, stored in the private oc_leads table.
-- Same protection as before: RLS on, no policies, no privileges for the public API roles.
alter table public.oc_leads drop constraint if exists oc_leads_kind_check;
alter table public.oc_leads add constraint oc_leads_kind_check
  check (kind in ('custom_request', 'support_request', 'newsletter', 'product_notify'));
