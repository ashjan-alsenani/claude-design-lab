"use client";

import { usePathname } from "next/navigation";
import { isLocale, defaultLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { ButtonLink } from "@/components/ui/Button";
import { LogoMark } from "@/components/brand/Logo";

export default function NotFound() {
  const seg = usePathname()?.split("/")[1];
  const locale = isLocale(seg) ? seg : defaultLocale;
  const d = getDictionary(locale);
  return (
    <section className="mx-auto flex min-h-[60dvh] max-w-xl flex-col items-center justify-center px-4 py-24 text-center">
      <LogoMark size={72} animated />
      <p className="mt-6 text-sm font-medium text-muted tabular">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{d.errors.notFoundTitle}</h1>
      <p className="mt-3 text-lg text-ink-soft">{d.errors.notFoundBody}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href={`/${locale}`}>{d.errors.home}</ButtonLink>
        <ButtonLink href={`/${locale}/products`} variant="secondary">{d.nav.explore}</ButtonLink>
      </div>
    </section>
  );
}
