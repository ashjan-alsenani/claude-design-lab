import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { currentContext, licensing } from "@/lib/licensing/server";
import { StatusPill, licenseTone } from "@/components/account/StatusPill";
import { resendAccessAction, userAction } from "../../actions";
import { Card, Confirm, Flash, Hidden, btn, btnDanger, field, when } from "../../ui";

type Props = { params: Promise<{ locale: string; userId: string }>; searchParams: Promise<Record<string, string | undefined>> };

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AdminCustomerPage({ params, searchParams }: Props) {
  const { locale, userId } = await params;
  if (!isLocale(locale)) notFound();
  const ctx = await currentContext();
  if (!ctx?.roles.includes("admin")) notFound();
  const data = await licensing().engine.adminUser(ctx, userId);
  if (!data) notFound();
  const sp = await searchParams;
  const back = `/${locale}/admin/licensing/users/${userId}`;
  const { user } = data;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 lg:px-8" dir="ltr" lang="en">
      <p className="text-sm">
        <Link href={`/${locale}/admin/licensing`} className="text-primary underline underline-offset-4">
          Licensing & access
        </Link>
      </p>
      <h1 className="mt-2 break-all text-3xl font-semibold tracking-tight text-ink">{user.email}</h1>
      <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-ink-soft">
        <StatusPill tone={user.accountStatus === "active" ? "good" : "bad"}>{user.accountStatus}</StatusPill>
        Joined {when(user.createdAt)} · email verified {when(user.emailVerifiedAt)} · password {user.hasPassword ? "set" : "not set"}
        {user.emailHistory.length > 0 && <> · previous emails: {user.emailHistory.map((h) => h.email).join(", ")}</>}
      </p>
      <Flash sp={sp} />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Licenses">
          <ul className="divide-y divide-line text-sm">
            {data.licenses.length === 0 && <li className="py-2 text-muted">None.</li>}
            {data.licenses.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-2 py-2">
                <span>
                  {l.productName} <span className="text-xs text-muted">({l.orderId ?? l.source})</span>
                </span>
                <StatusPill tone={licenseTone(l.status)}>{l.status}</StatusPill>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted">Suspend, reactivate or revoke from the Licenses list.</p>
        </Card>

        <Card title="Devices">
          <ul className="divide-y divide-line text-sm">
            {data.devices.length === 0 && <li className="py-2 text-muted">None.</li>}
            {data.devices.map((d) => (
              <li key={d.id} className="py-2">
                <div className="flex items-center justify-between gap-2">
                  <span>
                    {d.name} <span className="text-xs text-muted">last used {when(d.lastUsedAt)}</span>
                  </span>
                  <StatusPill tone={d.status === "trusted" ? "good" : "muted"}>{d.status}</StatusPill>
                </div>
                {d.status === "trusted" && (
                  <form action={userAction} className="mt-2 flex flex-wrap items-center gap-2">
                    <Hidden locale={locale} back={back} userId={userId} kind="remove_device" deviceId={d.id} />
                    <input name="reason" required minLength={3} placeholder="Reason" aria-label="Reason" className={`${field} min-w-0 flex-1`} />
                    <Confirm />
                    <button className={btnDanger}>Remove</button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        </Card>

        <Card title={`Sessions (${data.sessions.length} active)`}>
          <ul className="text-sm text-ink-soft">
            {data.sessions.map((s) => (
              <li key={s.id}>
                {when(s.createdAt)} → last seen {when(s.lastSeenAt)} {s.deviceState === "pending" ? "(device pending)" : ""}
              </li>
            ))}
          </ul>
          <form action={userAction} className="mt-3 flex flex-wrap items-center gap-2">
            <Hidden locale={locale} back={back} userId={userId} kind="revoke_sessions" />
            <input name="reason" required minLength={3} placeholder="Reason" aria-label="Reason" className={`${field} min-w-0 flex-1`} />
            <Confirm />
            <button className={btnDanger}>Sign out everywhere</button>
          </form>
        </Card>

        <Card title="Account & recovery">
          <form action={userAction} className="flex flex-wrap items-center gap-2">
            <Hidden locale={locale} back={back} userId={userId} kind="set_status" status={user.accountStatus === "active" ? "suspended" : "active"} />
            <input name="reason" required minLength={3} placeholder="Reason" aria-label="Reason" className={`${field} min-w-0 flex-1`} />
            <Confirm />
            <button className={user.accountStatus === "active" ? btnDanger : btn}>{user.accountStatus === "active" ? "Suspend account" : "Reactivate account"}</button>
          </form>
          <form action={userAction} className="mt-3">
            <Hidden locale={locale} back={back} userId={userId} kind="resend_verification" />
            <button className={btn}>Send a recovery sign-in code</button>
          </form>
          <p className="mt-2 text-xs text-muted">The code goes only to the account email. Support never sees it.</p>
        </Card>

        <Card title="Orders">
          <ul className="divide-y divide-line text-sm">
            {data.orders.length === 0 && <li className="py-2 text-muted">None.</li>}
            {data.orders.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span>
                  {o.id} · {o.status} {o.sandbox ? "(sandbox)" : ""} · {when(o.createdAt)}
                </span>
                {o.status === "paid" && (
                  <form action={resendAccessAction}>
                    <Hidden locale={locale} back={back} orderId={o.id} />
                    <button className="text-sm font-medium text-primary underline underline-offset-4">Resend access email</button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Access history">
          <ul className="max-h-80 divide-y divide-line overflow-y-auto text-sm">
            {data.activity.map((a) => (
              <li key={a.id} className="flex justify-between gap-2 py-1.5">
                <span className={a.outcome === "suspicious" ? "font-semibold text-warning" : a.outcome === "denied" ? "text-error" : "text-ink"}>
                  {a.event.replace(/_/g, " ")}
                  {a.reason ? ` · ${a.reason.replace(/_/g, " ")}` : ""}
                  {a.productId ? ` · ${a.productId}` : ""}
                </span>
                <span className="text-xs text-muted">{when(a.at)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
