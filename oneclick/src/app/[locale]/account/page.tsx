import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LockKeyIcon } from "@phosphor-icons/react/dist/ssr";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { authStatus } from "@/lib/auth/session";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { inputClass } from "@/components/ui/Field";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return pageMetadata({ locale, path: "/account", title: getDictionary(locale).account.signIn, noindex: true });
}

export default async function AccountPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = getDictionary(locale);
  const status = authStatus();
  const a = d.account;
  const disabled = status !== "connected";
  return (
    <>
      <PageHeader title={a.title} sub={a.sub} />
      <div className="mx-auto grid max-w-5xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_1fr]">
        <section aria-labelledby="signin" className="rounded-[var(--radius-xl)] border border-line bg-surface p-6 sm:p-8">
          <h2 id="signin" className="text-xl font-semibold text-ink">
            {a.signIn}
          </h2>
          {/* Sign-in form is inert until the auth service is connected: no data leaves the page. */}
          <form className="mt-6 space-y-5" aria-describedby={disabled ? "auth-status" : undefined}>
            <fieldset disabled={disabled} className="space-y-5 disabled:opacity-60">
              <div className="flex flex-col gap-2">
                <label htmlFor="acc-email" className="text-sm font-medium text-ink">
                  {a.email}
                </label>
                <input id="acc-email" type="email" autoComplete="email" dir="ltr" className={inputClass} />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="acc-pass" className="text-sm font-medium text-ink">
                  {a.password}
                </label>
                <input id="acc-pass" type="password" autoComplete="current-password" dir="ltr" className={inputClass} />
              </div>
              <div className="flex items-center justify-between gap-3">
                <button type="submit" className="h-11 rounded-full bg-primary px-6 font-medium text-on-primary">
                  {a.signIn}
                </button>
                <span className="text-sm text-muted">{a.forgot}</span>
              </div>
            </fieldset>
          </form>
          <p className="mt-6 text-sm text-muted">
            {a.signUp}?{" "}
            <span className="font-medium text-ink-soft">{locale === "ar" ? "متاح عند الإطلاق" : "Available at launch"}</span>
          </p>
        </section>

        {disabled && (
          <section id="auth-status" className="self-start rounded-[var(--radius-xl)] bg-primary-soft p-6 sm:p-8">
            <LockKeyIcon size={36} weight="duotone" className="text-primary" />
            <h2 className="mt-4 text-xl font-semibold text-ink">{a.notConnectedTitle}</h2>
            <p className="mt-2 leading-relaxed text-ink-soft">{a.notConnectedBody}</p>
            {status === "demo" && (
              <ButtonLink href={`/${locale}/account/dashboard`} className="mt-6">
                {a.demoCta}
              </ButtonLink>
            )}
            <p className="mt-6 text-sm text-ink-soft">
              <Link href={`/${locale}/legal/privacy`} className="underline underline-offset-4">
                {locale === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}
              </Link>
            </p>
          </section>
        )}
      </div>
    </>
  );
}
