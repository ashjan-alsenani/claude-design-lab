import Link from "next/link";
import { CaretRightIcon } from "@phosphor-icons/react/dist/ssr";
import type { ReactNode } from "react";

export function Breadcrumbs({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && <CaretRightIcon size={12} className="flip-rtl" aria-hidden="true" />}
            {it.href ? (
              <Link href={it.href} className="hover:text-ink">
                {it.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-ink-soft">
                {it.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHeader({ title, sub, crumbs, children }: { title: string; sub?: string; crumbs?: { href?: string; label: string }[]; children?: ReactNode }) {
  return (
    <header className="mx-auto max-w-7xl px-4 pb-10 pt-10 sm:px-6 md:pt-14 lg:px-8">
      {crumbs && <Breadcrumbs items={crumbs} />}
      <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.03em] text-ink sm:text-5xl">{title}</h1>
      {sub && <p className="mt-4 max-w-[60ch] text-lg leading-relaxed text-ink-soft">{sub}</p>}
      {children}
    </header>
  );
}
