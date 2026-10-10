import Link from "next/link";
import type { Category, Product } from "@/content/types";
import { plural, tr, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { hueVar } from "@/lib/hues";
import { ButtonLink } from "@/components/ui/Button";
import { ProductCard } from "./ProductCard";

/** Shared catalog body used by /products and /collections/[slug]. Filters are links (crawlable, no JS needed). */
export function CatalogView({
  products,
  categories,
  active,
  locale,
  d,
}: {
  products: Product[];
  categories: Category[];
  active?: string;
  locale: Locale;
  d: Dictionary;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <nav aria-label={d.nav.collections} className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <ul className="flex gap-2 pb-2 sm:flex-wrap">
          <li>
            <Link
              href={`/${locale}/products`}
              aria-current={!active ? "page" : undefined}
              className="inline-flex h-10 items-center whitespace-nowrap rounded-full border border-line px-4 text-sm font-medium text-ink-soft hover:border-line-strong aria-[current=page]:border-ink aria-[current=page]:bg-ink aria-[current=page]:text-bg"
            >
              {d.catalog.filterAll}
            </Link>
          </li>
          {categories.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/${locale}/collections/${c.slug}`}
                aria-current={active === c.slug ? "page" : undefined}
                className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-full border border-line px-4 text-sm font-medium text-ink-soft hover:border-line-strong aria-[current=page]:border-ink aria-[current=page]:bg-ink aria-[current=page]:text-bg"
              >
                <span className="size-2 rounded-full" style={{ background: hueVar(c.hue) }} aria-hidden="true" />
                {tr(c.name, locale)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* The count heads the product list, so each card's h3 sits under an h2. */}
      <h2 className="mt-6 text-sm font-normal text-muted" aria-live="polite">
        {plural(locale, products.length, d.catalog.count)}
      </h2>

      {products.length === 0 ? (
        <div className="mt-6 rounded-[var(--radius-lg)] border border-dashed border-line-strong px-6 py-16 text-center">
          <p className="text-lg text-ink-soft">{d.catalog.empty}</p>
          <ButtonLink href={`/${locale}/products`} variant="secondary" className="mt-6">
            {d.catalog.emptyCta}
          </ButtonLink>
        </div>
      ) : (
        <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p, i) => (
            <li key={p.id} className={i === 0 && products.length > 3 ? "sm:col-span-2 lg:col-span-1" : ""}>
              <ProductCard product={p} locale={locale} d={d} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
