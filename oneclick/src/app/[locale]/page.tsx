import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { isLocale, num, tr, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { catalog } from "@/lib/data/catalog";
import { faqs } from "@/content/faqs";
import { guides } from "@/content/guides";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { FaqList } from "@/components/ui/Faq";
import { HeroVisual } from "@/components/home/HeroVisual";
import { HeroTitle } from "@/components/home/HeroTitle";
import { ProductParade } from "@/components/home/ProductParade";
import { StoryShowcase, type ShowcaseItem } from "@/components/home/StoryShowcase";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductIcon } from "@/components/product/ProductIcon";
import { JsonLd } from "@/components/JsonLd";
import { faqJsonLd } from "@/lib/seo";
import { hueSoft, hueVar } from "@/lib/hues";
import { Clicky, type ClickyMood } from "@/components/brand/Clicky";
import { ProductArt } from "@/components/art/ProductArt";

const howMoods: ClickyMood[] = ["think", "wink", "celebrate"];
const howColors = ["var(--oc-hue-planner)", "var(--oc-hue-bride)", "var(--oc-brand)"];

import { notFound } from "next/navigation";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: l } = await params;
  if (!isLocale(l)) notFound();
  const locale: Locale = l;
  const d = getDictionary(locale);
  const [products, categories] = await Promise.all([catalog.listProducts(), catalog.listCategories()]);

  const showcase: ShowcaseItem[] = products
    .filter((p) => p.demo && p.featured)
    .map((p) => ({
      slug: p.slug,
      name: tr(p.name, locale),
      tagline: tr(p.tagline, locale),
      chaos: tr(p.story.chaos, locale),
      result: tr(p.story.result, locale),
      demo: p.demo!,
      hue: p.hue,
    }));

  const featured = products.filter((p) => p.status !== "coming-soon").slice(0, 5);
  const parade = products.filter((p) => p.price !== null);
  const homeFaqs = faqs.filter((f) => ["what", "app", "lifetime", "payment", "languages"].includes(f.id)).map((f) => ({ q: tr(f.q, locale), a: tr(f.a, locale) }));
  const bento = categories.filter((c) => c.slug !== "templates-downloads").slice(0, 7);

  return (
    <>
      {/* HERO: asymmetric split. Story told by the visual: scattered notes become one calm list. */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-10 sm:px-6 md:pt-16 lg:min-h-[min(780px,calc(100dvh-4rem))] lg:grid-cols-[1.05fr_1fr] lg:gap-6 lg:px-8 lg:pb-20">
          <div className="max-w-xl">
            <Reveal>
              <HeroTitle full={d.home.heroTitle} prefix={d.home.heroPrefix} words={d.home.heroWords} />
            </Reveal>
            <Reveal delay={0.08}>
              <p className="mt-6 max-w-[34ch] text-lg leading-relaxed text-ink-soft sm:text-xl">{d.home.heroSub}</p>
            </Reveal>
            <Reveal delay={0.16}>
              <div className="mt-9 flex flex-wrap gap-3">
                <ButtonLink href={`/${locale}/products`} size="lg">
                  {d.home.heroCta}
                  <ArrowRightIcon size={18} className="flip-rtl" />
                </ButtonLink>
                <ButtonLink href="#demos" variant="secondary" size="lg">
                  {d.home.heroSecondary}
                </ButtonLink>
              </div>
            </Reveal>
          </div>
          <HeroVisual locale={locale} />
        </div>
      </section>

      {/* PRODUCT PARADE: one colorful marquee of every product */}
      <ProductParade products={parade} locale={locale} />

      {/* CHAOS -> CLARITY: interactive tabbed showcase with real working demos */}
      <section id="demos" className="scroll-mt-20 border-y border-line bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">{d.home.storyTitle}</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-ink sm:text-[2.6rem] sm:leading-[1.1]">{d.home.demoTitle}</h2>
            <p className="mt-4 max-w-[60ch] text-lg text-ink-soft">{d.home.storySub}</p>
          </Reveal>
          <div className="mt-12">
            <StoryShowcase
              items={showcase}
              locale={locale}
              labels={{ before: d.home.storyBefore, after: d.home.storyAfter, view: d.common.viewProduct, demoNote: d.product.demoNote }}
            />
          </div>
        </div>
      </section>

      {/* COLLECTIONS: playful bento, each tile tinted with its collection color + illustration */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <Reveal>
          <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-[2.6rem]">{d.home.collectionsTitle}</h2>
        </Reveal>
        <div className="mt-10 grid auto-rows-[160px] grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {bento.map((c, i) => {
            const big = i === 0 || i === 1;
            // Exact cell count: an odd number of small tiles stretches the last one on mobile.
            const smallCount = bento.length - 2;
            const stretch = !big && smallCount % 2 === 1 && i === bento.length - 1;
            return (
              <Reveal key={c.slug} delay={i * 0.04} className={big ? "col-span-2 row-span-2" : stretch ? "col-span-2 md:col-span-1" : ""}>
                <Link
                  href={`/${locale}/collections/${c.slug}`}
                  className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[var(--radius-lg)] p-5 transition-transform duration-300 ease-[var(--ease-bounce)] hover:-rotate-1 hover:scale-[1.02]"
                  style={{ background: hueSoft(c.hue, big ? 22 : 18) }}
                >
                  {big ? (
                    <ProductArt hue={c.hue} className="absolute -end-4 top-2 h-[62%] w-[70%] transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <span className="grid size-12 place-items-center rounded-[16px] bg-surface-raised shadow-soft transition-transform duration-300 ease-[var(--ease-bounce)] group-hover:-rotate-6 group-hover:scale-110" style={{ color: hueVar(c.hue) }}>
                      <ProductIcon hue={c.hue} size={24} />
                    </span>
                  )}
                  <div className={big ? "relative mt-auto" : ""}>
                    <h3 className={`font-bold tracking-tight text-ink ${big ? "text-2xl" : "text-base"}`}>{tr(c.name, locale)}</h3>
                    {big && <p className="mt-1.5 max-w-[36ch] text-ink-soft">{tr(c.description, locale)}</p>}
                  </div>
                </Link>
              </Reveal>
            );
          })}
          <Reveal delay={0.3} className={`col-span-2 ${(bento.length - 2) % 4 === 1 ? "md:col-span-3" : (bento.length - 2) % 4 === 2 ? "md:col-span-2" : "md:col-span-1"}`}>
            <Link href={`/${locale}/products`} className="group flex h-full items-center justify-between overflow-hidden rounded-[var(--radius-lg)] bg-ink p-5 ps-6 text-bg">
              <span className="text-lg font-bold">{d.common.allProducts}</span>
              <span className="flex items-center gap-3">
                <Clicky size={64} mood="wink" className="transition-transform duration-300 ease-[var(--ease-bounce)] group-hover:-translate-y-1 group-hover:rotate-6" />
                <ArrowRightIcon size={22} className="flip-rtl" />
              </span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* PRODUCTS: horizontal scroll-snap rail */}
      <section className="pb-20 lg:pb-28">
        <div className="mx-auto flex max-w-7xl items-end justify-between gap-6 px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-[2.6rem]">{d.catalog.title}</h2>
          <Link href={`/${locale}/products`} className="hidden shrink-0 items-center gap-2 font-semibold text-primary hover:underline sm:inline-flex">
            {d.common.allProducts}
            <ArrowRightIcon size={16} className="flip-rtl" />
          </Link>
        </div>
        <ul className="mx-auto mt-10 flex max-w-7xl snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-4 px-4 pb-6 pt-2 sm:scroll-px-6 sm:px-6 lg:scroll-px-8 lg:px-8">
          {featured.map((p) => (
            <li key={p.id} className="w-[80%] shrink-0 snap-start sm:w-[46%] lg:w-[31%]">
              <ProductCard product={p} locale={locale} d={d} />
            </li>
          ))}
        </ul>
      </section>

      {/* HOW IT WORKS: Clicky walks you through it */}
      <section className="relative overflow-hidden bg-[color-mix(in_oklab,var(--oc-lilac)_12%,var(--oc-bg))]">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <h2 className="text-center text-3xl font-bold tracking-tight text-ink sm:text-[2.4rem]">{d.home.howTitle}</h2>
          <ol className="relative mt-14 grid gap-12 md:grid-cols-3 md:gap-8">
            <svg aria-hidden="true" className="absolute inset-x-[16%] top-10 hidden h-6 w-[68%] md:block" viewBox="0 0 600 24" preserveAspectRatio="none">
              <path d="M0 12 Q75 0 150 12 T300 12 T450 12 T600 12" fill="none" stroke="var(--oc-lilac)" strokeWidth="3" strokeDasharray="2 10" strokeLinecap="round" />
            </svg>
            {d.home.how.map((step, i) => (
              <li key={step.title} className="relative flex items-center gap-5 md:flex-col md:text-center">
                <span className="relative grid size-24 shrink-0 place-items-center rounded-full bg-surface-raised shadow-soft">
                  <Clicky size={64} mood={howMoods[i]} color={howColors[i]} animate />
                  <span className="absolute -end-1 -top-1 grid size-8 place-items-center rounded-full bg-accent text-sm font-bold text-on-accent tabular">{num(i + 1, locale)}</span>
                </span>
                <div>
                  <h3 className="text-lg font-bold text-ink">{step.title}</h3>
                  <p className="mt-1 max-w-[30ch] text-ink-soft">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CUSTOM SOLUTIONS: colorful band with Clicky */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <Reveal>
          <div className="relative overflow-hidden rounded-[var(--radius-xl)] px-6 py-12 text-white sm:px-12 sm:py-16" style={{ background: "linear-gradient(135deg, #6d5ef2 0%, #3d7bff 55%, #12a3c9 100%)" }}>
            <div aria-hidden="true" className="absolute -end-16 -top-16 size-64 rounded-full bg-white/10" />
            <div aria-hidden="true" className="absolute -bottom-20 end-40 size-48 rounded-full bg-white/10" />
            <div className="relative grid items-center gap-10 md:grid-cols-[1.4fr_1fr]">
              <div className="max-w-xl">
                <h2 className="text-3xl font-bold tracking-tight sm:text-[2.6rem] sm:leading-[1.1]">{d.home.customTitle}</h2>
                <p className="mt-4 text-lg leading-relaxed text-white/90">{d.home.customSub}</p>
                <ButtonLink href={`/${locale}/custom`} size="lg" variant="accent" className="mt-8">
                  {d.home.customCta}
                  <ArrowRightIcon size={18} className="flip-rtl" />
                </ButtonLink>
              </div>
              <div className="flex justify-center md:justify-end" aria-hidden="true">
                <Clicky size={150} body wave animate mood="happy" color="var(--oc-accent)" />
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* HONEST LAUNCH + GUIDES: two-column editorial */}
      <section className="mx-auto grid max-w-7xl gap-14 px-4 pb-20 sm:px-6 lg:grid-cols-[1fr_1.4fr] lg:px-8 lg:pb-28">
        <Reveal>
          <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{d.home.honestTitle}</h2>
          <p className="mt-4 max-w-[48ch] leading-relaxed text-ink-soft">{d.home.honestBody}</p>
        </Reveal>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{d.home.guidesTitle}</h2>
          <ul className="mt-6 divide-y divide-line border-y border-line">
            {guides.map((g) => (
              <li key={g.slug}>
                <Link href={`/${locale}/guides/${g.slug}`} className="group flex items-center gap-4 py-5">
                  <div className="flex-1">
                    <p className="font-medium text-ink group-hover:text-primary">{tr(g.title, locale)}</p>
                    <p className="mt-1 text-sm text-muted">
                      {num(g.readingMinutes, locale)} {d.common.minutes}
                    </p>
                  </div>
                  <ArrowRightIcon size={18} className="flip-rtl shrink-0 text-muted transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 pb-20 sm:px-6 lg:pb-28">
        <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{d.home.faqTitle}</h2>
        <div className="mt-8">
          <FaqList items={homeFaqs} />
        </div>
        <JsonLd data={faqJsonLd(homeFaqs)} />
      </section>

      {/* FINAL CTA: free lead magnet, no popup */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex flex-col items-start gap-6 overflow-hidden rounded-[var(--radius-xl)] bg-accent-soft px-6 py-10 sm:px-10 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <Clicky size={84} mood="celebrate" animate className="shrink-0" />
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-[2.2rem]">{d.home.finalTitle}</h2>
              <p className="mt-1 text-lg text-ink-soft">{d.home.finalSub}</p>
            </div>
          </div>
          <ButtonLink href={`/${locale}/products/weekly-reset-checklist`} size="lg">
            {d.home.finalCta}
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
