import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { products } from "@/content/products";
import { currentContext, licensing, licensingMode } from "@/lib/licensing/server";
import type { LicenseStatus } from "@/lib/licensing/types";
import { pageMetadata } from "@/lib/seo";
import { StatusPill, licenseTone } from "@/components/account/StatusPill";
import { grantAction, licenseAction, policyAction, productSecurityAction } from "./actions";
import { Card, Confirm, Flash, Hidden, btn, field, when } from "./ui";

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return pageMetadata({ locale, path: "/admin/licensing", title: "Licensing & access", noindex: true });
}

const tabs = [
  { key: "licenses", label: "Licenses" },
  { key: "products", label: "Product security" },
  { key: "activity", label: "Activity & alerts" },
  { key: "policy", label: "Rules" },
] as const;

export default async function AdminLicensingPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const ctx = await currentContext();
  if (!ctx?.roles.includes("admin")) notFound();
  const sp = await searchParams;
  const tab = tabs.find((t) => t.key === sp.tab)?.key ?? "licenses";
  const { engine } = licensing();
  const overview = await engine.adminOverview(ctx);
  const back = `/${locale}/admin/licensing`;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 lg:px-8" dir="ltr" lang="en">
      {licensingMode() === "sandbox" && (
        <p role="note" className="mb-6 rounded-[var(--radius-md)] border-2 border-dashed border-warning/60 bg-accent-soft px-4 py-3 text-sm font-medium text-ink">
          SANDBOX: fictional data on this computer only. Payments are simulated. Production stays locked until the database is connected.
        </p>
      )}
      <p className="text-sm">
        <Link href={`/${locale}/admin`} className="text-primary underline underline-offset-4">
          Command center
        </Link>
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Licensing & access</h1>
      <p className="mt-1 text-ink-soft">Who owns what, on which devices, and everything that happened. Every change here is audit-logged.</p>

      <dl className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
        {[
          ["Active", overview.licenses.active],
          ["Pending payment", overview.licenses.pending],
          ["Waiting for claim", overview.licenses.unclaimed],
          ["Suspended", overview.licenses.suspended],
          ["Revoked", overview.licenses.revoked],
          ["Customers", overview.customers],
          ["Alerts", overview.suspicious],
        ].map(([k, v]) => (
          <div key={k} className="rounded-[var(--radius-lg)] border border-line bg-surface p-4">
            <dt className="text-xs text-muted">{k}</dt>
            <dd className="mt-1 text-2xl font-semibold tabular text-ink">{v}</dd>
          </div>
        ))}
      </dl>

      <nav aria-label="Licensing sections" className="mt-8 flex gap-1 overflow-x-auto border-b border-line">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`${back}?tab=${t.key}`}
            aria-current={t.key === tab ? "page" : undefined}
            className="whitespace-nowrap border-b-2 border-transparent px-4 py-2.5 text-sm text-ink-soft aria-[current=page]:border-primary aria-[current=page]:font-semibold aria-[current=page]:text-ink"
          >
            {t.label}
          </Link>
        ))}
      </nav>
      <Flash sp={sp} />

      <div className="mt-6">
        {tab === "licenses" && <LicensesTab locale={locale} sp={sp} back={back} />}
        {tab === "products" && <ProductsTab locale={locale} back={back} />}
        {tab === "activity" && <ActivityTab locale={locale} sp={sp} />}
        {tab === "policy" && <PolicyTab locale={locale} back={back} />}
      </div>
    </div>
  );
}

