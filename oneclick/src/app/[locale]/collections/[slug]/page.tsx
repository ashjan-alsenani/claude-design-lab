import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, locales, tr } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { catalog } from "@/lib/data/catalog";
import { categories as allCategories } from "@/content/categories";
import { pageMetadata, localeUrl, breadcrumbJsonLd } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";
import { CatalogView } from "@/components/product/CatalogView";
import { JsonLd } from "@/components/JsonLd";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return locales.flatMap((locale) => allCategories.map((c) => ({ locale, slug: c.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const c = await catalog.getCategory(slug);
  if (!c) return {};
  return pageMetadata({ locale, path: `/collections/${slug}`, title: tr(c.name, locale), description: tr(c.description, locale) });
}

export default async function CollectionPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const category = await catalog.getCategory(slug);
  if (!category) notFound();
  const d = getDictionary(locale);
  const [products, categories] = await Promise.all([catalog.listProducts({ category: slug }), catalog.listCategories()]);
  const home = locale === "ar" ? "الرئيسية" : "Home";
  const name = tr(category.name, locale);
  return (
    <>
      <PageHeader
        title={name}
        sub={tr(category.description, locale)}
        crumbs={[{ href: `/${locale}`, label: home }, { href: `/${locale}/products`, label: d.catalog.title }, { label: name }]}
      />
      <CatalogView products={products} categories={categories} active={slug} locale={locale} d={d} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: home, url: localeUrl(locale) },
          { name: d.catalog.title, url: localeUrl(locale, "/products") },
          { name, url: localeUrl(locale, `/collections/${slug}`) },
        ])}
      />
    </>
  );
}
