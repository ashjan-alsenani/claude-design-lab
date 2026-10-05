import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircleIcon, WarningCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { isLocale, tr } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getSession, hasRole, authStatus } from "@/lib/auth/session";
import { catalog } from "@/lib/data/catalog";
import { getLeadStore, isOpenLead } from "@/lib/data/leads";
import { getPaymentProvider } from "@/lib/payments";
import { businessSettings } from "@/content/site";
import { launchPlan, utmLink } from "@/content/social";
import { formatMoney } from "@/lib/money";
import { isEmailConfigured } from "@/lib/env";
import { pageMetadata, siteUrl } from "@/lib/seo";
import { currentContext, licensing } from "@/lib/licensing/server";
import { createTestLinkAction } from "./licensing/actions";

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return pageMetadata({ locale, path: "/admin", title: "Admin", noindex: true });
}

// Admin uses plain business language. English-first for now (owner preference to confirm).
export default async function AdminPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
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

  const biz = await licensing().engine.adminBusiness(await currentContext());
  const open = (list: typeof requests) => list.filter(isOpenLead).length;
  const kpis = [
    { label: "Revenue (30 days)", value: formatMoney({ amountMinor: biz.revenueMinor30d, currency: "OMR" }, "en"), note: payment.live ? `All time: ${formatMoney({ amountMinor: biz.revenueMinorAll, currency: "OMR" }, "en")}` : "Payments not connected yet" },
    { label: "Paid orders (30 days)", value: String(biz.paidOrders30d), note: biz.testOrders ? `${biz.testOrders} test order(s) not counted` : "" },
    { label: "Customers", value: String(biz.customers), note: `${biz.newCustomers30d} new in 30 days` },
    { label: "Open requests & messages", value: String(open(requests) + open(support)), note: `${requests.length + support.length} in total` },
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
        <span className="flex flex-wrap gap-2">
          <Link href={`/${locale}/admin/licensing`} className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-on-primary">
            Customers, orders & access
          </Link>
          <Link href={`/${locale}/admin/inbox`} className="inline-flex h-10 items-center rounded-full border-2 border-line-strong px-5 text-sm font-semibold text-ink">
            Inbox
          </Link>
          <Link href={`/${locale}/admin/subscribers`} className="inline-flex h-10 items-center rounded-full border-2 border-line-strong px-5 text-sm font-semibold text-ink">
            Subscribers
          </Link>
        </span>
      </p>

      <section id="test-journey" aria-labelledby="h-test" className="mt-8 rounded-[var(--radius-lg)] border-2 border-dashed border-lilac/60 bg-surface p-5">
        <h2 id="h-test" className="text-lg font-semibold text-ink">
          Test the customer journey (no real payment)
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-ink-soft">
          Creates a link that works for 2 hours. Open it in a private window, signed out, like a new visitor: browse, press Buy, enter an email you can read,
          and simulate the payment. Then follow the real email, code and product. Test orders are marked SANDBOX; revoke them in Licensing &amp; access when done.
        </p>
        {sp.testlink ? (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium text-ink">Your test link (valid 2 hours, don&apos;t share it):</p>
            <p className="break-all rounded-[var(--radius-md)] bg-bg-sunken px-3 py-2 font-mono text-xs text-ink" data-testid="test-link">
              {`${siteUrl.replace(/\/$/, "")}/api/test-purchase?t=${encodeURIComponent(sp.testlink)}&locale=ar`}
            </p>
            <p className="text-xs text-muted">To end test mode early in that window, open {`${siteUrl.replace(/\/$/, "")}/api/test-purchase?end=1&locale=ar`}</p>
          </div>
        ) : sp.test === "sandbox" ? (
          <p className="mt-4 text-sm text-ink-soft">Local sandbox: every checkout already offers simulated payment.</p>
        ) : (
          <form action={createTestLinkAction} className="mt-4">
            <input type="hidden" name="locale" value={locale} />
            <button className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-on-primary">Create a test-purchase link</button>
          </form>
        )}
      </section>

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

        <section aria-labelledby="h-requests" className="rounded-[var(--radius-lg)] border border-line bg-surface p-5">
          <h2 id="h-requests" className="text-lg font-semibold text-ink">
            Inbox
          </h2>
          <p className="mt-1 text-sm text-ink-soft">Customer messages and custom solution requests. You also get an email for each new one.</p>
          <ul className="mt-4 space-y-2 text-sm">
            {[...support.map((r) => ({ r, label: "Message" })), ...requests.map((r) => ({ r, label: "Custom request" }))]
              .filter(({ r }) => isOpenLead(r))
              .sort((a, b) => b.r.createdAt.localeCompare(a.r.createdAt))
              .slice(0, 6)
              .map(({ r, label }) => (
                <li key={r.reference} className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-2">
                  <span className="min-w-0">
                    <span className="text-muted">{label} · </span>
                    <span className="text-ink">{String(r.data.name ?? "")}</span>
                  </span>
                  <span className="font-mono text-xs text-muted">{r.reference}</span>
                </li>
              ))}
            {open(support) + open(requests) === 0 && <li className="text-muted">Nothing waiting. New messages and requests appear here.</li>}
          </ul>
          <Link href={`/${locale}/admin/inbox`} className="mt-4 inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-on-primary">
            Open inbox{open(support) + open(requests) > 0 ? ` (${open(support) + open(requests)})` : ""}
          </Link>
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
        <p className="mt-2 text-xs text-muted">Names, prices and descriptions are part of the product catalog and change when products are added or edited. To pause a product or change how it is delivered (device limit, downloads, license length), use Customers, orders & access → Product security.</p>
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
