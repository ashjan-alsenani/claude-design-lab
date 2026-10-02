import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChatCircleTextIcon } from "@phosphor-icons/react/dist/ssr";
import { isLocale, tr } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { faqs } from "@/content/faqs";
import { faqJsonLd, pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";
import { FaqList } from "@/components/ui/Faq";
import { ButtonLink } from "@/components/ui/Button";
import { JsonLd } from "@/components/JsonLd";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const d = getDictionary(locale);
  return pageMetadata({ locale, path: "/help", title: d.help.title, description: d.help.sub });
}

export default async function HelpPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = getDictionary(locale);
  const groups = (Object.keys(d.help.groups) as (keyof typeof d.help.groups)[])
    .map((g) => ({ g, items: faqs.filter((f) => f.group === g).map((f) => ({ q: tr(f.q, locale), a: tr(f.a, locale) })) }))
    .filter((x) => x.items.length);
  return (
    <>
      <PageHeader title={d.help.title} sub={d.help.sub} />
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[220px_1fr] lg:px-8">
        <nav aria-label={d.help.title} className="lg:sticky lg:top-24 lg:self-start">
          <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
            {groups.map(({ g }) => (
              <li key={g}>
                <a href={`#${g}`} className="inline-block rounded-full px-3 py-1.5 text-sm text-ink-soft hover:bg-bg-sunken hover:text-ink">
                  {d.help.groups[g]}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="max-w-3xl space-y-14">
          {groups.map(({ g, items }) => (
            <section key={g} id={g} className="scroll-mt-24">
              <h2 className="text-xl font-semibold text-ink">{d.help.groups[g]}</h2>
              <div className="mt-4">
                <FaqList items={items} />
              </div>
            </section>
          ))}
          <section className="flex flex-col items-start gap-4 rounded-[var(--radius-xl)] bg-primary-soft p-6 sm:flex-row sm:items-center sm:p-8">
            <ChatCircleTextIcon size={40} weight="duotone" className="shrink-0 text-primary" />
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-ink">{d.help.contactTitle}</h2>
              <p className="mt-1 text-ink-soft">{d.help.contactBody}</p>
            </div>
            <ButtonLink href={`/${locale}/contact`}>{d.help.contactCta}</ButtonLink>
          </section>
        </div>
      </div>
      <JsonLd data={faqJsonLd(groups.flatMap((g) => g.items))} />
    </>
  );
}
