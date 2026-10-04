import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { GiftIcon, LinkBreakIcon } from "@phosphor-icons/react/dist/ssr";
import { isLocale, tr } from "@/i18n/config";
import { fill, licensingCopy } from "@/i18n/licensing";
import { products } from "@/content/products";
import { currentContext, licensing, licensingMode } from "@/lib/licensing/server";
import { pageMetadata } from "@/lib/seo";
import { ButtonLink, buttonClass } from "@/components/ui/Button";
import { SandboxBanner } from "@/components/account/SandboxBanner";
import { startClaimAction } from "../account/actions";

/**
 * "Claim / open my product" page reached from the purchase email. The link token only
 * identifies the order so we can show what's inside; the verification code is always
 * sent to the purchase email on the order, so forwarding the link transfers nothing.
 */
type Props = { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { ...pageMetadata({ locale, path: "/claim", title: licensingCopy[locale].claim.title, noindex: true }), referrer: "no-referrer" };
}

export default async function ClaimPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isLocale(locale) || licensingMode() === "unavailable") notFound();
  const sp = await searchParams;
  const t = licensingCopy[locale];
  const retryable = sp.e === "rate_limited" || sp.e === "email_failed";
  const ctx = await currentContext();
  const claim = sp.e && !retryable ? { status: "invalid" as const } : await licensing().engine.getClaim(sp.t, locale, ctx?.user.id);
  // Already signed in with the purchase email: no second code, straight to the product.
  if (claim.status === "ok" && claim.mine) redirect(claim.next);
  const notice = sp.e === "rate_limited" ? t.signin.errors.rate_limited : sp.e === "email_failed" ? t.signin.errors.email_failed : null;

  return (
    <div className="mx-auto max-w-lg px-4 pb-10 pt-8">
      <SandboxBanner locale={locale} />
      <section className="rounded-[var(--radius-xl)] border border-line bg-surface p-6 shadow-soft sm:p-8">
        {claim.status !== "ok" ? (
          <>
            <LinkBreakIcon size={40} weight="duotone" className="text-warning" />
            <h1 className="mt-4 text-2xl font-bold text-ink">{t.claim.invalidTitle}</h1>
            <p className="mt-2 text-ink-soft">{t.claim.invalidBody}</p>
            <ButtonLink href={`/${locale}/account`} className="mt-6">
              {t.claim.signIn}
            </ButtonLink>
          </>
        ) : (
          <>
            <GiftIcon size={40} weight="duotone" className="text-primary" />
            <h1 className="mt-4 text-2xl font-bold text-ink">{t.claim.title}</h1>
            {notice && (
              <p role="alert" className="mt-4 rounded-[var(--radius-md)] bg-[color-mix(in_oklab,var(--oc-error)_10%,transparent)] px-4 py-3 text-sm font-medium text-error">
                {notice}
              </p>
            )}
            <p className="mt-2 leading-relaxed text-ink-soft">{fill(t.claim.body, { email: "⁨" + claim.maskedEmail + "⁩" })}</p>
            <p className="mt-5 text-sm font-semibold text-muted">{t.claim.products}</p>
            <ul className="mt-1 list-inside list-disc text-ink">
              {claim.productIds.map((id) => (
                <li key={id}>{tr(products.find((p) => p.id === id)?.name, locale)}</li>
              ))}
            </ul>
            <form action={startClaimAction} className="mt-6">
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="token" value={sp.t} />
              <button className={buttonClass("primary", "lg", "w-full")}>{t.claim.send}</button>
            </form>
            <p className="mt-4 text-sm text-muted">{t.claim.note}</p>
          </>
        )}
      </section>
    </div>
  );
}
