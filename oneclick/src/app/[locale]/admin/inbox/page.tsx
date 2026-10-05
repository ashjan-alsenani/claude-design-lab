import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { currentContext } from "@/lib/licensing/server";
import { CUSTOM_STATUSES, getLeadStore, isOpenLead, SUPPORT_STATUSES, type StoredRecord } from "@/lib/data/leads";
import { pageMetadata } from "@/lib/seo";
import { StatusPill } from "@/components/account/StatusPill";
import { setLeadStatusAction } from "../licensing/actions";
import { Flash, btn, field, when } from "../licensing/ui";

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return pageMetadata({ locale, path: "/admin/inbox", title: "Inbox", noindex: true });
}

const labels: Record<string, string> = {
  topic: "Topic", reference: "Their order / reference", message: "Message", goal: "What they want", solutionType: "Type", audience: "Audience",
  features: "Features", references: "Examples / links", languages: "Languages", deadline: "Deadline", budget: "Budget", branding: "Branding",
  payments: "Online payments", notes: "Notes", phone: "Phone", country: "Country", locale: "Language",
};

/** Support messages (Contact page) and custom solution requests, with their status. Admin only. */
export default async function AdminInboxPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const ctx = await currentContext();
  if (!ctx?.roles.includes("admin")) notFound();
  const sp = await searchParams;
  const tab = sp.tab === "custom" ? "custom" : "messages";
  const store = getLeadStore();
  const [support, custom] = await Promise.all([store.list("support_request"), store.list("custom_request")]);
  const showAll = sp.show === "all";
  const list = (tab === "custom" ? custom : support).filter((r) => showAll || isOpenLead(r));
  const tabs = [
    { key: "messages", label: "Messages", open: support.filter(isOpenLead).length },
    { key: "custom", label: "Custom requests", open: custom.filter(isOpenLead).length },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 pb-10 pt-8 sm:px-6 lg:px-8" dir="ltr" lang="en">
      <p className="text-sm">
        <Link href={`/${locale}/admin`} className="text-primary underline underline-offset-4">
          Command center
        </Link>
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Inbox</h1>
      <p className="mt-1 text-ink-soft">Messages from the Contact page and requests from Custom solutions. You also get an email for each new one.</p>
      <nav aria-label="Inbox sections" className="mt-6 flex gap-1 border-b border-line">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/${locale}/admin/inbox?tab=${t.key}`}
            aria-current={t.key === tab ? "page" : undefined}
            className="whitespace-nowrap border-b-2 border-transparent px-4 py-2.5 text-sm text-ink-soft aria-[current=page]:border-primary aria-[current=page]:font-semibold aria-[current=page]:text-ink"
          >
            {t.label} {t.open > 0 && <span className="ms-1 rounded-full bg-primary px-2 py-0.5 text-xs text-on-primary">{t.open}</span>}
          </Link>
        ))}
      </nav>
      <Flash sp={sp} />
      <p className="mt-4 text-sm">
        {showAll ? (
          <Link href={`/${locale}/admin/inbox?tab=${tab}`} className="text-primary underline underline-offset-4">
            Show open only
          </Link>
        ) : (
          <Link href={`/${locale}/admin/inbox?tab=${tab}&show=all`} className="text-primary underline underline-offset-4">
            Show all, including finished
          </Link>
        )}
      </p>
      <ul className="mt-4 space-y-4">
        {list.length === 0 && <li className="rounded-[var(--radius-lg)] border border-line bg-surface p-6 text-center text-muted">Nothing waiting here.</li>}
        {list.map((r) => (
          <LeadCard key={r.reference} r={r} locale={locale} />
        ))}
      </ul>
    </div>
  );
}

function LeadCard({ r, locale }: { r: StoredRecord; locale: string }) {
  const d = r.data as Record<string, unknown>;
  const statuses: readonly string[] = r.kind === "custom_request" ? CUSTOM_STATUSES : SUPPORT_STATUSES;
  const email = String(d.email ?? "");
  const subject = encodeURIComponent(`One Click ${r.reference}`);
  return (
    <li id={r.reference} className="rounded-[var(--radius-lg)] border border-line bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-xs text-muted">
            {r.reference} · {when(r.createdAt)}
          </p>
          <p className="mt-1 font-semibold text-ink">{String(d.name ?? "")}</p>
          <a href={`mailto:${email}?subject=${subject}`} className="text-sm text-primary underline underline-offset-4">
            {email}
          </a>
        </div>
        <StatusPill tone={isOpenLead(r) ? "warn" : "muted"}>{r.status.replace(/_/g, " ")}</StatusPill>
      </div>
      <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[180px_1fr]">
        {Object.entries(d)
          .filter(([k, v]) => !["name", "email", "privacy", "website"].includes(k) && v !== "" && v !== undefined && !(Array.isArray(v) && v.length === 0))
          .map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-muted">{labels[k] ?? k}</dt>
              <dd className="whitespace-pre-wrap break-words text-ink" dir="auto">
                {Array.isArray(v) ? v.join(", ") : String(v)}
              </dd>
            </div>
          ))}
      </dl>
      <form action={setLeadStatusAction} className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="kind" value={r.kind} />
        <input type="hidden" name="reference" value={r.reference} />
        <label className="text-sm text-ink-soft" htmlFor={`st-${r.reference}`}>
          Status
        </label>
        <select id={`st-${r.reference}`} name="status" defaultValue={r.status} className={field}>
          {statuses.map((x) => (
            <option key={x} value={x}>
              {x.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <button className={btn}>Save</button>
        <a href={`mailto:${email}?subject=${subject}`} className="ms-auto text-sm font-medium text-primary underline underline-offset-4">
          Reply by email
        </a>
      </form>
    </li>
  );
}
