import Link from "next/link";
import type { Product } from "@/content/types";
import { tr, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { formatMoney } from "@/lib/money";
import { hueSoft, hueVar } from "@/lib/hues";
import { ProductIcon } from "./ProductIcon";
import { FavoriteButton } from "./FavoriteButton";

/** Branded orbit pattern: echoes the logo's open loop. Decorative only. */
function Orbits({ color }: { color: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 200 120" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
      {[70, 52, 34].map((r, i) => (
        <circle key={r} cx="160" cy="96" r={r} fill="none" stroke={color} strokeOpacity={0.12 + i * 0.06} strokeWidth="1.5" strokeDasharray={`${r * 4.6} ${r * 1.7}`} />
      ))}
    </svg>
  );
}

export function ProductCard({ product, locale, d, size = "md" }: { product: Product; locale: Locale; d: Dictionary; size?: "md" | "lg" }) {
  const hue = hueVar(product.hue);
  const soon = product.status === "coming-soon";
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface transition-[box-shadow,border-color] duration-300 ease-[var(--ease-out-soft)] hover:border-line-strong hover:shadow-lift">
      <div className={`relative overflow-hidden ${size === "lg" ? "h-44" : "h-36"}`} style={{ background: hueSoft(product.hue, 14) }}>
        <Orbits color={hue} />
        <span className="absolute start-5 top-5 grid size-12 place-items-center rounded-[14px] bg-surface-raised shadow-soft" style={{ color: hue }}>
          <ProductIcon hue={product.hue} size={26} />
        </span>
        <div className="absolute end-3 top-3 z-10">
          <FavoriteButton productId={product.id} labels={{ add: d.a11y.favoriteAdd, remove: d.a11y.favoriteRemove }} />
        </div>
        <div className="absolute bottom-3 start-5 flex gap-1.5">
          {product.isNew && !soon && <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-on-accent">{d.common.new}</span>}
          <span className="rounded-full bg-surface-raised/90 px-2.5 py-0.5 text-xs font-medium text-ink-soft">{d.status[product.status]}</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold tracking-tight text-ink">
          <Link href={`/${locale}/products/${product.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {tr(product.name, locale)}
          </Link>
        </h3>
        <p className="mt-1.5 text-[0.95rem] leading-relaxed text-ink-soft">{tr(product.tagline, locale)}</p>
        <div className="mt-auto flex items-center justify-between pt-5 text-sm">
          <span className="font-semibold tabular text-ink">{product.price ? formatMoney(product.price, locale) : d.common.free}</span>
          <span className="text-muted">{d.kind[product.kind]}</span>
        </div>
      </div>
    </article>
  );
}
