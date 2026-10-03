import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { licensingCopy } from "@/i18n/licensing";
import { isDemoMode } from "@/lib/env";
import { readOutbox } from "@/lib/email";
import { formatDate } from "@/lib/licensing/page";

/** SANDBOX ONLY: a stand-in for the customer's inbox. 404 in production. */
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function MailboxPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { locale } = await params;
  if (!isLocale(locale) || !isDemoMode()) notFound();
  const sp = await searchParams;
  const t = licensingCopy[locale].mailbox;
  const to = sp.to?.toLowerCase();
  const mails = (await readOutbox()).filter((m) => !to || m.to === to).reverse().slice(0, 30);
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold text-ink">{t.title}</h1>
      <p role="note" className="mt-3 rounded-[var(--radius-md)] border-2 border-dashed border-warning/60 bg-accent-soft px-4 py-3 text-sm font-medium text-ink">
        {t.note}
      </p>
      {mails.length === 0 && <p className="mt-6 text-ink-soft">{t.empty}</p>}
      <ul className="mt-6 space-y-4">
        {mails.map((m) => (
          <li key={m.id} className="rounded-[var(--radius-lg)] border border-line bg-surface p-5" data-to={m.to} data-kind={m.kind}>
            <p className="text-xs text-muted" dir="ltr">
              To: {m.to} · {formatDate(m.at, locale, true)}
            </p>
            <h2 className="mt-1 font-semibold text-ink">{m.subject}</h2>
            <pre className="mt-3 whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-ink-soft" dir="auto">
              {m.text}
            </pre>
          </li>
        ))}
      </ul>
    </div>
  );
}
