import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { EnvelopeSimpleIcon, LockKeyIcon } from "@phosphor-icons/react/dist/ssr";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { licensingCopy } from "@/i18n/licensing";
import { currentContext, licensingMode, safeNext } from "@/lib/licensing/server";
import { pageMetadata } from "@/lib/seo";
import { Clicky } from "@/components/brand/Clicky";
import { buttonClass } from "@/components/ui/Button";
import { inputClass } from "@/components/ui/Field";
import { SandboxBanner } from "@/components/account/SandboxBanner";
import { passwordSignInAction, requestCodeAction } from "./actions";

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return pageMetadata({ locale, path: "/account", title: getDictionary(locale).account.signIn, noindex: true });
}

export default async function AccountPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const sp = await searchParams;
  const next = safeNext(sp.next, locale);
  if (await currentContext()) redirect(next ?? `/${locale}/account/products`);
  const d = getDictionary(locale);
  const t = licensingCopy[locale];
  const mode = licensingMode();
  const usePassword = sp.mode === "password";
  const error = sp.e && sp.e in t.signin.errors ? t.signin.errors[sp.e as keyof typeof t.signin.errors] : sp.e === "expired" ? t.verify.noChallenge : sp.e ? t.signin.errors.generic : null;

  if (mode === "unavailable") {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <LockKeyIcon size={40} weight="duotone" className="mx-auto text-primary" />
        <h1 className="mt-4 text-3xl font-bold text-ink">{d.account.notConnectedTitle}</h1>
        <p className="mt-3 leading-relaxed text-ink-soft">{d.account.notConnectedBody}</p>
        <p className="mt-6 text-sm">
          <Link href={`/${locale}/legal/privacy`} className="underline underline-offset-4">
            {locale === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-10 pt-8 sm:px-6">
      <SandboxBanner locale={locale} />
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.8fr]">
        <section aria-labelledby="signin-title" className="rounded-[var(--radius-xl)] border border-line bg-surface p-6 shadow-soft sm:p-8">
          <h1 id="signin-title" className="text-3xl font-bold tracking-tight text-ink">
            {t.signin.title}
          </h1>
          <p className="mt-2 leading-relaxed text-ink-soft">{t.signin.sub}</p>
          {error && (
            <p role="alert" className="mt-5 rounded-[var(--radius-md)] bg-[color-mix(in_oklab,var(--oc-error)_10%,transparent)] px-4 py-3 text-sm font-medium text-error">
              {error}
            </p>
          )}
          <form action={usePassword ? passwordSignInAction : requestCodeAction} className="mt-6 space-y-5">
            <input type="hidden" name="locale" value={locale} />
            {next && <input type="hidden" name="next" value={next} />}
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium text-ink">
                {t.signin.email}
              </label>
              <input id="email" name="email" type="email" required autoComplete="email" inputMode="email" dir="ltr" className={inputClass} />
            </div>
            {usePassword && (
              <div className="flex flex-col gap-2">
                <label htmlFor="password" className="text-sm font-medium text-ink">
                  {t.signin.password}
                </label>
                <input id="password" name="password" type="password" required autoComplete="current-password" dir="ltr" className={inputClass} />
              </div>
            )}
            <button className={buttonClass("primary", "lg", "w-full")}>
              {usePassword ? <LockKeyIcon size={20} weight="bold" /> : <EnvelopeSimpleIcon size={20} weight="bold" />}
              {usePassword ? t.signin.signInPassword : t.signin.sendCode}
            </button>
          </form>
          <p className="mt-5 text-center text-sm">
            <Link
              href={`/${locale}/account${usePassword ? "" : "?mode=password"}${next ? `${usePassword ? "?" : "&"}next=${encodeURIComponent(next)}` : ""}`}
              className="font-medium text-primary underline underline-offset-4"
            >
              {usePassword ? t.signin.useCode : t.signin.usePassword}
            </Link>
          </p>
          <p className="mt-4 text-center text-sm text-muted">{t.signin.newHere}</p>
        </section>
        <div className="hidden justify-center lg:flex">
          <Clicky size={260} mood="wink" body animate wave />
        </div>
      </div>
    </div>
  );
}
