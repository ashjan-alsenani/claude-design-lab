import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChartBarIcon, DeviceMobileIcon, GlobeIcon, ListChecksIcon } from "@phosphor-icons/react/dist/ssr";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";
import { CustomRequestForm } from "@/components/forms/CustomRequestForm";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const d = getDictionary(locale);
  return pageMetadata({ locale, path: "/custom", title: d.custom.title, description: d.custom.sub });
}

export default async function CustomPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = getDictionary(locale);
  const ar = locale === "ar";
  const examples = [
    { icon: GlobeIcon, t: ar ? "مواقع للمشاريع الصغيرة" : "Small business websites" },
    { icon: DeviceMobileIcon, t: ar ? "تطبيقات ويب صغيرة" : "Mini web apps" },
    { icon: ChartBarIcon, t: ar ? "لوحات متابعة" : "Dashboards" },
    { icon: ListChecksIcon, t: ar ? "مخططات ومنظّمات خاصة" : "Custom planners & organizers" },
  ];
  return (
    <>
      <PageHeader title={d.custom.title} sub={d.custom.sub} crumbs={[{ href: `/${locale}`, label: ar ? "الرئيسية" : "Home" }, { label: d.nav.custom }]} />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_2fr] lg:px-8">
        <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
          <ul className="space-y-3">
            {examples.map((e) => (
              <li key={e.t} className="flex items-center gap-3 text-ink-soft">
                <span className="grid size-10 place-items-center rounded-[12px] bg-primary-soft text-primary">
                  <e.icon size={20} weight="duotone" />
                </span>
                {e.t}
              </li>
            ))}
          </ul>
          <p className="text-sm leading-relaxed text-muted">
            {ar ? "كل مشروع يبدأ بعرض سعر مكتوب. راجع " : "Every project starts with a written quote. See the "}
            <Link href={`/${locale}/legal/custom-terms`} className="underline underline-offset-4 hover:text-ink">
              {ar ? "شروط الخدمات الخاصة" : "Custom Service Terms"}
            </Link>
            .
          </p>
        </aside>
        <CustomRequestForm d={{ custom: d.custom, form: d.form, product: d.product }} locale={locale} />
      </div>
    </>
  );
}
