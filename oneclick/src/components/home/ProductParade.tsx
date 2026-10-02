import Link from "next/link";
import type { Product } from "@/content/types";
import { tr, type Locale } from "@/i18n/config";
import { hueSoft, hueVar } from "@/lib/hues";
import { Clicky } from "@/components/brand/Clicky";

/**
 * The one marquee on the page: a colorful parade of every One Click product, each with its
 * own Clicky. Pauses on hover/focus; static and scrollable under reduced motion.
 */
export function ProductParade({ products, locale }: { products: Product[]; locale: Locale }) {
  const row = (hidden: boolean) =>
    products.map((p, i) => (
      <li key={`${p.id}-${hidden}`} aria-hidden={hidden || undefined}>
        <Link
          href={`/${locale}/products/${p.slug}`}
          tabIndex={hidden ? -1 : undefined}
          className="flex items-center gap-2.5 whitespace-nowrap rounded-full border-2 bg-surface-raised py-2 pe-5 ps-2 text-[0.95rem] font-semibold text-ink shadow-soft transition-transform duration-300 ease-[var(--ease-bounce)] hover:-translate-y-1 hover:-rotate-2"
          style={{ borderColor: hueSoft(p.hue, 45), background: hueSoft(p.hue, 10) }}
        >
          <Clicky size={34} color={hueVar(p.hue)} mood={(["happy", "wink", "love", "celebrate"] as const)[i % 4]} sparkle={false} />
          {tr(p.name, locale).replace(/^(One Click|ون كليك) /, "")}
        </Link>
      </li>
    ));
  return (
    <div className="parade group relative overflow-hidden py-6" dir="ltr">
      <ul className="parade-track flex w-max gap-4 group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]">
        {row(false)}
        {row(true)}
      </ul>
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 start-0 w-16 bg-gradient-to-r from-bg to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 end-0 w-16 bg-gradient-to-l from-bg to-transparent" />
    </div>
  );
}
