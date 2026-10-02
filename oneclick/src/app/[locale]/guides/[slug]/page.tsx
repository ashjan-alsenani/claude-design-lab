import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, locales, num, tr } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getGuide, guides } from "@/content/guides";
import { catalog } from "@/lib/data/catalog";
import { breadcrumbJsonLd, localeUrl, pageMetadata, siteUrl } from "@/lib/seo";
import { Breadcrumbs } from "@/components/ui/PageHeader";
import { RichText } from "@/components/ui/RichText";
import { ProductCard } from "@/components/product/ProductCard";
import { JsonLd } from "@/components/JsonLd";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return locales.flatMap((locale) => guides.map((g) => ({ locale, slug: g.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const g = getGuide(slug);
  if (!g) return {};
  return pageMetadata({ locale, path: `/guides/${slug}`, title: tr(g.title, locale), description: tr(g.excerpt, locale) });
}

export default async function GuidePage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const guide = getGuide(slug);
  if (!guide) notFound();
  const d = getDictionary(locale);
  const related = guide.relatedProduct ? await catalog.getProduct(guide.relatedProduct) : undefined;
  const title = tr(guide.title, locale);
  const home = locale === "ar" ? "الرئيسية" : "Home";
  const date = new Intl.DateTimeFormat(locale === "ar" ? "ar-OM" : "en-GB", { dateStyle: "long" }).format(new Date(guide.publishedAt));

  return (
    <article className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 md:pt-14 lg:px-8">
      <Breadcrumbs items={[{ href: `/${locale}`, label: home }, { href: `/${locale}/guides`, label: d.guides.title }, { label: title }]} />
      <header className="mt-6 max-w-3xl">
        <h1 className="text-4xl font-semibold tracking-[-0.03em] text-ink sm:text-5xl sm:leading-[1.08]">{title}</h1>
        <p className="mt-4 text-xl leading-relaxed text-ink-soft">{tr(guide.excerpt, locale)}</p>
        <p className="mt-4 text-sm text-muted">
          <time dateTime={guide.publishedAt}>{date}</time> · {num(guide.readingMinutes, locale)} {d.common.minutes}
        </p>
      </header>
      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_320px]">
        <div className="text-[1.075rem]">
          <RichText paragraphs={guide.body[locale]} />
        </div>
        {related && (
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <p className="mb-3 text-sm font-medium text-muted">{d.guides.related}</p>
            <ProductCard product={related} locale={locale} d={d} />
          </aside>
        )}
      </div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: title,
          description: tr(guide.excerpt, locale),
          datePublished: guide.publishedAt,
          inLanguage: locale,
          author: { "@type": "Organization", name: "One Click" },
          publisher: { "@type": "Organization", name: "One Click", logo: { "@type": "ImageObject", url: `${siteUrl}/brand/oneclick-app-icon.png` } },
          mainEntityOfPage: localeUrl(locale, `/guides/${slug}`),
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: home, url: localeUrl(locale) },
          { name: d.guides.title, url: localeUrl(locale, "/guides") },
          { name: title, url: localeUrl(locale, `/guides/${slug}`) },
        ])}
      />
    </article>
  );
}
