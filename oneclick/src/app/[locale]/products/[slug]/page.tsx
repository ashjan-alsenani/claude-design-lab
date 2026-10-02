import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRightIcon, CheckCircleIcon, DevicesIcon, GlobeHemisphereEastIcon, InfoIcon, KeyIcon, PackageIcon, ShieldCheckIcon } from "@phosphor-icons/react/dist/ssr";
import { isLocale, locales, tr } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { catalog } from "@/lib/data/catalog";
import { products as allProducts } from "@/content/products";
import { formatMoney, minorUnitDigits, toMajor } from "@/lib/money";
import { hueSoft, hueVar } from "@/lib/hues";
import { breadcrumbJsonLd, faqJsonLd, localeUrl, pageMetadata, siteUrl } from "@/lib/seo";
import { Breadcrumbs } from "@/components/ui/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { FaqList } from "@/components/ui/Faq";
import { Reveal } from "@/components/ui/Reveal";
import { DemoById } from "@/components/demos/DemoById";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductIcon } from "@/components/product/ProductIcon";
import { FavoriteButton } from "@/components/product/FavoriteButton";
import { ProductViewTracker } from "@/components/product/ProductViewTracker";
import { JsonLd } from "@/components/JsonLd";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return locales.flatMap((locale) => allProducts.filter((p) => p.status !== "archived").map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const p = await catalog.getProduct(slug);
  if (!p) return {};
  return pageMetadata({ locale, path: `/products/${slug}`, title: tr(p.name, locale), description: tr(p.summary, locale) });
}

