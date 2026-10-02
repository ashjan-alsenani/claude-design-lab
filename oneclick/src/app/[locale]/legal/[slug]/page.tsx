import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WarningIcon } from "@phosphor-icons/react/dist/ssr";
import { isLocale, locales, tr } from "@/i18n/config";
import { getLegalPage, legalPages } from "@/content/legal";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";
import { RichText } from "@/components/ui/RichText";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return locales.flatMap((locale) => legalPages.map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const p = getLegalPage(slug);
  if (!p) return {};
  return pageMetadata({ locale, path: `/legal/${slug}`, title: tr(p.title, locale), description: tr(p.summary, locale) });
}

export default async function LegalPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const page = getLegalPage(slug);
  if (!page) notFound();
  const ar = locale === "ar";
  const updated = new Intl.DateTimeFormat(ar ? "ar-OM" : "en-GB", { dateStyle: "long" }).format(new Date(page.updated));
  return (
    <>
      <PageHeader title={tr(page.title, locale)} sub={tr(page.summary, locale)}>
        <p className="mt-4 text-sm text-muted">{ar ? `آخر تحديث: ${updated}` : `Last updated: ${updated}`}</p>
      </PageHeader>
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[220px_1fr] lg:px-8">
        <nav aria-label={ar ? "الصفحات القانونية" : "Legal pages"} className="order-2 lg:order-1 lg:sticky lg:top-24 lg:self-start">
          <ul className="space-y-1">
            {legalPages.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/${locale}/legal/${p.slug}`}
                  aria-current={p.slug === slug ? "page" : undefined}
                  className="block rounded-[var(--radius-sm)] px-3 py-2 text-sm text-ink-soft hover:bg-bg-sunken aria-[current=page]:bg-bg-sunken aria-[current=page]:font-medium aria-[current=page]:text-ink"
                >
                  {tr(p.title, locale)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="order-1 lg:order-2">
          <p role="note" className="mb-8 flex max-w-[68ch] gap-3 rounded-[var(--radius-md)] border border-warning/40 bg-accent-soft p-4 text-sm text-ink-soft">
            <WarningIcon size={20} className="shrink-0 text-warning" />
            {ar
              ? "مسودة قيد المراجعة القانونية. سيتم تحديث هذه الصفحة واعتمادها قبل الإطلاق التجاري. النصوص بين [أقواس] تُستكمل لاحقًا."
              : "Draft pending legal review. This page will be finalized before commercial launch. Text in [brackets] will be completed later."}
          </p>
          <RichText paragraphs={page.body[locale]} />
        </div>
      </div>
    </>
  );
}
