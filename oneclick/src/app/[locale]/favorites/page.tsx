import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { catalog } from "@/lib/data/catalog";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";
import { FavoritesGrid } from "@/components/product/FavoritesGrid";
import { ProductCard } from "@/components/product/ProductCard";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return pageMetadata({ locale, path: "/favorites", title: getDictionary(locale).favorites.title, noindex: true });
}

export default async function FavoritesPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = getDictionary(locale);
  const products = await catalog.listProducts();
  // Cards are rendered on the server; the client only decides which ids to show.
  const cards = Object.fromEntries(products.map((p) => [p.id, <ProductCard key={p.id} product={p} locale={locale} d={d} />]));
  return (
    <>
      <PageHeader title={d.favorites.title} sub={d.favorites.sub} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FavoritesGrid cards={cards} emptyText={d.favorites.empty} browseLabel={d.nav.explore} browseHref={`/${locale}/products`} />
      </div>
    </>
  );
}
