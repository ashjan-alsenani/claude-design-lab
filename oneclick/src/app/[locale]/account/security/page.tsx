import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { isLocale } from "@/i18n/config";
import { licensingCopy } from "@/i18n/licensing";
import { licensing } from "@/lib/licensing/server";
import { formatDate, requireAccount } from "@/lib/licensing/page";
import { pageMetadata } from "@/lib/seo";
import { buttonClass } from "@/components/ui/Button";
import { inputClass } from "@/components/ui/Field";
import { AccountShell } from "@/components/account/AccountShell";
import { requestEmailChangeAction } from "../actions";

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return pageMetadata({ locale, path: "/account/security", title: licensingCopy[locale].security.title, noindex: true });
}

export default async function SecurityPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { ctx, sandbox } = await requireAccount(locale, "/account/security");
  const sp = await searchParams;
  const t = licensingCopy[locale];
  const s = t.security;
  const activity = await licensing().engine.mySecurityActivity(ctx.user.id);
  const ee = sp.ee ? (t.signin.errors[sp.ee as keyof typeof t.signin.errors] ?? t.signin.errors.generic) : null;
  const ok = sp.ok === "email" ? s.emailChanged : null;
  const card = "rounded-[var(--radius-lg)] border border-line bg-surface p-5 sm:p-6";

  return (
    <AccountShell locale={locale} current="security" sandbox={sandbox} user={ctx.user}>
      <h1 className="text-3xl font-bold tracking-tight text-ink">{s.title}</h1>
      {ok && (
        <p role="status" className="mt-4 flex items-center gap-2 text-sm font-medium text-success">
          <CheckCircleIcon size={18} weight="fill" />
          {ok}
        </p>
      )}
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section aria-labelledby="email-change" className={card}>
          <h2 id="email-change" className="text-lg font-semibold text-ink">
            {s.emailTitle}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {s.accountEmail}: <span dir="ltr" className="text-ink-soft">{ctx.user.email}</span>
          </p>
          <p className="mt-2 text-sm text-ink-soft">{s.emailHelp}</p>
          {ee && (
            <p role="alert" className="mt-3 text-sm font-medium text-error">
              {ee}
            </p>
          )}
          <form action={requestEmailChangeAction} className="mt-4 space-y-4">
            <input type="hidden" name="locale" value={locale} />
            <div className="flex flex-col gap-2">
              <label htmlFor="new-email" className="text-sm font-medium text-ink">
                {s.newEmail}
              </label>
              <input id="new-email" name="email" type="email" required autoComplete="email" dir="ltr" className={inputClass} />
            </div>
            <button className={buttonClass("secondary", "md")}>{s.sendCode}</button>
          </form>
        </section>
      </div>

      <section aria-labelledby="activity" className="mt-8">
        <h2 id="activity" className="text-lg font-semibold text-ink">
          {s.activity}
        </h2>
        {activity.length === 0 ? (
          <p className="mt-2 text-sm text-muted">{s.noActivity}</p>
        ) : (
          <ul className="mt-3 divide-y divide-line rounded-[var(--radius-lg)] border border-line bg-surface text-sm">
            {activity.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                <span className={a.outcome === "suspicious" || a.outcome === "denied" ? "font-medium text-warning" : "text-ink-soft"}>{s.events[a.event]}</span>
                <span className="text-muted">{formatDate(a.at, locale, true)}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-sm text-muted">{s.privacy}</p>
      </section>
    </AccountShell>
  );
}