async function LicensesTab({ locale, sp, back }: { locale: string; sp: Record<string, string | undefined>; back: string }) {
  const ctx = await currentContext();
  const status = (["all", "active", "pending", "suspended", "revoked", "expired"] as const).find((s) => s === sp.status) ?? "all";
  const rows = await licensing().engine.adminLicenses(ctx, { q: sp.q, status: status as LicenseStatus | "all" });
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0">
        <form className="flex flex-wrap gap-2" role="search">
          <input type="hidden" name="tab" value="licenses" />
          <input name="q" defaultValue={sp.q} placeholder="Email, order, license or product" aria-label="Search licenses" className={`${field} min-w-0 flex-1`} />
          <select name="status" defaultValue={status} aria-label="Status" className={field}>
            {["all", "active", "pending", "suspended", "revoked", "expired"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <button className={btn}>Search</button>
        </form>
        <div className="mt-4 overflow-x-auto rounded-[var(--radius-lg)] border border-line bg-surface">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-bg-sunken text-xs text-muted">
              <tr>
                <th className="px-3 py-2 font-medium">Product</th>
                <th className="px-3 py-2 font-medium">Owner</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Order / payment</th>
                <th className="px-3 py-2 font-medium">Action (reason required)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-muted">
                    No licenses yet.
                  </td>
                </tr>
              )}
              {rows.map((r) => (
                <tr key={r.license.id} className="align-top">
                  <td className="px-3 py-3">
                    <p className="font-medium text-ink">{r.productName}</p>
                    <p className="text-xs text-muted">
                      {r.license.licenseType} · {r.license.source}
                      {r.license.parentLicenseId ? " (bundle)" : ""}
                    </p>
                  </td>
                  <td className="px-3 py-3">
                    {r.userId ? (
                      <Link href={`/${locale}/admin/licensing/users/${r.userId}`} className="text-primary underline underline-offset-4">
                        {r.accountEmail}
                      </Link>
                    ) : (
                      <span className="text-ink-soft">Not claimed yet</span>
                    )}
                    <p className="text-xs text-muted">Purchase email: {r.license.purchaseEmail}</p>
                    {r.userId && <p className="text-xs text-muted">{r.devices} trusted device(s)</p>}
                  </td>
                  <td className="px-3 py-3">
                    <StatusPill tone={licenseTone(r.license.status)}>{r.license.status}</StatusPill>
                    {r.license.statusReason && <p className="mt-1 max-w-[160px] text-xs text-muted">{r.license.statusReason}</p>}
                  </td>
                  <td className="px-3 py-3 text-xs text-ink-soft">
                    <p>{r.license.orderId ?? "manual"}</p>
                    <p>Payment: {r.paymentStatus ?? "-"}</p>
                    <p className="text-muted">Purchased {when(r.purchasedAt)}</p>
                    <p className="text-muted">Last opened {r.license.lastAccessedAt ? when(r.license.lastAccessedAt) : "never"}</p>
                  </td>
                  <td className="px-3 py-3">
                    <form action={licenseAction} className="flex flex-col gap-2">
                      <Hidden locale={locale} back={back} licenseId={r.license.id} />
                      <div className="flex gap-2">
                        <select name="action" aria-label="Action" className={field} defaultValue="">
                          <option value="" disabled>
                            Choose…
                          </option>
                          <option value="suspend">Suspend</option>
                          <option value="reactivate">Reactivate</option>
                          <option value="revoke">Revoke</option>
                        </select>
                        <input name="reason" required minLength={3} placeholder="Reason" aria-label="Reason" className={`${field} min-w-0 flex-1`} />
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <Confirm />
                        <button className={btn}>Apply</button>
                      </div>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Card title="Grant a license">
        <p className="text-sm text-ink-soft">For support, gifts or recovery. The customer receives an email and the license is bound to that email address once verified.</p>
        <form action={grantAction} className="mt-4 space-y-3">
          <Hidden locale={locale} back={back} />
          <input name="email" type="email" required placeholder="customer@example.com" aria-label="Customer email" className={`${field} w-full`} />
          <select name="productId" required aria-label="Product" className={`${field} w-full`}>
            {products
              .filter((p) => p.price !== null)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name.en}
                </option>
              ))}
          </select>
          <input name="reason" required minLength={3} placeholder="Reason" aria-label="Reason" className={`${field} w-full`} />
          <button className={btn}>Grant</button>
        </form>
      </Card>
    </div>
  );
}

