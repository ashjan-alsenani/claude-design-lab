import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { EnvelopeOpenIcon } from "@phosphor-icons/react/dist/ssr";
import { isLocale } from "@/i18n/config";
import { fill, licensingCopy } from "@/i18n/licensing";
import { COOKIE, licensing, licensingMode, safeNext } from "@/lib/licensing/server";
import { pageMetadata } from "@/lib/seo";
import { buttonClass } from "@/components/ui/Button";
import { inputClass } from "@/components/ui/Field";
import { SandboxBanner } from "@/components/account/SandboxBanner";
import { resendCodeAction, verifyCodeAction } from "../actions";

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return pageMetadata({ locale, path: "/account/verify", title: licensingCopy[locale].verify.title, noindex: true });
}

export default async function VerifyPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isLocale(locale) || licensingMode() === "unavailable") notFound();
  const sp = await searchParams;
  const next = safeNext(sp.next, locale);
  const t = licensingCopy[locale];
  const challenge = await licensing().engine.describeChallenge((await cookies()).get(COOKIE.challenge)?.value);
  const error = sp.e && sp.e in t.verify.errors ? t.verify.errors[sp.e as keyof typeof t.verify.errors] : null;

  return (
    <div className="mx-auto max-w-lg px-4 pb-10 pt-8">
      <SandboxBanner locale={locale} />
      <section className="rounded-[var(--radius-xl)] border border-line bg-surface p-6 shadow-soft sm:p-8">
        <EnvelopeOpenIcon size={40} weight="duotone" className="text-primary" />
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink">{t.verify.title}</h1>
        {!challenge ? (
          <>
            {error && (
              <p role="alert" className="mt-4 text-sm font-medium text-error">
                {error}
              </p>
            )}
            <p className="mt-3 text-ink-soft">{t.verify.noChallenge}</p>
            <Link href={`/${locale}/account${next ? `?next=${encodeURIComponent(next)}` : ""}`} className={buttonClass("primary", "md", "mt-6")}>
              {t.verify.startAgain}
            </Link>
          </>
        ) : (
          <>
            {challenge.purpose === "new_device" && <p className="mt-3 font-medium text-ink">{t.verify.newDevice}</p>}
            <p className="mt-2 leading-relaxed text-ink-soft">
              {fill(t.verify.sub, { email: "⁨" + challenge.maskedEmail + "⁩" })}
            </p>
            {error && (
              <p role="alert" className="mt-4 rounded-[var(--radius-md)] bg-[color-mix(in_oklab,var(--oc-error)_10%,transparent)] px-4 py-3 text-sm font-medium text-error">
                {error}
              </p>
            )}
            {sp.resent && !error && (
              <p role="status" className="mt-4 text-sm font-medium text-success">
                {t.verify.resent}
              </p>
            )}
            <form action={verifyCodeAction} className="mt-6 space-y-5">
              <input type="hidden" name="locale" value={locale} />
              {next && <input type="hidden" name="next" value={next} />}
              <div className="flex flex-col gap-2">
                <label htmlFor="code" className="text-sm font-medium text-ink">
                  {t.verify.code}
                </label>
                <input
                  id="code"
                  name="code"
                  required
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={12}
                  dir="ltr"
                  className={`${inputClass} text-center text-2xl font-semibold tracking-[0.5em]`}
                />
              </div>
              <button className={buttonClass("primary", "lg", "w-full")}>{t.verify.submit}</button>
            </form>
            <form action={resendCodeAction} className="mt-4 text-center">
              <input type="hidden" name="locale" value={locale} />
              {next && <input type="hidden" name="next" value={next} />}
              <button className="text-sm font-medium text-primary underline underline-offset-4">{t.verify.resend}</button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
