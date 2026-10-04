import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { isLocale } from "@/i18n/config";
import { licensingCopy } from "@/i18n/licensing";
import { countryOptions, profileUser, requireAccount } from "@/lib/licensing/page";
import { pageMetadata } from "@/lib/seo";
import { AccountShell } from "@/components/account/AccountShell";
import { ProfileForm } from "@/components/account/ProfileForm";

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return pageMetadata({ locale, path: "/account/profile", title: licensingCopy[locale].profile.title, noindex: true });
}

export default async function ProfilePage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { ctx, sandbox } = await requireAccount(locale, "/account/profile");
  const sp = await searchParams;
  const t = licensingCopy[locale].profile;
  const error = sp.e ? (t.errors[sp.e as keyof typeof t.errors] ?? t.errors.generic) : null;

  return (
    <AccountShell locale={locale} current="profile" sandbox={sandbox} user={ctx.user}>
      <h1 className="text-3xl font-bold tracking-tight text-ink">{t.title}</h1>
      <p className="mt-2 text-ink-soft">{t.sub}</p>
      {sp.ok && !error && (
        <p role="status" className="mt-4 flex items-center gap-2 text-sm font-medium text-success">
          <CheckCircleIcon size={18} weight="fill" />
          {t.saved}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-4 text-sm font-medium text-error">
          {error}
        </p>
      )}
      <div className="mt-6 max-w-2xl rounded-[var(--radius-lg)] border border-line bg-surface p-5 sm:p-6">
        <ProfileForm locale={locale} t={t} securityLabel={licensingCopy[locale].nav.security} user={profileUser(ctx.user)} countries={countryOptions(locale, t.other)} from="profile" />
      </div>
    </AccountShell>
  );
}
