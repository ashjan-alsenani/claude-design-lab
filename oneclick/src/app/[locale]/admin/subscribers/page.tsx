import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { products } from "@/content/products";
import { currentContext } from "@/lib/licensing/server";
import { getLeadStore } from "@/lib/data/leads";
import { pageMetadata } from "@/lib/seo";
import { unsubscribeAction } from "../licensing/actions";
import { Card, Flash, when } from "../licensing/ui";

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return pageMetadata({ locale, path: "/admin/subscribers", title: "Subscribers", noindex: true });
}

const csvCell = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

/** Newsletter and "notify me" sign-ups, with consent proof and CSV export. Admin only. */
export default async function SubscribersPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const ctx = await currentContext();
  if (!ctx?.roles.includes("admin")) notFound();
  const sp = await searchParams;
  const store = getLeadStore();
  const [newsletter, notify] = await Promise.all([store.list("newsletter"), store.list("product_notify")]);
  const active = [...newsletter, ...notify].filter((r) => r.status === "subscribed").sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const productName = (id: unknown) => products.find((p) => p.id === id)?.name.en ?? String(id ?? "");
  const csv = [
    "email,list,product,language,signed_up,consent_text",
    ...active.map((r) =>
      [String(r.data.email ?? ""), r.kind === "newsletter" ? "newsletter" : "notify_me", r.kind === "product_notify" ? productName(r.data.productId) : "", String(r.data.locale ?? ""), r.createdAt, String(r.data.consentText ?? "")]
        .map(csvCell)
        .join(","),
    ),
  ].join("\n");

  return (
    <div className="mx-auto max-w-5xl px-4 pb-10 pt-8 sm:px-6 lg:px-8" dir="ltr" lang="en">
      <p className="text-sm">
        <Link href={`/${locale}/admin`} className="text-primary underline underline-offset-4">
          Command center
        </Link>
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Subscribers</h1>
      <p className="mt-1 text-ink-soft">
        People who asked for news (footer) or to be told when a product is available. Everyone here ticked the consent box; the exact text and time are kept.
      </p>
      <Flash sp={sp} />
      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          ["Newsletter", newsletter.filter((r) => r.status === "subscribed").length],
          ["Notify me", notify.filter((r) => r.status === "subscribed").length],
          ["Unsubscribed", [...newsletter, ...notify].filter((r) => r.status === "unsubscribed").length],
        ].map(([k, v]) => (
          <div key={k} className="rounded-[var(--radius-lg)] border border-line bg-surface p-4">
            <dt className="text-xs text-muted">{k}</dt>
            <dd className="mt-1 text-2xl font-semibold tabular text-ink">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-6">
        <Card title="Subscribed">
          <a
            href={`data:text/csv;charset=utf-8,${encodeURIComponent("﻿" + csv)}`}
            download={`oneclick-subscribers-${new Date().toISOString().slice(0, 10)}.csv`}
            className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-on-primary"
          >
            Download CSV ({active.length})
          </a>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs text-muted">
                <tr>
                  <th className="px-3 py-2 font-medium">Email</th>
                  <th className="px-3 py-2 font-medium">List</th>
                  <th className="px-3 py-2 font-medium">Language</th>
                  <th className="px-3 py-2 font-medium">Signed up</th>
                  <th className="px-3 py-2 font-medium">Remove</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {active.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-muted">
                      No subscribers yet.
                    </td>
                  </tr>
                )}
                {active.map((r) => (
                  <tr key={r.reference}>
                    <td className="px-3 py-3 text-ink">{String(r.data.email ?? "")}</td>
                    <td className="px-3 py-3 text-ink-soft">{r.kind === "newsletter" ? "Newsletter" : `Notify me: ${productName(r.data.productId)}`}</td>
                    <td className="px-3 py-3 text-ink-soft">{String(r.data.locale ?? "")}</td>
                    <td className="px-3 py-3 text-xs text-ink-soft">{when(r.createdAt)}</td>
                    <td className="px-3 py-3">
                      <form action={unsubscribeAction}>
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="reference" value={r.reference} />
                        <button className="text-sm font-medium text-error underline underline-offset-4">Unsubscribe</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
