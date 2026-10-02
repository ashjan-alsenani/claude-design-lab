"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { isLocale, defaultLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { Button, ButtonLink } from "@/components/ui/Button";

// Customer-safe error screen. Technical details go to the console/server logs only.
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const seg = usePathname()?.split("/")[1];
  const locale = isLocale(seg) ? seg : defaultLocale;
  const d = getDictionary(locale);
  useEffect(() => {
    console.error("[oneclick:error]", error.digest ?? "", error.message);
  }, [error]);
  return (
    <section role="alert" className="mx-auto flex min-h-[60dvh] max-w-xl flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="text-3xl font-semibold tracking-tight text-ink">{d.errors.genericTitle}</h1>
      <p className="mt-3 text-lg text-ink-soft">{d.errors.genericBody}</p>
      {error.digest && <p className="mt-2 text-xs text-muted tabular">Ref: {error.digest}</p>}
      <div className="mt-8 flex gap-3">
        <Button onClick={reset}>{d.errors.retry}</Button>
        <ButtonLink href={`/${locale}`} variant="secondary">{d.errors.home}</ButtonLink>
      </div>
    </section>
  );
}
