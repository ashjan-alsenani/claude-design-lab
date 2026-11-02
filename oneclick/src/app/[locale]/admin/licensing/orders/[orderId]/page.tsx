import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { currentContext, licensing } from "@/lib/licensing/server";
import { StatusPill, licenseTone } from "@/components/account/StatusPill";
import { formatMoney } from "@/lib/money";
import { Card, when } from "../../ui";
import { PrintButton } from "../../PrintButton";

type Props = { params: Promise<{ locale: string; orderId: string }> };

export const metadata: Metadata = { robots: { index: false, follow: false } };

const eventLabel: Record<string, string> = {
  license_activated: "Access activated after confirmed payment",
  access_email_sent: "Access email sent to the customer",
  access_email_failed: "Access email could not be sent",
  license_claimed: "Customer claimed the product to their account",
  signin: "Customer signed in",
  signout: "Customer signed out",
  device_added: "New device verified by email code",
  product_open: "Customer opened the product",
  download: "Customer downloaded a file",
  payment_event: "Payment update from the provider",
};

/**
 * Delivery evidence for one order: what was paid, when access was granted and emailed, and when the
 * customer actually used it. Printable (or saved as PDF) to answer a bank dispute.
 */
export default async function OrderEvidencePage({ params }: Props) {
  const { locale, orderId } = await params;
  if (!isLocale(locale)) notFound();
  const ctx = await currentContext();
  if (!ctx?.roles.includes("admin")) notFound();
  const ev = await licensing().engine.adminOrderEvidence(ctx, decodeURIComponent(orderId));
  if (!ev) notFound();
  const { order } = ev;
  const opened = ev.licenses.some((l) => l.firstAccessedAt || l.firstDownloadedAt);
  const json = JSON.stringify({ generatedAt: new Date().toISOString(), ...ev }, null, 2);
  const row = (k: string, v: React.ReactNode) => (
    <div className="grid grid-cols-[11rem_1fr] gap-3 border-b border-line py-2 last:border-0">
      <dt className="text-muted">{k}</dt>
      <dd className="min-w-0 break-words text-ink">{v}</dd>
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl px-4 pb-10 pt-8 sm:px-6 lg:px-8" dir="ltr" lang="en">
      <p className="text-sm print:hidden">
        <Link href={`/${locale}/admin/licensing?tab=orders`} className="text-primary underline underline-offset-4">
          Orders
        </Link>
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Order evidence · <span className="font-mono">{order.id}</span></h1>
      <p className="mt-1 text-sm text-ink-soft">
        Proof of payment and delivery for this order. All times are UTC. Generated {when(new Date().toISOString())}.
      </p>
      <div className="mt-4 flex flex-wrap gap-2 print:hidden">
        <PrintButton label="Print or save as PDF" />
        <a href={`data:application/json;charset=utf-8,${encodeURIComponent(json)}`} download={`oneclick-evidence-${order.id}.json`} className="inline-flex h-10 items-center rounded-full border border-line-strong px-4 text-sm font-semibold text-ink">
          Download data (JSON)
        </a>
      </div>

      <p className={`mt-6 rounded-[var(--radius-md)] px-4 py-3 text-sm font-medium ${opened ? "bg-primary-soft text-ink" : "bg-accent-soft text-ink"}`}>
        {opened
          ? `Delivered and used: first opened ${when(ev.licenses.map((l) => l.firstAccessedAt ?? l.firstDownloadedAt).filter(Boolean).sort()[0])} UTC.`
          : "Not opened or downloaded yet. Under the refund policy the customer can still cancel for a full refund."}
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Order and payment">
          <dl className="text-sm">
            {row("Order number", <span className="font-mono">{order.id}</span>)}
            {row("Status", <StatusPill tone={order.status === "paid" ? "good" : order.status === "pending" ? "warn" : "bad"}>{order.status}</StatusPill>)}
            {row("Amount", formatMoney({ amountMinor: order.totalMinor, currency: order.currency }, "en"))}
            {row("Products", ev.items.map((i) => i.name).join(", "))}
            {row("Created", when(order.createdAt))}
            {row("Paid (confirmed by provider)", when(order.paidAt))}
            {row("Payment provider", order.sandbox ? `${order.provider} (TEST)` : order.provider)}
            {row("Provider reference", <span className="font-mono">{order.externalPaymentReference ?? "—"}</span>)}
            {row("Purchase email", order.purchaseEmail)}
          </dl>
        </Card>
        <Card title="Customer account">
          {ev.customer ? (
            <dl className="text-sm">
              {row("Email", ev.customer.email)}
              {row("Name", ev.customer.name ?? "—")}
              {row("Account created", when(ev.customer.createdAt))}
              {row("Email verified", when(ev.customer.emailVerifiedAt ?? undefined))}
            </dl>
          ) : (
            <p className="text-sm text-muted">The customer has not claimed this order to an account yet.</p>
          )}
        </Card>
      </div>

      <div className="mt-6">
        <Card title="Payment events from the provider">
          {ev.payments.length === 0 ? (
            <p className="text-sm text-muted">No payment events recorded.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-muted">
                <tr><th className="py-1 pr-3 font-medium">Received</th><th className="py-1 pr-3 font-medium">Event</th><th className="py-1 pr-3 font-medium">Amount</th><th className="py-1 pr-3 font-medium">Reference</th><th className="py-1 font-medium">Result</th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {ev.payments.map((p) => (
                  <tr key={p.eventId}>
                    <td className="py-2 pr-3">{when(p.receivedAt)}</td>
                    <td className="py-2 pr-3">{p.type}</td>
                    <td className="py-2 pr-3 tabular">{p.amountMinor !== undefined && p.currency ? formatMoney({ amountMinor: p.amountMinor, currency: p.currency as never }, "en") : "—"}</td>
                    <td className="py-2 pr-3 font-mono text-xs">{p.providerReference ?? "—"}</td>
                    <td className="py-2">{p.outcome}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      <div className="mt-6">
        <Card title="Access and use of the product">
          <div className="space-y-5">
            {ev.licenses.map((l) => (
              <div key={l.id} className="rounded-[var(--radius-md)] border border-line p-4">
                <p className="flex flex-wrap items-center gap-2 font-semibold text-ink">
                  {l.productName} <StatusPill tone={licenseTone(l.status)}>{l.status}</StatusPill>
                </p>
                <dl className="mt-2 text-sm">
                  {row("Access activated", when(l.activatedAt))}
                  {row("First opened", when(l.firstAccessedAt))}
                  {row("Last opened", when(l.lastAccessedAt))}
                  {row("Times opened", String(l.accessCount ?? 0))}
                  {row("First download", when(l.firstDownloadedAt))}
                  {row("Devices", l.devices.length ? l.devices.map((d) => `${d.name} (first ${when(d.firstVerifiedAt)}, last ${when(d.lastUsedAt)})`).join(" · ") : "—")}
                </dl>
                {l.openTrail && l.openTrail.length > 0 && (
                  <details className="mt-2 text-sm">
                    <summary className="cursor-pointer text-primary">Opens on record ({l.openTrail.length})</summary>
                    <ul className="mt-2 grid gap-1 sm:grid-cols-2">
                      {l.openTrail.map((t, i) => (
                        <li key={i} className="text-ink-soft">{when(t.at)}{t.device ? ` · ${t.device}` : ""}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            ))}
            {ev.downloads.length > 0 && (
              <p className="text-sm text-ink-soft">Downloads: {ev.downloads.map((d) => `${d.file} (${when(d.at)})`).join(", ")}</p>
            )}
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <Card title="Timeline">
          {ev.timeline.length === 0 ? (
            <p className="text-sm text-muted">No recent activity in the working log. Older entries are kept in the database history.</p>
          ) : (
            <ol className="divide-y divide-line text-sm">
              {ev.timeline.map((t, i) => (
                <li key={i} className="grid grid-cols-[9.5rem_1fr] gap-3 py-2">
                  <span className="tabular text-muted">{when(t.at)}</span>
                  <span className="text-ink">
                    {eventLabel[t.event] ?? t.event}
                    {t.product ? ` · ${t.product}` : ""}
                    {t.device ? ` · ${t.device}` : ""}
                    {t.outcome === "denied" || t.outcome === "suspicious" ? ` · ${t.outcome}${t.reason ? ` (${t.reason})` : ""}` : ""}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>
      <p className="mt-6 text-xs text-muted">
        One Click never sees or stores card details: customers pay on the provider&apos;s secure page. Access is granted only after the provider confirms the payment and the amount matches the order.
      </p>
    </div>
  );
}
