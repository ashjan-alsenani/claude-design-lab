-- One Click: one active sign-up per email (per product for "notify me"), enforced by the database
-- itself, not only by the app's check of recent rows. Emails are stored lower-cased by the app;
-- lower() keeps the rule safe even if that ever changes.
create unique index if not exists oc_leads_one_signup
  on public.oc_leads (kind, lower(data->>'email'), coalesce(data->>'productId', ''))
  where kind in ('newsletter', 'product_notify') and status = 'subscribed';
