import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, tr } from "@/i18n/config";
import { licensingCopy } from "@/i18n/licensing";
import { products } from "@/content/products";
import { formatMoney } from "@/lib/money";
import { licensing } from "@/lib/licensing/server";
import { formatDate, requireAccount } from "@/lib/licensing/page";
import { pageMetadata } from "@/lib/seo";
import { AccountShell } from "@/components/account/AccountShell";
import { StatusPill } from "@/components/account/StatusPill";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return pageMetadata({ locale, path: "/account/purchases", title: licensingCopy[locale].purchases.title, noindex: true });
}

export default async function PurchasesPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { ctx, sandbox } = await requireAccount(locale, "/account/purchases");
  const t = licensingCopy[locale];
  const orders = await licensing().engine.myPurchases(ctx.user.id);
  const tone = (s: string) => (s === "paid" ? "good" : s === "pending" ? "warn" : s === "failed" || s === "cancelled" ? "muted" : "bad") as "good" | "warn" | "bad" | "muted";

  return (
    <AccountShell locale={locale} current="purchases" sandbox={sandbox} user={ctx.user}>
      <h1 className="text-3xl font-bold tracking-tight text-ink">{t.purchases.title}</h1>
      {orders.length === 0 ? (
        <p className="mt-6 text-ink-soft">{t.purchases.empty}</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {orders.map(({ order, productIds }) => (
            <li key={order.id} className="rounded-[var(--radius-lg)] border border-line bg-surface p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-semibold text-ink">
                  {t.purchases.order} <span dir="ltr">{order.id}</span>
                </p>
                <div className="flex items-center gap-2">
                  {order.sandbox && <StatusPill tone="warn">{t.purchases.sandboxTag}</StatusPill>}
                  <StatusPill tone={tone(order.status)}>{t.purchases.status[order.status]}</StatusPill>
                </div>
              </div>
              <p className="mt-1 text-sm text-muted">{formatDate(order.createdAt, locale, true)}</p>
              <ul className="mt-3 text-sm text-ink-soft">
                {productIds.map((id) => (
                  <li key={id}>{tr(products.find((p) => p.id === id)?.name, locale)}</li>
                ))}
              </ul>
              <p className="mt-3 flex justify-between border-t border-line pt-3 text-sm">
                <span className="text-muted">{t.purchases.total}</span>
                <span className="font-semibold tabular text-ink">{formatMoney({ amountMinor: order.totalMinor, currency: order.currency }, locale)}</span>
              </p>
            </li>
          ))}
        </ul>
      )}
    </AccountShell>
  );
}
