import type { Metadata } from "next";
import { locales, localeMeta, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

/** Absolute URL for a locale-relative path ("/products" -> "https://site/en/products"). */
export function localeUrl(locale: Locale, path = "") {
  return `${siteUrl}/${locale}${path === "/" ? "" : path}`;
}

/** Shared metadata builder: title, description, canonical, hreflang, Open Graph, Twitter. */
export function pageMetadata(opts: {
  locale: Locale;
  path: string;
  title?: string;
  description?: string;
  image?: string;
  noindex?: boolean;
}): Metadata {
  const d = getDictionary(opts.locale);
  const title = opts.title ? `${opts.title} | One Click Digital Hub` : d.meta.siteTitle;
  const description = opts.description ?? d.meta.siteDescription;
  const languages: Record<string, string> = {};
  for (const l of locales) languages[localeMeta[l].htmlLang] = localeUrl(l, opts.path);
  languages["x-default"] = localeUrl("en", opts.path);
  const image = opts.image ?? `${siteUrl}/brand/og-default.png`;
  return {
    title: { absolute: title },
    description,
    metadataBase: new URL(siteUrl),
    alternates: { canonical: localeUrl(opts.locale, opts.path), languages },
    openGraph: {
      type: "website",
      siteName: "One Click Digital Hub",
      title,
      description,
      url: localeUrl(opts.locale, opts.path),
      locale: localeMeta[opts.locale].ogLocale,
      alternateLocale: locales.filter((l) => l !== opts.locale).map((l) => localeMeta[l].ogLocale),
      images: [{ url: image, width: 1200, height: 630, alt: "One Click Digital Hub" }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
    robots: opts.noindex ? { index: false, follow: false } : undefined,
  };
}

// ---- Structured data (JSON-LD) ----

export function organizationJsonLd(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "One Click Digital Hub",
    alternateName: "ون كليك ديجيتال هب",
    url: localeUrl(locale),
    logo: `${siteUrl}/brand/oneclick-app-icon.png`,
    description: getDictionary(locale).meta.siteDescription,
    areaServed: ["OM", "SA", "AE", "KW", "QA", "BH", "Worldwide"],
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: it.url })),
  };
}

export function faqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

/** JSON-LD must never break out of its <script>: escape "<". */
export function jsonLdString(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
