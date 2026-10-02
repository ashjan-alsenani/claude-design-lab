import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { catalog } from "@/lib/data/catalog";
import { pageMetadata, localeUrl, breadcrumbJsonLd } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";
import { CatalogView } from "@/components/product/CatalogView";
import { JsonLd } from "@/components/JsonLd";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const d = getDictionary(locale);
  return pageMetadata({ locale, path: "/products", title: d.catalog.title, description: d.catalog.sub });
}

export default async function ProductsPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = getDictionary(locale);
  const [products, categories] = await Promise.all([catalog.listProducts(), catalog.listCategories()]);
  const home = locale === "ar" ? "الرئيسية" : "Home";
  return (
    <>
      <PageHeader title={d.catalog.title} sub={d.catalog.sub} crumbs={[{ href: `/${locale}`, label: home }, { label: d.catalog.title }]} />
      <CatalogView products={products} categories={categories} locale={locale} d={d} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: home, url: localeUrl(locale) },
          { name: d.catalog.title, url: localeUrl(locale, "/products") },
        ])}
      />
    </>
  );
}