export default async function ProductPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const product = await catalog.getProduct(slug);
  if (!product) notFound();
  const d = getDictionary(locale);
  const related = await catalog.related(product);
  const hue = hueVar(product.hue);
  const name = tr(product.name, locale);
  const home = locale === "ar" ? "الرئيسية" : "Home";
  const isFree = product.price === null;
  const soon = product.status === "coming-soon";
  const priceLabel = product.price ? formatMoney(product.price, locale) : d.common.free;
  const faqItems = product.faqs.map((f) => ({ q: tr(f.q, locale), a: tr(f.a, locale) }));

  const primaryCta = isFree
    ? { href: "#demo", label: d.home.finalCta }
    : soon
      ? { href: `/${locale}/checkout/${product.slug}`, label: d.product.notifyMe }
      : product.status === "available"
        ? { href: `/${locale}/checkout/${product.slug}`, label: d.product.buy }
        : { href: `/${locale}/checkout/${product.slug}`, label: d.product.previewCta };

  const specs = [
    { icon: PackageIcon, label: d.product.type, value: d.kind[product.kind] },
    { icon: KeyIcon, label: d.product.access, value: d.access[product.access] },
    { icon: DevicesIcon, label: d.product.devices, value: tr(product.devices, locale) },
    { icon: GlobeHemisphereEastIcon, label: d.product.languages, value: product.languages.map((l) => d.product.langNames[l]).join(locale === "ar" ? " و" : " & ") },
  ];

  return (
    <article>
      <ProductViewTracker productId={product.id} />
      {/* HERO */}
      <section className="relative overflow-hidden" style={{ background: `linear-gradient(180deg, ${hueSoft(product.hue, 10)} 0%, var(--oc-bg) 100%)` }}>
        <div className="mx-auto grid max-w-7xl gap-12 px-4 pb-16 pt-8 sm:px-6 md:pt-12 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:px-8 lg:pb-24">
          <div>
            <Breadcrumbs items={[{ href: `/${locale}`, label: home }, { href: `/${locale}/products`, label: d.catalog.title }, { label: name }]} />
            <div className="mt-8 flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-[14px] bg-surface-raised shadow-soft" style={{ color: hue }}>
                <ProductIcon hue={product.hue} size={26} />
              </span>
              <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ color: hue, background: hueSoft(product.hue, 16) }}>
                {d.status[product.status]}
              </span>
              {product.sample && <span className="rounded-full border border-line-strong px-3 py-1 text-xs font-medium text-muted">{d.common.sample}</span>}
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.03em] text-ink sm:text-[3.4rem] sm:leading-[1.05]">{name}</h1>
            <p className="mt-4 text-xl leading-snug text-ink-soft">{tr(product.tagline, locale)}</p>
            <p className="mt-5 max-w-[56ch] leading-relaxed text-ink-soft">{tr(product.summary, locale)}</p>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <div>
                <p className="text-3xl font-semibold tabular text-ink">{priceLabel}</p>
                {!isFree && <p className="text-sm text-muted">{d.access[product.access]}</p>}
              </div>
              <div className="flex items-center gap-2">
                <ButtonLink href={primaryCta.href} size="lg">
                  {primaryCta.label}
                </ButtonLink>
                <FavoriteButton productId={product.id} labels={{ add: d.a11y.favoriteAdd, remove: d.a11y.favoriteRemove }} className="size-13 border border-line" />
              </div>
            </div>
            {!isFree && product.status !== "available" && (
              <p className="mt-4 flex items-start gap-2 text-sm text-muted">
                <InfoIcon size={16} className="mt-0.5 shrink-0" />
                {d.product.paymentPending}
              </p>
            )}
          </div>

          {product.demo ? (
            <div id="demo" className="scroll-mt-24">
              <p className="mb-3 text-sm font-medium text-ink-soft">{d.product.demo}</p>
              <DemoById id={product.demo} locale={locale} hue={hue} />
              <p className="mt-3 text-xs text-muted">{d.product.demoNote}</p>
            </div>
          ) : (
            <div className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-[var(--radius-xl)]" style={{ background: hueSoft(product.hue, 18) }}>
              <svg aria-hidden="true" viewBox="0 0 64 64" className="absolute size-[85%] opacity-25">
                <path d="M47.56 16.44 A22 22 0 1 0 53.25 37.69" fill="none" stroke={hue} strokeWidth="1.4" strokeLinecap="round" strokeDasharray="3 3" />
              </svg>
              <span className="grid size-24 place-items-center rounded-[28px] bg-surface-raised shadow-lift" style={{ color: hue }}>
                <ProductIcon hue={product.hue} size={48} />
              </span>
              <p className="absolute bottom-6 text-sm font-medium text-ink-soft">{d.common.comingSoon}</p>
            </div>
          )}
        </div>
      </section>

      {/* PROBLEM -> SOLUTION */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <h2 className="text-sm font-semibold text-muted">{d.product.problem}</h2>
            <p className="mt-3 text-2xl leading-snug tracking-tight text-ink sm:text-3xl">{tr(product.problem, locale)}</p>
            <h2 className="mt-10 text-sm font-semibold text-muted">{d.product.forWho}</h2>
            <p className="mt-3 text-lg text-ink-soft">{tr(product.audience, locale)}</p>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="rounded-[var(--radius-xl)] border border-line bg-surface p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-ink">{d.product.benefits}</h2>
              <ul className="mt-5 space-y-4">
                {product.benefits.map((b) => (
                  <li key={b.en} className="flex gap-3 text-ink-soft">
                    <CheckCircleIcon size={22} weight="fill" className="shrink-0" color={hue} />
                    <span className="text-[1.05rem]">{tr(b, locale)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FEATURES */}
      {product.features.length > 0 && (
        <section className="border-y border-line bg-surface">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <h2 className="text-3xl font-semibold tracking-tight text-ink">{d.product.features}</h2>
            <dl className="mt-10 grid gap-x-12 gap-y-10 sm:grid-cols-2">
              {product.features.map((f, i) => (
                <Reveal key={f.title.en} delay={i * 0.05}>
                  <dt className="flex items-center gap-3 text-lg font-semibold text-ink">
                    <span className="h-5 w-1 rounded-full" style={{ background: hue }} aria-hidden="true" />
                    {tr(f.title, locale)}
                  </dt>
                  <dd className="mt-2 max-w-[48ch] ps-4 leading-relaxed text-ink-soft">{tr(f.body, locale)}</dd>
                </Reveal>
              ))}
            </dl>
          </div>
        </section>
      )}

      {/* WHAT YOU GET + SPECS */}
      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:px-8 lg:py-24">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-ink">{d.product.included}</h2>
          {product.included.length > 0 ? (
            <ul className="mt-6 space-y-3">
              {product.included.map((it) => (
                <li key={it.en} className="flex gap-3 text-[1.05rem] text-ink-soft">
                  <CheckCircleIcon size={22} className="shrink-0 text-primary" />
                  {tr(it, locale)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 text-ink-soft">{d.common.comingSoon}</p>
          )}
          {product.disclaimer && (
            <div className="mt-8 flex gap-3 rounded-[var(--radius-md)] border border-warning/30 bg-accent-soft p-4 text-sm text-ink-soft" role="note">
              <InfoIcon size={20} className="shrink-0 text-warning" />
              <p>
                <strong className="font-semibold text-ink">{d.product.disclaimer}: </strong>
                {tr(product.disclaimer, locale)}
              </p>
            </div>
          )}
        </div>
        <dl className="grid grid-cols-2 gap-3 self-start">
          {specs.map((s) => (
            <div key={s.label} className="rounded-[var(--radius-md)] bg-bg-sunken p-4">
              <dt className="flex items-center gap-2 text-xs font-medium text-muted">
                <s.icon size={16} />
                {s.label}
              </dt>
              <dd className="mt-1.5 text-sm font-medium text-ink">{s.value}</dd>
            </div>
          ))}
          <div className="col-span-2 flex gap-3 rounded-[var(--radius-md)] border border-line p-4 text-sm text-ink-soft">
            <ShieldCheckIcon size={20} className="shrink-0 text-primary" />
            <p>
              <Link href={`/${locale}/legal/license`} className="underline underline-offset-4 hover:text-ink">
                {d.product.license}
              </Link>{" "}
              <Link href={`/${locale}/help`} className="underline underline-offset-4 hover:text-ink">
                {d.product.support}
              </Link>
            </p>
          </div>
        </dl>
      </section>

      {/* FAQ */}
      {faqItems.length > 0 && (
        <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6 lg:pb-24">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">{d.product.faq}</h2>
          <div className="mt-6">
            <FaqList items={faqItems} />
          </div>
          <JsonLd data={faqJsonLd(faqItems)} />
        </section>
      )}

      {/* RELATED */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">{d.product.related}</h2>
          <Link href={`/${locale}/products`} className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
            {d.common.allProducts}
            <ArrowRightIcon size={14} className="flip-rtl" />
          </Link>
        </div>
        <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((p) => (
            <li key={p.id}>
              <ProductCard product={p} locale={locale} d={d} />
            </li>
          ))}
        </ul>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name,
          description: tr(product.summary, locale),
          brand: { "@type": "Brand", name: "One Click Digital Hub" },
          category: product.categories.join(", "),
          image: `${siteUrl}/brand/og-default.png`,
          url: localeUrl(locale, `/products/${product.slug}`),
          // Offers are published only when the product can actually be bought.
          ...(product.status === "available" && product.price
            ? { offers: { "@type": "Offer", price: toMajor(product.price).toFixed(minorUnitDigits[product.price.currency]), priceCurrency: product.price.currency, availability: "https://schema.org/InStock" } }
            : {}),
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: home, url: localeUrl(locale) },
          { name: d.catalog.title, url: localeUrl(locale, "/products") },
          { name, url: localeUrl(locale, `/products/${product.slug}`) },
        ])}
      />
    </article>
  );
}
