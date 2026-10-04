import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { licensingCopy } from "@/i18n/licensing";
import { currentContext, safeNext } from "@/lib/licensing/server";
import { pageMetadata } from "@/lib/seo";
import { Clicky } from "@/components/brand/Clicky";
import { ProfileForm } from "@/components/account/ProfileForm";
import { countryOptions, profileUser } from "@/lib/licensing/page";

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return pageMetadata({ locale, path: "/account/welcome", title: licensingCopy[locale].profile.welcomeTitle, noindex: true });
}

/** First sign-in: name, picture and the few details we need. Every account page sends here until it's done. */
export default async function WelcomePage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const sp = await searchParams;
  const next = safeNext(sp.next, locale);
  const ctx = await currentContext();
  if (!ctx) redirect(`/${locale}/account`);
  if (ctx.user.profileCompletedAt) redirect(next ?? `/${locale}/account/products`);
  const t = licensingCopy[locale].profile;
  const error = sp.e ? (t.errors[sp.e as keyof typeof t.errors] ?? t.errors.generic) : null;

  return (
    <div className="mx-auto max-w-2xl px-4 pb-12 pt-8 sm:px-6">
      <section className="rounded-[var(--radius-xl)] border border-line bg-surface p-6 shadow-soft sm:p-8">
        <div className="flex items-center gap-4">
          <Clicky size={56} mood="happy" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{t.welcomeTitle}</h1>
          </div>
        </div>
        <p className="mt-3 leading-relaxed text-ink-soft">{t.welcomeSub}</p>
        {error && (
          <p role="alert" className="mt-4 rounded-[var(--radius-md)] bg-[color-mix(in_oklab,var(--oc-error)_10%,transparent)] px-4 py-3 text-sm font-medium text-error">
            {error}
          </p>
        )}
        <div className="mt-6">
          <ProfileForm locale={locale} t={t} securityLabel={licensingCopy[locale].nav.security} user={profileUser(ctx.user)} countries={countryOptions(locale, t.other)} from="welcome" next={next} />
        </div>
      </section>
    </div>
  );
}
