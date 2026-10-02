import Link from "next/link";
import type { Product } from "@/content/types";
import { tr, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { formatMoney } from "@/lib/money";
import { hueSoft, hueVar } from "@/lib/hues";
import { ProductIcon } from "./ProductIcon";
import { ProductArt } from "@/components/art/ProductArt";
import { FavoriteButton } from "./FavoriteButton";

export function ProductCard({ product, locale, d, size = "md" }: { product: Product; locale: Locale; d: Dictionary; size?: "md" | "lg" }) {
  const hue = hueVar(product.hue);
  const soon = product.status === "coming-soon";
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border-2 border-transparent bg-surface shadow-soft transition-[box-shadow,border-color] duration-300 ease-[var(--ease-out-soft)] hover:shadow-lift" style={{ ["--card-hue" as string]: hue }}>
      <div className={`relative overflow-hidden ${size === "lg" ? "h-48" : "h-44"}`} style={{ background: hueSoft(product.hue, 18) }}>
        <ProductArt hue={product.hue} className="absolute inset-x-4 inset-y-2 transition-transform duration-500 ease-[var(--ease-bounce)] group-hover:scale-[1.06] group-hover:-rotate-1" />
        <div className="absolute end-3 top-3 z-10">
          <FavoriteButton productId={product.id} labels={{ add: d.a11y.favoriteAdd, remove: d.a11y.favoriteRemove }} />
        </div>
        <div className="absolute bottom-3 start-5 flex gap-1.5">
          {product.isNew && !soon && <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-on-accent">{d.common.new}</span>}
          <span className="rounded-full bg-surface-raised/90 px-2.5 py-0.5 text-xs font-medium text-ink-soft">{d.status[product.status]}</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="flex items-center gap-2 text-lg font-bold tracking-tight text-ink">
          <span className="grid size-7 shrink-0 place-items-center rounded-[9px] text-white" style={{ background: hue }} aria-hidden="true">
            <ProductIcon hue={product.hue} size={16} weight="bold" />
          </span>
          <Link href={`/${locale}/products/${product.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {tr(product.name, locale)}
          </Link>
        </h3>
        <p className="mt-1.5 text-[0.95rem] leading-relaxed text-ink-soft">{tr(product.tagline, locale)}</p>
        <div className="mt-auto flex items-center justify-between pt-5 text-sm">
          <span className="rounded-full px-3 py-1 font-bold tabular text-ink" style={{ background: hueSoft(product.hue, 16) }}>{product.price ? formatMoney(product.price, locale) : d.common.free}</span>
          <span className="text-muted">{d.kind[product.kind]}</span>
        </div>
      </div>
    </article>
  );
}
