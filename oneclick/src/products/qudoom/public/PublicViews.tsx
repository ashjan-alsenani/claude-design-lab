"use client";

import { useState, type ReactNode } from "react";
import { ArrowSquareOutIcon, CalendarHeartIcon, CheckCircleIcon, CopyIcon, EyeIcon, GiftIcon, ShieldCheckIcon, UserPlusIcon } from "@phosphor-icons/react";
import { qCopy, type Lang } from "../i18n";
import { currencyDigits, type Currency, type ThemeId } from "../model/types";
import { toMajor } from "../model/engine";
import type { DayView, GiftView, ManageView } from "../server/public";
import { acceptHelperInvite, manageAction, requestVisit, reserveGift } from "../server/actions";
import { QudoomMark } from "../ui/Art";
import { Badge, Button, Card, Field, TextArea, Toggle, cx, inputCls } from "../ui/kit";

/*
 * Guests' pages: no account, no app state. They show only what the mother published, and every
 * button goes to a server action that re-checks the link, the counts and the limits itself.
 */

type Head = { name: string; theme: ThemeId; currency: string };

const fmt = (lang: Lang) => ({
  date: (iso: string) => new Intl.DateTimeFormat(lang === "ar" ? "ar-OM" : "en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`)),
  day: (iso: string) => new Intl.DateTimeFormat(lang === "ar" ? "ar-OM" : "en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`)),
  time: (hm: string) => new Intl.DateTimeFormat(lang === "ar" ? "ar-OM" : "en-GB", { hour: "numeric", minute: "2-digit", timeZone: "UTC" }).format(new Date(`2000-01-01T${hm}:00Z`)),
  num: (n: number) => new Intl.NumberFormat(lang === "ar" ? "ar-OM" : "en-GB").format(n),
  money: (minor: number, cur: string) => {
    const c = (cur in currencyDigits ? cur : "OMR") as Currency;
    return new Intl.NumberFormat(lang === "ar" ? "ar-OM" : "en-GB", { style: "currency", currency: c, minimumFractionDigits: 0, maximumFractionDigits: currencyDigits[c] }).format(toMajor(minor, c));
  },
  stamp: (isoTs: string) => new Intl.DateTimeFormat(lang === "ar" ? "ar-OM" : "en-GB", { day: "numeric", month: "long", hour: "numeric", minute: "2-digit" }).format(new Date(isoTs)),
});

export function PublicFrame({ lang, theme, preview, children }: { lang: Lang; theme?: ThemeId; preview?: boolean; children: ReactNode }) {
  const t = qCopy[lang].pub;
  return (
    <div className="qd qd-wallpaper min-h-dvh" data-theme={theme ?? "cloud"} dir={lang === "ar" ? "rtl" : "ltr"} lang={lang}>
      {preview && (
        <p className="flex items-center justify-center gap-2 bg-[var(--qd-ink)] px-4 py-2 text-center text-[13px] text-white">
          <EyeIcon size={16} /> {t.previewBanner} · {t.previewNoAction}
        </p>
      )}
      <main className="mx-auto max-w-2xl px-4 pb-16 pt-8 sm:px-6">{children}</main>
      <footer className="mx-auto flex max-w-2xl items-center justify-center gap-2 px-4 pb-10 text-[12.5px] text-[var(--qd-muted)]">
        <QudoomMark size={20} /> {t.madeWith}
      </footer>
    </div>
  );
}

export function Unavailable({ lang }: { lang: Lang }) {
  return (
    <PublicFrame lang={lang}>
      <Card className="mt-10 p-8 text-center">
        <ShieldCheckIcon size={30} className="mx-auto text-[var(--qd-primary)]" />
        <p className="mt-3 text-[16px]">{qCopy[lang].pub.invalid}</p>
      </Card>
    </PublicFrame>
  );
}

const reasonText = (lang: Lang, reason: string) => {
  const t = qCopy[lang].pub;
  return reason === "full" ? t.soldOut : reason === "rate_limited" ? t.rateLimited : reason === "not_found" ? t.invalid : qCopy[lang].common.saveError;
};

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function KeepLink({ lang, url, label }: { lang: Lang; url: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="space-y-2 rounded-[16px] bg-[var(--qd-tint-2)] p-4">
      <p className="text-[13.5px] font-medium">{label}</p>
      <p dir="ltr" className="break-all text-start text-[12.5px]">{url}</p>
      <Button size="sm" variant="secondary" onClick={async () => setCopied(await copy(url))}>
        <CopyIcon size={15} /> {copied ? qCopy[lang].common.copied : qCopy[lang].common.copy}
      </Button>
    </div>
  );
}

// ---------- gift list ----------
export function GiftListView({ lang, token, head, gifts: initial, reserveDays, preview }: { lang: Lang; token: string; head: Head; gifts: GiftView[]; reserveDays: number; preview: boolean }) {
  const t = qCopy[lang].pub;
  const f = fmt(lang);
  const [gifts, setGifts] = useState(initial);
  const [open, setOpen] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [name, setName] = useState("");
  const [anon, setAnon] = useState(false);
  const [bought, setBought] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<{ manageUrl: string; expiresAt: string; purchased: boolean } | null>(null);
  const avail = gifts.filter((g) => g.available > 0);

  const submit = async (g: GiftView) => {
    if (preview || busy) return;
    setBusy(true);
    setErr(null);
    const r = await reserveGift({ token, giftId: g.id, qty, name: name.trim(), anonymous: anon, purchased: bought, locale: lang });
    setBusy(false);
    if (!r.ok) {
      setErr(reasonText(lang, r.reason));
      if (r.reason === "full") setGifts((list) => list.map((x) => (x.id === g.id ? { ...x, available: Math.max(0, x.available - qty) } : x)));
      return;
    }
    setGifts((list) => list.map((x) => (x.id === g.id ? { ...x, available: x.available - qty } : x)));
    setDone(r);
    setOpen(null);
  };

  return (
    <PublicFrame lang={lang} theme={head.theme} preview={preview}>
      <header className="text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-[18px] bg-[var(--qd-tint)] text-[var(--qd-primary)]">
          <GiftIcon size={28} weight="duotone" />
        </span>
        <h1 className="mt-4 text-[1.75rem] font-bold">{t.giftsTitle(head.name)}</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-[var(--qd-ink-soft)]">{t.giftsSub}</p>
        <p className="mt-2 text-[12.5px] text-[var(--qd-muted)]">{qCopy[lang].registry.noPayments}</p>
      </header>

      {done && (
        <Card className="mt-6 space-y-3 p-5" role="status">
          <p className="flex items-center gap-2 text-[17px] font-semibold">
            <CheckCircleIcon size={22} weight="fill" className="text-[var(--qd-sage)]" /> {done.purchased ? t.boughtOk : t.reservedOk}
          </p>
          {!done.purchased && <p className="text-[13.5px] text-[var(--qd-ink-soft)]">{t.expiresOn(f.stamp(done.expiresAt))}</p>}
          <KeepLink lang={lang} url={done.manageUrl} label={t.reservedKeep} />
        </Card>
      )}

      {err && !avail.some((g) => g.id === open) && (
        <p role="alert" className="mt-6 rounded-[14px] bg-[var(--qd-amber-soft)] px-4 py-3 text-[14px] font-medium text-[var(--qd-amber)]">{err}</p>
      )}
      {avail.length === 0 ? (
        <Card className="mt-6 p-8 text-center text-[15px]">{t.none}</Card>
      ) : (
        <ul className="mt-6 space-y-3">
          {avail.map((g) => (
            <li key={g.id}>
              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{g.name}</p>
                    <p className="mt-0.5 text-[13px] text-[var(--qd-muted)]">{[g.spec, g.priceLabel ?? null].filter(Boolean).join(" · ")}</p>
                    {g.publicNote && <p className="mt-1.5 text-[13.5px] text-[var(--qd-ink-soft)]">{g.publicNote}</p>}
                  </div>
                  <Badge tone="primary">{t.qtyLeft(f.num(g.available))}</Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {g.url && (
                    <a href={g.url} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex h-9 items-center gap-1.5 rounded-full border-2 border-[var(--qd-line)] px-4 text-[13px] font-semibold">
                      <ArrowSquareOutIcon size={15} /> {t.buyLink}
                    </a>
                  )}
                  {open !== g.id && (
                    <Button size="sm" onClick={() => (setOpen(g.id), setQty(1), setErr(null), setBought(false))}>
                      {t.reserve}
                    </Button>
                  )}
                </div>
                {open === g.id && (
                  <form className="mt-4 space-y-3 border-t border-[var(--qd-line)] pt-4" onSubmit={(e) => (e.preventDefault(), submit(g))}>
                    {g.available > 1 && (
                      <Field label={t.reserveQty} htmlFor={`q-${g.id}`}>
                        <input id={`q-${g.id}`} type="number" min={1} max={g.available} dir="ltr" className={`${inputCls} text-start`} value={qty} onChange={(e) => setQty(Math.max(1, Math.min(g.available, Math.round(Number(e.target.value) || 1))))} />
                      </Field>
                    )}
                    <Field label={t.yourName} htmlFor={`n-${g.id}`}>
                      <input id={`n-${g.id}`} className={inputCls} maxLength={60} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                    </Field>
                    <Toggle checked={anon} onChange={setAnon} label={t.hideName} />
                    <Toggle checked={bought} onChange={setBought} label={t.confirmBought} />
                    {err && <p role="alert" className="text-[13px] font-medium text-[var(--qd-alert)]">{err}</p>}
                    <div className="flex gap-2">
                      <Button type="submit" disabled={busy || preview}>{t.reserveBtn}</Button>
                      <Button variant="ghost" onClick={() => setOpen(null)}>{qCopy[lang].common.cancel}</Button>
                    </div>
                    {!bought && <p className="text-[12px] text-[var(--qd-muted)]">{t.expiresOn(lang === "ar" ? `بعد ${f.num(reserveDays)} أيام` : `in ${f.num(reserveDays)} days`)}</p>}
                  </form>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-8 text-center text-[12.5px] text-[var(--qd-muted)]">{t.privacy}</p>
    </PublicFrame>
  );
}

// ---------- visits ----------
export function VisitBooker({ lang, token, head, paused, maxPeople, days, preview }: { lang: Lang; token: string; head: Head; paused: boolean; maxPeople: number; days: DayView[]; preview: boolean }) {
  const t = qCopy[lang].pub;
  const f = fmt(lang);
  const [date, setDate] = useState(days[0]?.date ?? "");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [people, setPeople] = useState(1);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [taken, setTaken] = useState<string[]>([]);
  const [done, setDone] = useState<string | null>(null);
  const day = days.find((d) => d.date === date);

  const submit = async () => {
    if (preview || busy) return;
    if (!time || !name.trim()) return setErr(qCopy[lang].common.required);
    setBusy(true);
    setErr(null);
    const r = await requestVisit({ token, date, time, people, name: name.trim(), phone: phone.trim(), note: note.trim(), locale: lang });
    setBusy(false);
    if (!r.ok) {
      if (r.reason === "full") {
        setTaken((x) => [...x, `${date}T${time}`]);
        setTime("");
        return setErr(t.full);
      }
      return setErr(reasonText(lang, r.reason));
    }
    setDone(r.manageUrl);
  };

  return (
    <PublicFrame lang={lang} theme={head.theme} preview={preview}>
      <header className="text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-[18px] bg-[var(--qd-tint)] text-[var(--qd-primary)]">
          <CalendarHeartIcon size={28} weight="duotone" />
        </span>
        <h1 className="mt-4 text-[1.75rem] font-bold">{t.visitTitle(head.name)}</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-[var(--qd-ink-soft)]">{t.visitSub}</p>
      </header>
      {done ? (
        <Card className="mt-6 space-y-3 p-5" role="status">
          <p className="flex items-center gap-2 text-[17px] font-semibold">
            <CheckCircleIcon size={22} weight="fill" className="text-[var(--qd-sage)]" /> {t.sent}
          </p>
          <p className="text-[14px] text-[var(--qd-ink-soft)]">{day?.long} · {day?.times.find((x) => x.t === time)?.label}</p>
          <KeepLink lang={lang} url={done} label={t.visitKeep} />
        </Card>
      ) : paused ? (
        <Card className="mt-6 p-8 text-center text-[15px]">{t.paused}</Card>
      ) : days.length === 0 ? (
        <Card className="mt-6 p-8 text-center text-[15px]">{t.noSlots}</Card>
      ) : (
        <Card className="mt-6 space-y-5 p-5">
          <fieldset className="min-w-0">
            <legend className="text-[13px] font-medium text-[var(--qd-ink-soft)]">{t.pick}</legend>
            <div className="qd-scroll-x -mx-1 mt-2 flex gap-2 overflow-x-auto px-1 pb-1">
              {days.map((d) => (
                <button key={d.date} type="button" aria-pressed={date === d.date} onClick={() => (setDate(d.date), setTime(""))} className={cx("h-14 shrink-0 rounded-[14px] border px-3 text-[13px]", date === d.date ? "border-[var(--qd-primary)] bg-[var(--qd-primary)] font-semibold text-white" : "border-[var(--qd-line)] bg-[var(--qd-paper)]")}>
                  {d.label}
                </button>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {day?.times.filter((x) => !taken.includes(`${date}T${x.t}`)).map(({ t: x, label }) => (
                <button key={x} type="button" aria-pressed={time === x} onClick={() => setTime(x)} className={cx("h-10 rounded-full border px-4 text-[13.5px]", time === x ? "border-[var(--qd-primary)] bg-[var(--qd-tint)] font-semibold text-[var(--qd-primary-deep)]" : "border-[var(--qd-line)] bg-[var(--qd-paper)]")}>
                  {label}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.name} htmlFor="v-name">
              <input id="v-name" className={inputCls} maxLength={60} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            </Field>
            <Field label={t.people} htmlFor="v-people">
              <select id="v-people" className={inputCls} value={people} onChange={(e) => setPeople(Number(e.target.value))}>
                {Array.from({ length: maxPeople }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>{f.num(n)}</option>
                ))}
              </select>
            </Field>
            <Field label={t.phone} htmlFor="v-phone">
              <input id="v-phone" type="tel" dir="ltr" className={`${inputCls} text-start`} maxLength={30} value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
            </Field>
          </div>
          <Field label={t.note} htmlFor="v-note">
            <TextArea id="v-note" maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} />
          </Field>
          {err && <p role="alert" className="text-[13px] font-medium text-[var(--qd-alert)]">{err}</p>}
          <Button size="lg" className="w-full" disabled={busy || preview || !time} onClick={submit}>
            {t.send}
          </Button>
        </Card>
      )}
      <p className="mt-8 text-center text-[12.5px] text-[var(--qd-muted)]">{t.privacy}</p>
    </PublicFrame>
  );
}

// ---------- a guest's own reservation / request ----------
export function ManageCard({ lang, token, view }: { lang: Lang; token: string; view: ManageView }) {
  const t = qCopy[lang].pub;
  const f = fmt(lang);
  const [status, setStatus] = useState(view.status);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const act = async (a: "purchase" | "cancel") => {
    setBusy(true);
    const r = await manageAction(token, a);
    setBusy(false);
    if (!r.ok) return setMsg(r.reason === "full" ? t.soldOut : reasonText(lang, r.reason));
    setStatus(a === "purchase" ? "purchased" : "cancelled");
    setMsg(a === "purchase" ? t.boughtOk : view.kind === "gift" ? t.cancelledOk : t.visitCancelled);
  };
  return (
    <PublicFrame lang={lang} theme={view.head.theme}>
      <Card className="mt-6 space-y-4 p-6">
        <h1 className="text-[1.4rem] font-bold">{view.kind === "gift" ? t.manageTitle : t.visitManage}</h1>
        {view.kind === "gift" ? (
          <>
            <p className="text-[16px] font-semibold">{view.gift} {view.qty > 1 && `× ${f.num(view.qty)}`}</p>
            <Badge tone={status === "purchased" ? "sage" : status === "reserved" ? "amber" : "neutral"}>{status === "purchased" ? qCopy[lang].registry.purchased : status === "reserved" ? qCopy[lang].registry.reserved : status === "expired" ? t.expired : t.reqStatus.cancelled}</Badge>
            {status === "reserved" && <p className="text-[13.5px] text-[var(--qd-ink-soft)]">{t.expiresOn(view.expiresLabel)}</p>}
            {view.url && (status === "reserved" || status === "expired") && (
              <a href={view.url} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[var(--qd-primary)]">
                <ArrowSquareOutIcon size={15} /> {t.buyLink}
              </a>
            )}
            {(status === "reserved" || status === "expired") && (
              <div className="flex flex-wrap gap-2">
                <Button disabled={busy} onClick={() => act("purchase")}>{t.confirmBought}</Button>
                {status === "reserved" && <Button variant="danger" disabled={busy} onClick={() => act("cancel")}>{t.cancelRes}</Button>}
              </div>
            )}
          </>
        ) : (
          <>
            <p className="text-[16px] font-semibold">{t.whenLabel}: {view.whenLabel}</p>
            <p className="text-[14px] text-[var(--qd-ink-soft)]">{t.people} {f.num(view.people)}</p>
            <Badge tone={status === "approved" ? "sage" : status === "pending" ? "amber" : "neutral"}>{t.reqStatus[status as keyof typeof t.reqStatus] ?? status}</Badge>
            {(status === "pending" || status === "approved") && (
              <Button variant="danger" disabled={busy} onClick={() => act("cancel")}>{t.cancelVisit}</Button>
            )}
          </>
        )}
        {msg && <p role="status" className="text-[14px] font-medium">{msg}</p>}
      </Card>
    </PublicFrame>
  );
}

// ---------- helper invite ----------
export function InviteCard({ lang, token, head, email, signedIn, alreadyHelperId, signInHref, appBase }: { lang: Lang; token: string; head: Head; email: string; signedIn: boolean; alreadyHelperId?: string; signInHref: string; appBase: string }) {
  const t = qCopy[lang].help;
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const accept = async () => {
    setBusy(true);
    const r = await acceptHelperInvite(token);
    setBusy(false);
    if (!r.ok) return setErr(r.reason === "type" ? t.wrongEmail : r.reason === "denied" ? t.signIn : t.gone);
    window.location.href = `${appBase}/${r.helperId}`;
  };
  return (
    <PublicFrame lang={lang} theme={head.theme}>
      <Card className="mt-6 space-y-4 p-6 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-[18px] bg-[var(--qd-tint)] text-[var(--qd-primary)]">
          <UserPlusIcon size={28} weight="duotone" />
        </span>
        <h1 className="text-[1.4rem] font-bold">{t.inviteTitle}</h1>
        <p className="text-[15px] text-[var(--qd-ink-soft)]">{head.name}</p>
        <p dir="ltr" className="text-[13px] text-[var(--qd-muted)]">{email}</p>
        {alreadyHelperId ? (
          <a href={`${appBase}/${alreadyHelperId}`} className="inline-flex h-11 items-center rounded-full bg-[var(--qd-primary)] px-6 text-sm font-semibold text-white">{t.openPlanner}</a>
        ) : signedIn ? (
          <Button size="lg" disabled={busy} onClick={accept}>{t.accept}</Button>
        ) : (
          <a href={signInHref} className="inline-flex h-11 items-center rounded-full bg-[var(--qd-primary)] px-6 text-sm font-semibold text-white">{t.signIn}</a>
        )}
        {err && <p role="alert" className="text-[13.5px] font-medium text-[var(--qd-alert)]">{err}</p>}
      </Card>
    </PublicFrame>
  );
}
