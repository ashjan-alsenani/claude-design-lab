import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { pageMetadata } from "@/lib/seo";
import { Clicky, type ClickyMood } from "@/components/brand/Clicky";
import { Logo } from "@/components/brand/Logo";
import { ProductArt } from "@/components/art/ProductArt";
import type { Hue } from "@/content/types";

// Living style guide: logo, Clicky moods, palette and illustrations. Not indexed.
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return pageMetadata({ locale, path: "/brand", title: "Brand", noindex: true });
}

const moods: ClickyMood[] = ["happy", "wink", "celebrate", "love", "think", "surprised"];
const hues: Hue[] = ["bride", "grocery", "planner", "fit", "budget", "study", "travel", "brand"];
const swatches = ["brand", "primary", "accent", "coral", "lilac", "sky", "ink", "bg-sunken"];

export default async function BrandPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <div className="mx-auto max-w-7xl space-y-16 px-4 py-12 sm:px-6 lg:px-8" dir="ltr">
      <section>
        <h1 className="text-4xl font-bold tracking-tight text-ink">One Click Digital Hub · brand</h1>
        <div className="mt-8 flex flex-wrap items-center gap-10">
          <Logo className="scale-150 origin-left" />
        </div>
      </section>
      <section>
        <h2 className="text-2xl font-bold text-ink">Clicky</h2>
        <div className="mt-6 flex flex-wrap items-end gap-8">
          {moods.map((m) => (
            <figure key={m} className="text-center">
              <Clicky size={96} mood={m} animate />
              <figcaption className="mt-2 text-sm text-muted">{m}</figcaption>
            </figure>
          ))}
          <figure className="text-center">
            <Clicky size={96} body wave animate mood="wink" />
            <figcaption className="mt-2 text-sm text-muted">body + wave</figcaption>
          </figure>
        </div>
      </section>
      <section>
        <h2 className="text-2xl font-bold text-ink">Colors</h2>
        <div className="mt-6 flex flex-wrap gap-4">
          {swatches.map((s) => (
            <div key={s} className="text-center">
              <div className="size-20 rounded-[var(--radius-md)] border border-line" style={{ background: `var(--oc-${s})` }} />
              <p className="mt-2 text-xs text-muted">{s}</p>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-2xl font-bold text-ink">Illustrations</h2>
        <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
          {hues.map((h) => (
            <div key={h} className="rounded-[var(--radius-lg)] bg-surface p-4">
              <ProductArt hue={h} className="aspect-[10/7]" />
              <p className="mt-2 text-sm text-muted">{h}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
