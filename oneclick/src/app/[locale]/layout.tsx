import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { preload } from "react-dom";
import "../globals.css";
import { isLocale, locales, localeMeta } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ConsentBanner } from "@/components/layout/ConsentBanner";
import { JsonLd } from "@/components/JsonLd";
import { ChromeGate } from "@/components/layout/ChromeGate";
import { NavProgress } from "@/components/layout/NavProgress";
import { Suspense } from "react";
import { organizationJsonLd, pageMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return pageMetadata({ locale, path: "" });
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f7f6" },
    { media: "(prefers-color-scheme: dark)", color: "#0c1014" },
  ],
};

// Applies a saved theme choice before paint (no flash). Static string, no user input.
const themeScript = `try{var t=localStorage.getItem("oc-theme");if(t==="dark"||t==="light")document.documentElement.dataset.theme=t}catch(e){}`;

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = getDictionary(locale);
  const meta = localeMeta[locale];
  // Start the brand font downloads with the HTML instead of after the stylesheet (text settles sooner).
  if (locale === "ar") preload("/brand/fonts/rubik-arabic-v1.woff2", { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  preload("/brand/fonts/rubik-latin-v1.woff2", { as: "font", type: "font/woff2", crossOrigin: "anonymous" });

  return (
    <html lang={meta.htmlLang} dir={meta.dir} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        {/* Reads the search params, so it sits in its own Suspense boundary (pages stay static). */}
        <Suspense fallback={null}>
          <NavProgress />
        </Suspense>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-on-primary"
        >
          {d.a11y.skip}
        </a>
        <ChromeGate>
          <Header locale={locale} d={{ nav: d.nav, a11y: d.a11y }} />
        </ChromeGate>
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <ChromeGate>
          <Footer locale={locale} d={d} />
          <ConsentBanner d={{ consent: d.consent }} />
        </ChromeGate>
        <JsonLd data={organizationJsonLd(locale)} />
      </body>
    </html>
  );
}
