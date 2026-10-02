import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, num, tr } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { guides } from "@/content/guides";
import { getCategory } from "@/content/categories";
import { pageMetadata } from "@/lib/seo";
import { hueSoft, hueVar } from "@/lib/hues";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProductIcon } from "@/components/product/ProductIcon";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const d = getDictionary(locale);
  return pageMetadata({ locale, path: "/guides", title: d.guides.title, description: d.guides.sub });
}

export default async function GuidesPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = getDictionary(locale);
  const [lead, ...rest] = guides;
  const leadCat = getCategory(lead.category);
  return (
    <>
      <PageHeader title={d.guides.title} sub={d.guides.sub} />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[1.4fr_1fr] lg:px-8">
        <Link href={`/${locale}/guides/${lead.slug}`} className="group relative flex min-h-80 flex-col justify-end overflow-hidden rounded-[var(--radius-xl)] p-8" style={{ background: hueSoft(leadCat?.hue ?? "brand", 18) }}>
          <span className="absolute start-8 top-8 grid size-14 place-items-center rounded-[16px] bg-surface-raised shadow-soft" style={{ color: hueVar(leadCat?.hue ?? "brand") }}>
            <ProductIcon hue={leadCat?.hue ?? "brand"} size={28} />
          </span>
          <p className="text-sm text-muted">
            {leadCat && tr(leadCat.name, locale)} · {num(lead.readingMinutes, locale)} {d.common.minutes}
          </p>
          <h2 className="mt-2 max-w-xl text-2xl font-semibold tracking-tight text-ink group-hover:underline sm:text-3xl">{tr(lead.title, locale)}</h2>
          <p className="mt-3 max-w-xl text-ink-soft">{tr(lead.excerpt, locale)}</p>
        </Link>
        <ul className="flex flex-col gap-6">
          {rest.map((g) => {
            const cat = getCategory(g.category);
            return (
              <li key={g.slug} className="flex-1">
                <Link href={`/${locale}/guides/${g.slug}`} className="group flex h-full flex-col rounded-[var(--radius-xl)] border border-line bg-surface p-6 hover:border-line-strong">
                  <p className="flex items-center gap-2 text-sm text-muted">
                    <span className="size-2 rounded-full" style={{ background: hueVar(cat?.hue ?? "brand") }} aria-hidden="true" />
                    {cat && tr(cat.name, locale)} · {num(g.readingMinutes, locale)} {d.common.minutes}
                  </p>
                  <h2 className="mt-2 text-lg font-semibold text-ink group-hover:underline">{tr(g.title, locale)}</h2>
                  <p className="mt-2 text-sm text-ink-soft">{tr(g.excerpt, locale)}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
