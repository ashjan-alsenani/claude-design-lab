import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeftIcon, SealCheckIcon } from "@phosphor-icons/react/dist/ssr";
import { isLocale, tr } from "@/i18n/config";
import { fill, licensingCopy } from "@/i18n/licensing";
import { products } from "@/content/products";
import { hueVar } from "@/lib/hues";
import { currentContext, licensing } from "@/lib/licensing/server";
import { pageMetadata } from "@/lib/seo";
import { ProductArt } from "@/components/art/ProductArt";
import { DemoById } from "@/components/demos/DemoById";
import { AccessDenied } from "@/components/account/AccessDenied";

/**
 * PROTECTED PRODUCT ROUTE: /{locale}/app/{slug}
 *
 * The URL is not a secret and proves nothing. Every request is authorized on the
 * server by the licensing engine (session cookie -> account -> license -> device),
 * so a copied or shared link shows the friendly "not in your account" page.
 * Responses are private and never cached (see next.config.ts headers).
 */
type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const p = products.find((x) => x.slug === slug);
  return pageMetadata({ locale, path: `/app/${slug}`, title: p ? tr(p.name, locale) : "One Click", noindex: true });
}

export default async function ProductAppPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  // Archived products stay available to their owners, so look them up directly.
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();
  const t = licensingCopy[locale];
  const ctx = await currentContext();
  const decision = await licensing().engine.checkAccess(ctx, product.id, "open");

  if (!decision.allowed) {
    if (decision.reason === "not_signed_in" || decision.reason === "session_invalid") {
      redirect(`/${locale}/account?next=${encodeURIComponent(`/${locale}/app/${slug}`)}`);
    }
    return <AccessDenied locale={locale} reason={decision.reason} productSlug={product.slug} />;
  }

  const color = hueVar(product.hue);
  return (
    <div className="mx-auto max-w-6xl px-4 pb-10 pt-6 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href={`/${locale}/account/products`} className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink">
          <ArrowLeftIcon size={16} className="flip-rtl" />
          {t.viewer.back}
        </Link>
        {ctx && decision.license && (
          <p className="inline-flex items-center gap-1.5 text-xs text-muted" title={t.viewer.personal}>
            <SealCheckIcon size={16} weight="fill" style={{ color }} />
            <span dir="auto">{fill(t.viewer.licensedTo, { email: "⁨" + ctx.user.email + "⁩" })}</span>
          </p>
        )}
      </div>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink">{tr(product.name, locale)}</h1>
      <p className="mt-1 text-ink-soft">{tr(product.tagline, locale)}</p>
      <div className="mt-8" data-testid="product-app">
        {product.demo ? (
          <DemoById id={product.demo} locale={locale} hue={product.hue} />
        ) : (
          <section className="flex flex-col items-center rounded-[var(--radius-xl)] border border-line bg-surface px-6 py-12 text-center">
            <ProductArt hue={product.hue} art={product.art} className="h-48 w-72 max-w-full" />
            <h2 className="mt-4 text-xl font-semibold text-ink">{t.viewer.workspaceTitle}</h2>
            <p className="mt-2 max-w-md text-ink-soft">{t.viewer.workspaceBody}</p>
          </section>
        )}
      </div>
    </div>
  );
}
