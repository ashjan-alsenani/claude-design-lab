"use client";

import { CalendarBlankIcon, MapPinIcon, PhoneIcon, InstagramLogoIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { useBridal } from "../app/state";
import { paymentStatus } from "../model/engine";
import type { Appointment, Payment, Vendor } from "../model/types";
import { vendorIcon } from "./icons";
import { Badge, cx, type Tone } from "./kit";

export const payTone: Record<ReturnType<typeof paymentStatus>, Tone> = { paid: "sage", partial: "gold", overdue: "alert", soon: "amber", later: "neutral" };

export function PaymentCard({ pay, onClick, compact }: { pay: Payment; onClick?: () => void; compact?: boolean }) {
  const { t, money, rel, today } = useBridal();
  const s = paymentStatus(pay, today);
  return (
    <button type="button" onClick={onClick} className="flex w-full min-w-0 items-center gap-3 rounded-[16px] border border-bj-line bg-bj-paper px-4 py-3 text-start transition-colors hover:border-bj-taupe/40">
      <span className={cx("h-10 w-1 shrink-0 rounded-full", s === "overdue" ? "bg-bj-alert" : s === "soon" ? "bg-bj-amber" : s === "paid" ? "bg-bj-sage" : "bg-bj-beige")} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] text-bj-ink">{pay.label}</span>
        <span className="mt-0.5 block text-[12.5px] text-bj-muted">{s === "paid" || s === "partial" ? t.budget.payStatus[s] : rel(pay.due)}</span>
      </span>
      <span className="text-end">
        <span className="block text-[15px] font-medium tabular-nums text-bj-ink">{money(pay.amount)}</span>
        {!compact && <Badge tone={payTone[s]}>{t.budget.payStatus[s]}</Badge>}
      </span>
    </button>
  );
}

export const vendorTone: Record<Vendor["status"], Tone> = { considering: "neutral", contacted: "neutral", quoted: "gold", shortlisted: "rose", booked: "sage", completed: "sage", cancelled: "neutral" };

export function VendorCard({ v, onClick }: { v: Vendor; onClick: () => void }) {
  const { t, money } = useBridal();
  const I = vendorIcon[v.cat];
  const price = v.final ?? v.quoted;
  return (
    <div className="flex min-w-0 flex-col rounded-[20px] border border-bj-line bg-bj-paper p-4 transition-shadow hover:shadow-[0_18px_40px_-28px_rgba(30,27,58,.25)]">
      <button type="button" onClick={onClick} className="flex items-start gap-3 text-start">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-bj-cream text-bj-gold-ink">
          <I size={20} weight="regular" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15.5px] font-medium text-bj-ink">{v.name}</span>
          <span className="text-[12.5px] text-bj-muted">{t.vendors.cats[v.cat]}</span>
        </span>
        <Badge tone={vendorTone[v.status]}>{t.vendors.status[v.status]}</Badge>
      </button>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-bj-ink-soft">
        {price !== undefined && <span className="tabular-nums">{money(price)}</span>}
        {v.deposit !== undefined && v.final !== undefined && (
          <span className="text-bj-muted">
            {t.vendors.fields.remaining}: <span className="tabular-nums">{money(Math.max(0, v.final - v.deposit))}</span>
          </span>
        )}
        {v.status === "booked" && !v.contractSigned && (
          <span className="inline-flex items-center gap-1 text-bj-amber">
            <WarningCircleIcon size={14} weight="regular" />
            {t.vendors.noContract}
          </span>
        )}
      </div>
      {(v.phone || v.instagram) && (
        <div className="mt-3 flex gap-2 border-t border-bj-line pt-3">
          {v.phone && (
            <a href={`tel:${v.phone.replace(/\s/g, "")}`} className="inline-flex h-8 items-center gap-1.5 rounded-full bg-bj-cream px-3 text-[12.5px] text-bj-ink" dir="ltr">
              <PhoneIcon size={14} weight="regular" />
              {t.vendors.call}
            </a>
          )}
          {v.instagram && (
            <a href={`https://instagram.com/${v.instagram.replace(/^@/, "")}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-8 items-center gap-1.5 rounded-full bg-bj-cream px-3 text-[12.5px] text-bj-ink" dir="ltr">
              <InstagramLogoIcon size={14} weight="regular" />
              {v.instagram}
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export function AppointmentCard({ a, onClick }: { a: Appointment; onClick?: () => void }) {
  const { t, date, rel, lang } = useBridal();
  const d = new Date(`${a.date}T00:00:00Z`);
  return (
    <button type="button" onClick={onClick} className={cx("flex w-full min-w-0 items-center gap-3.5 rounded-[16px] border border-bj-line bg-bj-paper px-3.5 py-3 text-start transition-colors hover:border-bj-taupe/40", a.done && "opacity-60")}>
      <span className="flex w-12 shrink-0 flex-col items-center rounded-[12px] bg-bj-blush py-1.5 text-bj-rose">
        <span className="text-[10.5px] uppercase tracking-wider">{new Intl.DateTimeFormat(lang === "ar" ? "ar-OM" : "en-GB", { month: "short", timeZone: "UTC" }).format(d)}</span>
        <span className="bj-serif text-[1.35rem] leading-none">{new Intl.DateTimeFormat(lang === "ar" ? "ar-OM" : "en-GB", { day: "numeric", timeZone: "UTC" }).format(d)}</span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] text-bj-ink">{a.title}</span>
        <span className="mt-0.5 flex flex-wrap items-center gap-x-2.5 text-[12.5px] text-bj-muted">
          <span className="inline-flex items-center gap-1">
            <CalendarBlankIcon size={13} weight="regular" />
            {rel(a.date) === date(a.date) ? date(a.date, "weekday") : rel(a.date)}
            {a.time && <span dir="ltr">· {fmtTime(a.time, lang)}</span>}
          </span>
          {a.place && (
            <span className="inline-flex min-w-0 items-center gap-1 truncate">
              <MapPinIcon size={13} weight="regular" />
              {a.place}
            </span>
          )}
        </span>
      </span>
      <Badge tone="rose" className="hidden sm:inline-flex">
        {t.calendar.kinds[a.kind]}
      </Badge>
    </button>
  );
}

export function fmtTime(hm: string, lang: "en" | "ar") {
  const [h, m] = hm.split(":").map(Number);
  return new Intl.DateTimeFormat(lang === "ar" ? "ar-OM" : "en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC" }).format(new Date(Date.UTC(2020, 0, 1, h, m)));
}
