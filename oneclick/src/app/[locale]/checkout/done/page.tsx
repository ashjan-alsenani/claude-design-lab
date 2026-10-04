import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { licensingCopy } from "@/i18n/licensing";
import { licensingMode } from "@/lib/licensing/server";
import { testPurchasesEnabled } from "@/lib/licensing/test-purchase";
import { Clicky } from "@/components/brand/Clicky";
import { ButtonLink } from "@/components/ui/Button";
import { SandboxBanner } from "@/components/account/SandboxBanner";

export const metadata: Metadata = { robots: { index: false, follow: false } };

/** Generic result page: shows no order data, so it reveals nothing if shared. */
export default async function CheckoutDonePage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { locale } = await params;
  if (!isLocale(locale) || !(await testPurchasesEnabled())) notFound();
  const local = licensingMode() === "sandbox";
  const { r } = await searchParams;
  const t = licensingCopy[locale].checkout;
  const [title, body, mood] =
    r === "succeeded" ? [t.doneTitle, t.doneBody, "celebrate" as const] : r === "pending" ? [t.pendingTitle, t.pendingBody, "think" as const] : [t.failedTitle, t.failedBody, "surprised" as const];
  return (
    <div className="mx-auto max-w-xl px-4 pb-10 pt-8 text-center">
      <SandboxBanner locale={locale} />
      <Clicky size={130} mood={mood} body animate className="mx-auto" />
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-ink">{title}</h1>
      <p className="mt-3 leading-relaxed text-ink-soft">{body}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {local ? (
          <>
            <ButtonLink href={`/${locale}/account/products`}>{t.goProducts}</ButtonLink>
            <ButtonLink href={`/${locale}/dev/mailbox`} variant="secondary">
              {t.openMailbox}
            </ButtonLink>
          </>
        ) : (
          // Owner test on the live site: the real next step is the email, like a real customer.
          <p className="w-full rounded-[var(--radius-md)] bg-primary-soft px-4 py-3 text-sm font-medium text-ink">{t.checkEmail}</p>
        )}
      </div>
    </div>
  );
}
