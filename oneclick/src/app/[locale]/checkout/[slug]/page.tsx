import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EnvelopeSimpleIcon, LockSimpleIcon, PlugsIcon } from "@phosphor-icons/react/dist/ssr";
import { isLocale, tr } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { catalog } from "@/lib/data/catalog";
import { getPaymentProvider } from "@/lib/payments";
import { formatMoney } from "@/lib/money";
import { hueSoft, hueVar } from "@/lib/hues";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/ui/PageHeader";
import { ProductIcon } from "@/components/product/ProductIcon";
import { NotifyForm } from "@/components/product/NotifyForm";
import { CheckoutTracker } from "@/components/product/CheckoutTracker";
import { buttonClass } from "@/components/ui/Button";
import { inputClass } from "@/components/ui/Field";
import { fill, licensingCopy } from "@/i18n/licensing";
import { currentContext, licensingMode } from "@/lib/licensing/server";
import { sandboxPayAction } from "../actions";
import { testPurchasesEnabled } from "@/lib/licensing/test-purchase";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  return pageMetadata({ locale, path: `/checkout/${slug}`, title: getDictionary(locale).checkout.title, noindex: true });
}

export default async function CheckoutPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const product = await catalog.getProduct(slug);
  if (!product || product.price === null) notFound();
  const d = getDictionary(locale);
  const provider = getPaymentProvider();
  const name = tr(product.name, locale);
  // Local sandbox, or an owner test link opened in this browser: show "simulate payment".
  const sandbox = await testPurchasesEnabled();
  const ctx = licensingMode() === "unavailable" ? null : await currentContext();
  const t = licensingCopy[locale].checkout;

  return (
    <div className="mx-auto max-w-5xl px-4 pb-10 pt-10 sm:px-6 md:pt-14">
      <CheckoutTracker productId={product.id} />
      <Breadcrumbs items={[{ href: `/${locale}/products/${product.slug}`, label: name }, { label: d.checkout.title }]} />
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">{d.checkout.title}</h1>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        <section aria-labelledby="pay-status">
          {!provider.live && (
            <div className="rounded-[var(--radius-lg)] border-2 border-dashed border-warning/60 bg-accent-soft p-6">
              <p id="pay-status" className="flex items-center gap-2 text-sm font-bold tracking-wide text-warning">
                <PlugsIcon size={20} weight="bold" />
                {d.checkout.notConnected}
              </p>
              <p className="mt-3 leading-relaxed text-ink-soft">{d.checkout.body}</p>
            </div>
          )}
          {sandbox && (
            <section aria-labelledby="sandbox-pay" className="mt-8 rounded-[var(--radius-lg)] border-2 border-dashed border-lilac/60 bg-surface p-6">
              <h2 id="sandbox-pay" className="text-sm font-bold tracking-wide text-ink">
                {t.sandboxTitle}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{t.sandboxBody}</p>
              <form action={sandboxPayAction} className="mt-5 space-y-4">
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="slug" value={product.slug} />
                {ctx ? (
                  <p className="text-sm text-ink">{fill(t.signedInAs, { email: "\u2068" + ctx.user.email + "\u2069" })}</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    <label htmlFor="sandbox-email" className="text-sm font-medium text-ink">
                      {t.email}
                    </label>
                    <input id="sandbox-email" name="email" type="email" required autoComplete="email" dir="ltr" className={inputClass} />
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  <button name="outcome" value="succeeded" className={buttonClass("primary", "md")}>
                    {t.succeed}
                  </button>
                  <button name="outcome" value="pending" className={buttonClass("secondary", "md")}>
                    {t.pending}
                  </button>
                  <button name="outcome" value="failed" className={buttonClass("ghost", "md")}>
                    {t.fail}
                  </button>
                </div>
              </form>
            </section>
          )}
          <div className="mt-8 rounded-[var(--radius-lg)] border border-line bg-surface p-6">
            <h2 className="text-lg font-semibold text-ink">{d.checkout.notify}</h2>
            <NotifyForm productId={product.id} d={{ newsletter: d.newsletter, form: d.form, checkout: d.checkout }} />
          </div>
        </section>

        <aside aria-labelledby="summary" className="self-start rounded-[var(--radius-lg)] border border-line bg-surface p-6">
          <h2 id="summary" className="text-sm font-semibold text-muted">
            {d.checkout.summary}
          </h2>
          <div className="mt-4 flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-[14px]" style={{ background: hueSoft(product.hue, 18), color: hueVar(product.hue) }}>
              <ProductIcon hue={product.hue} size={24} />
            </span>
            <div className="flex-1">
              <p className="font-semibold text-ink">{name}</p>
              <p className="text-sm text-muted">{d.access[product.access]}</p>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
            <span className="text-ink-soft">{d.checkout.total}</span>
            <span className="text-xl font-semibold tabular text-ink">{formatMoney(product.price, locale)}</span>
          </div>
          {!ctx && (
            <div className="mt-6 rounded-[var(--radius-md)] bg-primary-soft p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                <EnvelopeSimpleIcon size={18} weight="duotone" className="shrink-0 text-primary" />
                {t.guestTitle}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">{t.guestBody}</p>
            </div>
          )}
          <p className="mt-4 flex items-start gap-2 text-xs text-muted">
            <LockSimpleIcon size={14} className="mt-0.5 shrink-0" />
            {d.common.priceNote}
          </p>
        </aside>
      </div>
    </div>
  );
}
