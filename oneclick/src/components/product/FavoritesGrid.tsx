"use client";

import type { ReactNode } from "react";
import { HeartIcon } from "@phosphor-icons/react/dist/ssr";
import { useFavorites } from "./FavoriteButton";
import { ButtonLink } from "@/components/ui/Button";

export function FavoritesGrid({ cards, emptyText, browseLabel, browseHref }: { cards: Record<string, ReactNode>; emptyText: string; browseLabel: string; browseHref: string }) {
  const { ids } = useFavorites();
  const shown = ids.filter((id) => cards[id]);
  if (shown.length === 0) {
    return (
      <div className="rounded-[var(--radius-xl)] border border-dashed border-line-strong px-6 py-20 text-center">
        <HeartIcon size={40} weight="duotone" className="mx-auto text-muted" />
        <p className="mx-auto mt-4 max-w-sm text-lg text-ink-soft">{emptyText}</p>
        <ButtonLink href={browseHref} className="mt-6">
          {browseLabel}
        </ButtonLink>
      </div>
    );
  }
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {shown.map((id) => (
        <li key={id}>{cards[id]}</li>
      ))}
    </ul>
  );
}
