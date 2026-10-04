import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircleIcon, WarningCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { isLocale, tr } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getSession, hasRole, authStatus } from "@/lib/auth/session";
import { catalog } from "@/lib/data/catalog";
import { getLeadStore } from "@/lib/data/leads";
import { getPaymentProvider } from "@/lib/payments";
import { businessSettings } from "@/content/site";
import { launchPlan, utmLink } from "@/content/social";
import { formatMoney } from "@/lib/money";
import { isEmailConfigured } from "@/lib/env";
import { pageMetadata, siteUrl } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return pageMetadata({ locale, path: "/admin", title: "Admin", noindex: true });
}

// Admin uses plain business language. English-first for now (owner preference to confirm).
export default async function AdminPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const session = await getSession();
  // Server-side authorization: no admin role, no admin page (404 hides its existence).
  if (!hasRole(session, "admin")) notFound();
  const d = getDictionary(locale);
  const store = getLeadStore();
  const [products, requests, support] = await Promise.all([catalog.listProducts({ includeArchived: true }), store.list("custom_request"), store.list("support_request")]);
  const payment = getPaymentProvider();

  const alerts = [
    { ok: payment.live, label: "Payment provider", detail: payment.live ? payment.displayName : "Not connected. Waiting for owner's bank decision." },
    { ok: authStatus() === "connected", label: "Customer accounts & database", detail: authStatus() === "connected" ? "Connected (Supabase)" : authStatus() === "demo" ? "Local SANDBOX (demo mode). Production uses Supabase." : "Not connected: set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and LICENSING_SECRET. Sign-in stays locked until then." },
    { ok: isEmailConfigured(), label: "Transactional email", detail: isEmailConfigured() ? "Connected (Resend)" : "Not connected: set EMAIL_PROVIDER=resend, RESEND_API_KEY and EMAIL_FROM. Sign-in codes cannot be delivered until then." },
    { ok: businessSettings.showLegalIdentity, label: "Business identity (CR, address)", detail: "Hidden until owner provides final details." },
    { ok: false, label: "Legal pages", detail: "Drafts. Lawyer review required before launch." },
    { ok: false, label: "Analytics", detail: "Consent-ready. No provider connected." },
  ];

  const kpis = [
    { label: "Revenue (30 days)", value: formatMoney({ amountMinor: 0, currency: "OMR" }, "en"), note: "No payments possible yet" },
    { label: "Orders", value: "0", note: "Payment not connected" },
    { label: "Custom requests", value: String(requests.length), note: store.mode === "local-demo" ? "Local dev store" : "" },
    { label: "Support messages", value: String(support.length), note: store.mode === "local-demo" ? "Local dev store" : "" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8" dir="ltr" lang="en">
      {session?.demo && (
        <p role="note" className="mb-6 rounded-[var(--radius-md)] border border-dashed border-warning/60 bg-accent-soft px-4 py-3 text-sm text-ink-soft">
          {d.admin.demoBanner}
        </p>
      )}
      <h1 className="text-3xl font-semibold tracking-tight text-ink">Business command center</h1>
      <p className="mt-1 text-ink-soft">What needs your attention, at a glance.</p>
      <p className="mt-4">
        <Link href={`/${locale}/admin/licensing`} className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-on-primary">
          Licensing & access
        </Link>
      </p>

      <section aria-labelledby="h-kpi" className="mt-8">
        <h2 id="h-kpi" className="sr-only">Key numbers</h2>
        <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {kpis.map((k) => (
            <div key={k.label} className="rounded-[var(--radius-lg)] border border-line bg-surface p-5">
              <dt className="text-sm text-muted">{k.label}</dt>
              <dd className="mt-1 text-2xl font-semibold tabular text-ink">{k.value}</dd>
              {k.note && <dd className="mt-1 text-xs text-muted">{k.note}</dd>}
            </div>
          ))}
        </dl>
      </section>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <section aria-labelledby="h-alerts" className="min-w-0">
          <h2 id="h-alerts" className="text-lg font-semibold text-ink">
            Launch readiness
          </h2>
          <ul className="mt-4 space-y-2">
            {alerts.map((a) => (
              <li key={a.label} className="flex gap-3 rounded-[var(--radius-md)] border border-line bg-surface p-3.5">
                {a.ok ? <CheckCircleIcon size={22} weight="fill" className="shrink-0 text-success" /> : <WarningCircleIcon size={22} weight="fill" className="shrink-0 text-warning" />}
                <div>
                  <p className="text-sm font-medium text-ink">{a.label}</p>
                  <p className="text-sm text-muted">{a.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="h-requests" className="min-w-0">
          <h2 id="h-requests" className="text-lg font-semibold text-ink">
            Custom project requests
          </h2>
          {requests.length === 0 ? (
            <p className="mt-4 rounded-[var(--radius-md)] border border-dashed border-line-strong p-5 text-sm text-muted">No requests yet. New submissions from the Custom Solutions page appear here.</p>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-[var(--radius-lg)] border border-line bg-surface">
              <table className="w-full min-w-[520px] text-sm">
                <thead className="bg-bg-sunken text-start text-xs text-muted">
                  <tr>
                    <th className="px-4 py-2.5 text-start font-medium">Reference</th>
                    <th className="px-4 py-2.5 text-start font-medium">Customer</th>
                    <th className="px-4 py-2.5 text-start font-medium">Type</th>
                    <th className="px-4 py-2.5 text-start font-medium">Budget</th>
                    <th className="px-4 py-2.5 text-start font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {requests.slice(0, 8).map((r) => (
                    <tr key={r.reference}>
                      <td className="px-4 py-3 font-mono text-xs text-ink">{r.reference}</td>
                      <td className="px-4 py-3 text-ink-soft">{String(r.data.name ?? "")}</td>
                      <td className="px-4 py-3 text-ink-soft">{String(r.data.solutionType ?? "")}</td>
                      <td className="px-4 py-3 text-ink-soft">{String(r.data.budget ?? "")}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-medium text-primary">{r.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <section aria-labelledby="h-products" className="mt-12">
        <h2 id="h-products" className="text-lg font-semibold text-ink">
          Products
        </h2>
        <div className="mt-4 overflow-x-auto rounded-[var(--radius-lg)] border border-line bg-surface">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-bg-sunken text-xs text-muted">
              <tr>
                <th className="px-4 py-2.5 text-start font-medium">Product</th>
                <th className="px-4 py-2.5 text-start font-medium">Status</th>
                <th className="px-4 py-2.5 text-start font-medium">Price</th>
                <th className="px-4 py-2.5 text-start font-medium">Access</th>
                <th className="px-4 py-2.5 text-start font-medium">Featured</th>
                <th className="px-4 py-2.5 text-start font-medium">Content</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-medium text-ink">{tr(p.name, "en")}</td>
                  <td className="px-4 py-3 text-ink-soft">{d.status[p.status]}</td>
                  <td className="px-4 py-3 tabular text-ink-soft">{p.price ? formatMoney(p.price, "en") : "Free"}</td>
                  <td className="px-4 py-3 text-ink-soft">{p.access}</td>
                  <td className="px-4 py-3 text-ink-soft">{p.featured ? "Yes" : "No"}</td>
                  <td className="px-4 py-3 text-ink-soft">{p.sample ? "Sample, needs approval" : "Approved"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-muted">Editing opens when the database is connected. Prices are stored per product and per currency.</p>
      </section>

      <section aria-labelledby="h-social" className="mt-12">
        <h2 id="h-social" className="text-lg font-semibold text-ink">
          Instagram queue (30-day launch plan)
        </h2>
        <p className="mt-1 text-sm text-muted">Every item needs your approval before publishing. Instagram is not connected.</p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {launchPlan.slice(0, 9).map((s) => (
            <li key={s.day} className="min-w-0 rounded-[var(--radius-md)] border border-line bg-surface p-4">
              <div className="flex items-center justify-between text-xs text-muted">
                <span>
                  Day {s.day} · {s.format} · {s.language}
                </span>
                <span className="rounded-full bg-bg-sunken px-2 py-0.5 font-medium">{s.status}</span>
              </div>
              <p className="mt-2 text-sm font-medium text-ink">{s.hook.en}</p>
              <p className="mt-1 text-sm text-ink-soft" dir="rtl" lang="ar">
                {s.hook.ar}
              </p>
              <p className="mt-2 truncate font-mono text-[11px] text-muted" title={utmLink(siteUrl, "ar", s)}>
                {utmLink(siteUrl, "ar", s).replace(siteUrl, "")}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="h-settings" className="mt-12">
        <h2 id="h-settings" className="text-lg font-semibold text-ink">
          Business settings
        </h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries({
            "Company legal name": businessSettings.legalName,
            "Commercial Registration": businessSettings.commercialRegistration,
            "VAT number": businessSettings.vatNumber,
            "Business address": businessSettings.address,
            "Support email": businessSettings.supportEmail,
            "Business phone": businessSettings.businessPhone,
          }).map(([k, v]) => (
            <div key={k} className="rounded-[var(--radius-md)] border border-line bg-surface p-4">
              <dt className="text-xs text-muted">{k}</dt>
              <dd className="mt-1 text-sm text-ink">{v ?? <span className="text-muted">Not provided yet (hidden publicly)</span>}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
