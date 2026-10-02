import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { products } from "@/content/products";
import { categories } from "@/content/categories";
import { guides } from "@/content/guides";
import { legalPages } from "@/content/legal";
import { localeUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "",
    "/products",
    "/custom",
    "/about",
    "/guides",
    "/help",
    "/contact",
    ...categories.map((c) => `/collections/${c.slug}`),
    ...products.filter((p) => p.status !== "archived").map((p) => `/products/${p.slug}`),
    ...guides.map((g) => `/guides/${g.slug}`),
    ...legalPages.map((l) => `/legal/${l.slug}`),
  ];
  return paths.flatMap((path) =>
    locales.map((locale) => ({
      url: localeUrl(locale, path),
      changeFrequency: path === "" || path === "/products" ? ("weekly" as const) : ("monthly" as const),
      priority: path === "" ? 1 : path.startsWith("/products") ? 0.8 : 0.5,
      alternates: { languages: Object.fromEntries(locales.map((l) => [l, localeUrl(l, path)])) },
    }))
  );
}
