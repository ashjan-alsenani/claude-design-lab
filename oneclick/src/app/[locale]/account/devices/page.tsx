import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircleIcon, DesktopIcon, DeviceMobileIcon, WarningCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { isLocale } from "@/i18n/config";
import { fill, licensingCopy } from "@/i18n/licensing";
import { licensing, safeNext } from "@/lib/licensing/server";
import { formatDate, requireAccount } from "@/lib/licensing/page";
import { pageMetadata } from "@/lib/seo";
import { buttonClass } from "@/components/ui/Button";
import { AccountShell } from "@/components/account/AccountShell";
import { StatusPill } from "@/components/account/StatusPill";
import { authorizeDeviceAction, removeDeviceAction, signOutEverywhereAction } from "../actions";

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return pageMetadata({ locale, path: "/account/devices", title: licensingCopy[locale].devices.title, noindex: true });
}

export default async function DevicesPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { ctx, sandbox } = await requireAccount(locale, "/account/devices");
  const sp = await searchParams;
  const next = safeNext(sp.next, locale);
  const t = licensingCopy[locale];
  const { devices, sessions, limit } = await licensing().engine.myDevices(ctx.user.id);
  const pending = ctx.session.deviceState === "pending";
  const Icon = (p: string) => (p === "ios" || p === "android" ? DeviceMobileIcon : DesktopIcon);
  const notice = sp.ok === "removed" ? t.devices.removed : sp.ok === "authorized" ? t.devices.authorized : null;

  return (
    <AccountShell locale={locale} current="devices" sandbox={sandbox} user={ctx.user}>
      <h1 className="text-3xl font-bold tracking-tight text-ink">{t.devices.title}</h1>
      <p className="mt-1 max-w-2xl text-ink-soft">{fill(t.devices.sub, { n: limit })}</p>
      {notice && (
        <p role="status" className="mt-4 flex items-center gap-2 text-sm font-medium text-success">
          <CheckCircleIcon size={18} weight="fill" />
          {notice}
        </p>
      )}

      {pending && (
        <section aria-labelledby="authorize" className="mt-6 rounded-[var(--radius-lg)] border-2 border-warning/50 bg-accent-soft p-5">
          <h2 id="authorize" className="flex items-center gap-2 text-lg font-semibold text-ink">
            <WarningCircleIcon size={22} className="text-warning" />
            {t.devices.pendingTitle}
          </h2>
          <p className="mt-2 text-ink-soft">{fill(t.devices.pendingBody, { n: limit })}</p>
          {sp.e && <p className="mt-2 text-sm font-medium text-error">{t.verify.noChallenge}</p>}
        </section>
      )}

      <ul className="mt-6 grid gap-4 md:grid-cols-2">
        {devices.length === 0 && <li className="text-ink-soft">{t.devices.noDevices}</li>}
        {devices.map((d) => {
          const I = Icon(d.platform);
          const current = d.id === ctx.session.deviceId;
          return (
            <li key={d.id} className="min-w-0 rounded-[var(--radius-lg)] border border-line bg-surface p-5">
              <div className="flex items-start gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-[14px] bg-primary-soft text-primary">
                  <I size={22} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 font-semibold text-ink">
                    <span dir="ltr">{d.name}</span>
                    {current && <StatusPill tone="good">{t.devices.thisDevice}</StatusPill>}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {t.devices.lastUsed}: {formatDate(d.lastUsedAt, locale, true)}
                  </p>
                  <p className="text-sm text-muted">
                    {t.devices.added}: {formatDate(d.firstVerifiedAt, locale)}
                  </p>
                </div>
              </div>
              {!current &&
                (pending ? (
                  <form action={authorizeDeviceAction} className="mt-4">
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="removeDeviceId" value={d.id} />
                    {next && <input type="hidden" name="next" value={next} />}
                    <button className={buttonClass("primary", "sm")}>{t.devices.replace}</button>
                  </form>
                ) : (
                  <details className="mt-4">
                    <summary className={buttonClass("secondary", "sm", "cursor-pointer list-none")}>{t.devices.remove}</summary>
                    <form action={removeDeviceAction} className="mt-3">
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="deviceId" value={d.id} />
                      <button className={buttonClass("primary", "sm", "!bg-error")}>{t.devices.confirmRemove}</button>
                    </form>
                  </details>
                ))}
            </li>
          );
        })}
      </ul>

      <section aria-labelledby="sessions" className="mt-10">
        <h2 id="sessions" className="text-lg font-semibold text-ink">
          {t.devices.sessions}
        </h2>
        <ul className="mt-3 divide-y divide-line rounded-[var(--radius-lg)] border border-line bg-surface text-sm">
          {sessions.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
              <span className="text-ink-soft" dir="ltr">
                {devices.find((d) => d.id === s.deviceId)?.name ?? "—"}
              </span>
              <span className="flex items-center gap-2 text-muted">
                {s.id === ctx.session.id && <StatusPill tone="good">{t.devices.thisDevice}</StatusPill>}
                {s.deviceState === "pending" && <StatusPill tone="warn">{t.devices.pendingTitle}</StatusPill>}
                {formatDate(s.lastSeenAt, locale, true)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap gap-3">
          <form action={signOutEverywhereAction}>
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="keep" value="1" />
            <button className={buttonClass("secondary", "sm")}>{t.devices.signOutOthers}</button>
          </form>
          <form action={signOutEverywhereAction}>
            <input type="hidden" name="locale" value={locale} />
            <button className={buttonClass("ghost", "sm")}>{t.devices.signOutAll}</button>
          </form>
        </div>
      </section>
    </AccountShell>
  );
}