async function ProductsTab({ locale, back }: { locale: string; back: string }) {
  const list = await licensing().engine.productSecurityList();
  const policy = await licensing().engine.policy();
  return (
    <div>
      <p className="max-w-3xl text-sm text-ink-soft">
        Every paid product uses the licensing engine automatically. Change how a product is delivered and protected here, with no code changes. Empty device limit = global default ({policy.defaultDeviceLimit}). Empty duration = lifetime.
      </p>
      <ul className="mt-4 space-y-3">
        {list.map(({ product, settings, customized }) => (
          <li key={product.id} id={product.id} className="rounded-[var(--radius-lg)] border border-line bg-surface p-4">
            <form action={productSecurityAction} className="grid gap-3 md:grid-cols-[180px_1fr] md:items-center">
              <Hidden locale={locale} back={back} productId={product.id} />
              <div>
                <p className="font-semibold text-ink">{product.name.en}</p>
                <p className="text-xs text-muted">
                  {product.price ? `${(product.price.amountMinor / 1000).toFixed(3)} ${product.price.currency}` : "Free"} · {customized ? "customized" : "defaults"}
                </p>
              </div>
              <div className="flex flex-wrap items-end gap-2 text-xs text-muted">
                <label className="flex flex-col gap-1">
                  Access
                  <select name="accessType" defaultValue={settings.accessType} className={field}>
                    {["INTERACTIVE_PRIVATE", "SECURE_DOWNLOAD", "HYBRID", "PUBLIC_FREE", "CUSTOM_SERVICE"].map((a) => (
                      <option key={a}>{a}</option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1">
                  Devices
                  <input name="deviceLimit" type="number" min={1} max={20} defaultValue={settings.deviceLimit ?? ""} placeholder={`${policy.defaultDeviceLimit}`} className={`${field} w-20`} />
                </label>
                <label className="flex flex-col gap-1">
                  License
                  <select name="licenseType" defaultValue={settings.licenseType} className={field}>
                    {["personal", "commercial", "team"].map((a) => (
                      <option key={a}>{a}</option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1">
                  Days
                  <input name="licenseDurationDays" type="number" min={1} max={3650} defaultValue={settings.licenseDurationDays ?? ""} placeholder="∞" className={`${field} w-20`} />
                </label>
                <label className="flex flex-col gap-1">
                  Max downloads
                  <input name="downloadLimit" type="number" min={1} max={1000} defaultValue={settings.downloadLimit ?? ""} placeholder="∞" className={`${field} w-24`} />
                </label>
                <label className="flex h-10 items-center gap-1.5">
                  <input type="checkbox" name="downloadEnabled" defaultChecked={settings.downloadEnabled} className="size-4" /> Downloads
                </label>
                <label className="flex h-10 items-center gap-1.5">
                  <input type="checkbox" name="watermark" defaultChecked={settings.watermark} className="size-4" /> Watermark
                </label>
                <label className="flex flex-col gap-1">
                  Status
                  <select name="status" defaultValue={settings.status} className={field}>
                    <option value="active">active</option>
                    <option value="paused">paused</option>
                  </select>
                </label>
                <button className={btn}>Save</button>
              </div>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}

async function ActivityTab({ locale, sp }: { locale: string; sp: Record<string, string | undefined> }) {
  const ctx = await currentContext();
  const suspicious = sp.only === "alerts";
  const [logs, audit] = await Promise.all([licensing().engine.adminActivity(ctx, { suspiciousOnly: suspicious, limit: 80 }), licensing().engine.adminAudit(ctx)]);
  const base = `/${locale}/admin/licensing?tab=activity`;
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card title={suspicious ? "Security alerts" : "Access log"}>
        <p className="mb-3 flex gap-3 text-sm">
          <Link href={base} className={suspicious ? "text-primary underline" : "font-semibold text-ink"}>
            All
          </Link>
          <Link href={`${base}&only=alerts`} className={suspicious ? "font-semibold text-ink" : "text-primary underline"}>
            Alerts only
          </Link>
        </p>
        <ul className="max-h-[560px] divide-y divide-line overflow-y-auto text-sm">
          {logs.length === 0 && <li className="py-3 text-muted">Nothing yet.</li>}
          {logs.map((l) => (
            <li key={l.id} className="flex flex-wrap items-baseline justify-between gap-2 py-2">
              <span>
                <span className={l.outcome === "suspicious" ? "font-semibold text-warning" : l.outcome === "denied" ? "text-error" : "text-ink"}>{l.event.replace(/_/g, " ")}</span>
                {l.reason && <span className="text-muted"> · {l.reason.replace(/_/g, " ")}</span>}
                {l.email && <span className="text-muted"> · {l.email}</span>}
                {l.productId && <span className="text-muted"> · {l.productId}</span>}
              </span>
              <span className="text-xs text-muted">{when(l.at)}</span>
            </li>
          ))}
        </ul>
      </Card>
      <Card title="Audit log (admin & system changes)">
        <ul className="max-h-[560px] divide-y divide-line overflow-y-auto text-sm">
          {audit.length === 0 && <li className="py-3 text-muted">Nothing yet.</li>}
          {audit.map((a) => (
            <li key={a.id} className="py-2">
              <p className="flex justify-between gap-2">
                <span className="font-medium text-ink">{a.action.replace(/_/g, " ")}</span>
                <span className="text-xs text-muted">{when(a.at)}</span>
              </p>
              <p className="text-xs text-muted">
                {a.entity} {a.entityId} · by {a.actorId}
                {a.reason ? ` · "${a.reason}"` : ""}
              </p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

async function PolicyTab({ locale, back }: { locale: string; back: string }) {
  const p = await licensing().engine.policy();
  const num = (name: keyof typeof p, label: string, help: string) => (
    <label className="flex flex-col gap-1 text-sm text-ink">
      {label}
      <input name={name} type="number" defaultValue={p[name] as number} className={field} />
      <span className="text-xs text-muted">{help}</span>
    </label>
  );
  const pick = (name: "onRefund" | "onChargeback" | "onCancel", label: string) => (
    <label className="flex flex-col gap-1 text-sm text-ink">
      {label}
      <select name={name} defaultValue={p[name]} className={field}>
        <option value="revoke">Revoke access</option>
        <option value="suspend">Suspend (review first)</option>
      </select>
    </label>
  );
  return (
    <form action={policyAction} className="max-w-4xl space-y-6">
      <Hidden locale={locale} back={back} />
      <Card title="Devices & sessions">
        <div className="grid gap-4 sm:grid-cols-3">
          {num("defaultDeviceLimit", "Trusted devices per customer", "Recommended: 2")}
          {num("maxActiveSessions", "Max signed-in sessions", "Oldest is signed out beyond this")}
          {num("sessionDays", "Stay signed in (days)", "On trusted devices")}
        </div>
      </Card>
      <Card title="Verification codes & links">
        <div className="grid gap-4 sm:grid-cols-3">
          {num("otpTtlMinutes", "Code lifetime (minutes)", "Recommended: 10")}
          {num("otpMaxAttempts", "Wrong tries before lock", "Recommended: 5")}
          {num("otpPerEmailPerHour", "Codes per email per hour", "Rate limit")}
          {num("claimLinkDays", "Claim email link (days)", "The link only starts verification")}
          {num("downloadLinkSeconds", "Download link (seconds)", "Signed, session-bound")}
        </div>
      </Card>
      <Card title="Refunds, chargebacks, cancellations">
        <div className="grid gap-4 sm:grid-cols-3">
          {pick("onRefund", "When refunded")}
          {pick("onChargeback", "When disputed (chargeback)")}
          {pick("onCancel", "When cancelled after payment")}
        </div>
      </Card>
      <button className={btn}>Save rules</button>
    </form>
  );
}
