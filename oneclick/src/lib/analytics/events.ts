/**
 * Analytics event dictionary. The single source of truth for what One Click measures.
 * Rules: no names, emails, phone numbers or free-text in properties. IDs and enums only.
 * Documented for humans in docs/ANALYTICS_EVENTS.md.
 */
export const analyticsEvents = {
  page_view: "Any page view (path, locale)",
  product_view: "Product page viewed (product_id)",
  demo_interaction: "First interaction with a live demo per page load (demo_id)",
  favorite_toggle: "Product saved/removed from favorites (product_id, saved)",
  signup: "Account created (method)",
  checkout_start: "Checkout page opened (product_id)",
  purchase: "Purchase completed (order_id, value_minor, currency) - server-side only",
  custom_request: "Custom solution request submitted (solution_type, budget_band)",
  newsletter_signup: "Newsletter form submitted (connected)",
  notify_me: "Launch notification requested (product_id)",
  campaign_landing: "Visit with UTM parameters (utm_source, utm_medium, utm_campaign)",
  product_usage: "Interactive product opened by an entitled customer (product_id)",
} as const;

export type AnalyticsEvent = keyof typeof analyticsEvents;
export type EventProps = Record<string, string | number | boolean | null>;
