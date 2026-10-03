import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRightIcon, DownloadSimpleIcon, WarningCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { isLocale, tr } from "@/i18n/config";
import { fill, licensingCopy } from "@/i18n/licensing";
import { licensing } from "@/lib/licensing/server";
import { formatDate, requireAccount } from "@/lib/licensing/page";
import { opensInteractive } from "@/lib/licensing/policy";
import { productFiles } from "@/lib/licensing/files";
import { pageMetadata } from "@/lib/seo";
import { ProductArt } from "@/components/art/ProductArt";
import { ButtonLink, buttonClass } from "@/components/ui/Button";
import { AccountShell } from "@/components/account/AccountShell";
import { StatusPill, licenseTone } from "@/components/account/StatusPill";
import { Clicky } from "@/components/brand/Clicky";
import { deniedCopy } from "@/components/account/AccessDenied";
import { downloadAction } from "../actions";

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return pageMetadata({ locale, path: "/account/products", title: licensingCopy[locale].products.title, noindex: true });
}

export default async function MyProductsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { ctx, sandbox } = await requireAccount(locale, "/account/products");
  const sp = await searchParams;
  const t = licensingCopy[locale];
  const items = await licensing().engine.myProducts(ctx.user.id);
  const name = ctx.user.name ?? ctx.user.email.split("@")[0];

  return (
    <AccountShell locale={locale} current="products" sandbox={sandbox} email={ctx.user.email}>
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-ink">{t.products.title}</h1>
        <p className="mt-1 text-ink-soft">
          {fill(t.products.hello, { name })} · {t.products.sub}
        </p>
      </header>

      {ctx.session.deviceState === "pending" && (
        <p role="alert" className="mt-6 flex flex-wrap items-center gap-3 rounded-[var(--radius-md)] bg-accent-soft px-4 py-3 text-sm text-ink">
          <WarningCircleIcon size={20} className="text-warning" />
          {t.denied.device_not_authorized.title}
          <Link href={`/${locale}/account/devices?authorize=1`} className="font-semibold text-primary underline underline-offset-4">
            {t.denied.devices}
          </Link>
        </p>
      )}
      {sp.e && (
        <p role="alert" className="mt-6 text-sm font-medium text-error">
          {deniedCopy(t, sp.e).title}
        </p>
      )}

      {items.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-[var(--radius-xl)] border-2 border-dashed border-line-strong px-6 py-14 text-center">
          <Clicky size={96} mood="think" />
          <h2 className="mt-4 text-xl font-semibold text-ink">{t.products.empty}</h2>
          <p className="mt-2 max-w-md text-ink-soft">{t.products.emptyBody}</p>
          <ButtonLink href={`/${locale}/products`} className="mt-6">
            {t.products.emptyCta}
          </ButtonLink>
          <p className="mt-6 max-w-md text-sm text-muted">{t.products.claimedHint}</p>
        </div>
      ) : (
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 2xl:grid-cols-3" aria-label={t.products.title}>
          {items.map(({ license, product, settings, purchasedAt }) => {
            const active = license.status === "active";
            const files = productFiles(settings);
            return (
              <li key={license.id} className="flex min-w-0 flex-col overflow-hidden rounded-[var(--radius-xl)] border border-line bg-surface shadow-soft">
                <div className="h-32 bg-bg-sunken">
                  <ProductArt hue={product.hue} art={product.art} className="h-full w-full" />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="min-w-0 text-lg font-semibold text-ink">{tr(product.name, locale)}</h2>
                    <StatusPill tone={licenseTone(license.status)}>{t.licenseStatus[license.status]}</StatusPill>
                  </div>
                  <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                    <dt className="text-muted">{t.products.purchased}</dt>
                    <dd className="text-ink-soft">{formatDate(purchasedAt, locale)}</dd>
                    <dt className="text-muted">{t.products.license}</dt>
                    <dd className="text-ink-soft">
                      {t.licenseType[license.licenseType]} · {t.accessType[settings.accessType]}
                    </dd>
                  </dl>
                  {!active && license.status in t.statusHelp && <p className="mt-3 text-sm text-ink-soft">{t.statusHelp[license.status as keyof typeof t.statusHelp]}</p>}
                  <div className="mt-auto flex flex-wrap gap-2 pt-5">
                    {active && opensInteractive(settings.accessType) && (
                      <Link href={`/${locale}/app/${product.slug}`} className={buttonClass("primary", "md")}>
                        {t.products.open}
                        <ArrowRightIcon size={16} weight="bold" className="flip-rtl" />
                      </Link>
                    )}
                    {active &&
                      files.map((f) => (
                        <form key={f.id} action={downloadAction}>
                          <input type="hidden" name="locale" value={locale} />
                          <input type="hidden" name="productId" value={product.id} />
                          <input type="hidden" name="fileId" value={f.id} />
                          <button className={buttonClass("secondary", "md")} title={t.products.downloadNote}>
                            <DownloadSimpleIcon size={18} />
                            {t.products.download}
                            <span className="sr-only">: {tr(f.label, locale)}</span>
                          </button>
                        </form>
                      ))}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </AccountShell>
  );
}
