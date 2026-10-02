import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, tr } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { brand } from "@/content/site";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";
import { LogoMark } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const d = getDictionary(locale);
  return pageMetadata({ locale, path: "/about", title: d.nav.about, description: d.about.sub });
}

const copy = {
  en: {
    storyTitle: "Why One Click exists",
    story: [
      "Everyday life is full of small jobs that take more effort than they should: planning a wedding across forty chat threads, rewriting the same grocery list every week, holding a whole week in your head.",
      "One Click turns those jobs into calm, beautiful tools. Each product does one thing well, works in Arabic and English, and respects your time and your data.",
      "We started in the Sultanate of Oman, and we design for everyone, everywhere.",
    ],
    principlesTitle: "What we promise",
    principles: [
      { t: "Useful before impressive", b: "Every feature must save effort. If it only looks clever, it doesn't ship." },
      { t: "Honest by default", b: "No invented reviews, no fake counters, no hidden costs. Demos before you pay." },
      { t: "Arabic is first-class", b: "Right-to-left layouts and natural Arabic copy are designed in from day one." },
      { t: "Your data is yours", b: "We don't sell it and we don't feed it to AI services." },
    ],
    meaningTitle: "The mark",
    meaning: "One continuous line: a check that keeps moving and becomes an open loop. Completion, flow and connection. The saffron dot is the single click that closes it.",
  },
  ar: {
    storyTitle: "ليش ون كليك",
    story: [
      "حياتنا اليومية مليانة مهام صغيرة تاخذ جهد أكثر من اللازم: تجهيز عرس بين أربعين محادثة، كتابة نفس قائمة المقاضي كل أسبوع، وشيل أسبوع كامل في راسك.",
      "ون كليك تحوّل هذي المهام لأدوات هادئة وجميلة. كل منتج يسوي شي واحد بإتقان، ويشتغل بالعربي والإنجليزي، ويحترم وقتك وبياناتك.",
      "بدأنا من سلطنة عُمان، ونصمم للكل، في كل مكان.",
    ],
    principlesTitle: "وعدنا لك",
    principles: [
      { t: "مفيد قبل ما يكون مبهر", b: "كل ميزة لازم توفر جهد. إذا كانت شكلها ذكي بس، ما تنزل." },
      { t: "الصدق أساس", b: "لا تقييمات مختلقة، ولا عدادات وهمية، ولا تكاليف مخفية. تجرّب قبل لا تدفع." },
      { t: "العربي أولًا", b: "الواجهات من اليمين لليسار والنصوص العربية الطبيعية مصممة من أول يوم." },
      { t: "بياناتك ملكك", b: "ما نبيعها وما نرسلها لخدمات الذكاء الاصطناعي." },
    ],
    meaningTitle: "معنى الشعار",
    meaning: "خط واحد متصل: علامة صح تكمل حركتها وتصير دائرة مفتوحة. إنجاز، وانسيابية، وتواصل. والنقطة الزعفرانية هي الضغطة الوحدة اللي تكمّل الدائرة.",
  },
};

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = getDictionary(locale);
  const c = copy[locale];
  return (
    <>
      <PageHeader title={d.about.title} sub={d.about.sub} />
      <section className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1.4fr_1fr] lg:px-8">
        <div className="prose-oc text-lg">
          <h2>{c.storyTitle}</h2>
          {c.story.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <p className="font-semibold text-primary">{tr(brand.slogan, locale)}</p>
        </div>
        <figure className="self-start rounded-[var(--radius-xl)] border border-line bg-surface p-8">
          <LogoMark size={120} animated className="mx-auto" />
          <figcaption className="mt-6">
            <p className="font-semibold text-ink">{c.meaningTitle}</p>
            <p className="mt-2 leading-relaxed text-ink-soft">{c.meaning}</p>
          </figcaption>
        </figure>
      </section>
      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-semibold tracking-tight text-ink">{c.principlesTitle}</h2>
        <dl className="mt-8 grid gap-x-12 gap-y-8 border-t border-line pt-8 sm:grid-cols-2">
          {c.principles.map((p) => (
            <div key={p.t}>
              <dt className="text-lg font-semibold text-ink">{p.t}</dt>
              <dd className="mt-1.5 max-w-[46ch] text-ink-soft">{p.b}</dd>
            </div>
          ))}
        </dl>
        <ButtonLink href={`/${locale}/products`} className="mt-12" size="lg">
          {d.nav.explore}
        </ButtonLink>
      </section>
    </>
  );
}
