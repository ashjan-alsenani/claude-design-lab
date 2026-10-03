"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AirplaneTiltIcon,
  BellIcon,
  CalendarBlankIcon,
  CheckSquareOffsetIcon,
  CloudCheckIcon,
  CloudSlashIcon,
  CoatHangerIcon,
  DotsThreeOutlineIcon,
  DressIcon,
  FileTextIcon,
  GearSixIcon,
  HouseIcon,
  HouseLineIcon,
  ImagesIcon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  SparkleIcon,
  StorefrontIcon,
  SunHorizonIcon,
  UsersThreeIcon,
  WalletIcon,
  ArrowLeftIcon,
  DiamondIcon,
  type Icon,
} from "@phosphor-icons/react";
import { useBridal } from "./state";
import { Logo, LogoMark } from "@/components/brand/Logo";
import { Flourish, Petals } from "../ui/Art";
import { diffDays, notifications, search } from "../model/engine";
import { Badge, IconButton, Sheet, cx, inputCls } from "../ui/kit";

export type SectionKey = "" | "checklist" | "calendar" | "budget" | "vendors" | "guests" | "bride" | "closet" | "shopping" | "home" | "honeymoon" | "inspiration" | "documents" | "day" | "settings" | "more";

export const navIcons: Record<Exclude<SectionKey, "more">, Icon> = {
  "": HouseIcon,
  checklist: CheckSquareOffsetIcon,
  calendar: CalendarBlankIcon,
  budget: WalletIcon,
  vendors: StorefrontIcon,
  guests: UsersThreeIcon,
  bride: DressIcon,
  closet: CoatHangerIcon,
  shopping: ShoppingBagIcon,
  home: HouseLineIcon,
  honeymoon: AirplaneTiltIcon,
  inspiration: ImagesIcon,
  documents: FileTextIcon,
  day: SunHorizonIcon,
  settings: GearSixIcon,
};

export function useNavLabel() {
  const { t } = useBridal();
  return (k: SectionKey) =>
    ({
      "": t.nav.overview,
      checklist: t.nav.checklist,
      calendar: t.nav.calendar,
      budget: t.nav.budget,
      vendors: t.nav.vendors,
      guests: t.nav.guests,
      bride: t.nav.bride,
      closet: t.nav.closet,
      shopping: t.nav.shopping,
      home: t.nav.home_,
      honeymoon: t.nav.honeymoon,
      inspiration: t.nav.inspiration,
      documents: t.nav.documents,
      day: t.nav.day,
      settings: t.nav.settings,
      more: t.nav.more,
    })[k];
}

const sidebar: Exclude<SectionKey, "more">[] = ["", "checklist", "calendar", "budget", "vendors", "guests", "bride", "closet", "shopping", "home", "honeymoon", "day", "inspiration", "documents", "settings"];
const bottom: SectionKey[] = ["", "checklist", "budget", "calendar", "more"];

export function Shell({ section, children, exitHref, buyHref }: { section: SectionKey; children: ReactNode; exitHref: string; buyHref?: string }) {
  const { t, href, ws, today, num, mode, saveState, retry, lang, tasks, celebration, dismissCelebration, locale } = useBridal();
  const label = useNavLabel();
  const reduce = useReducedMotion();
  const [searchOpen, setSearchOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const pathname = usePathname();
  const otherLocale = locale === "ar" ? "en" : "ar";
  const switchHref = pathname.replace(`/${locale}/`, `/${otherLocale}/`);
  const notes = useMemo(() => notifications(ws, tasks, today), [ws, tasks, today]);
  const days = ws.profile ? diffDays(today, ws.profile.weddingDate) : 0;
  const moreActive = !bottom.includes(section);

  useEffect(() => {
    if (!celebration) return;
    const id = setTimeout(dismissCelebration, 3600);
    return () => clearTimeout(id);
  }, [celebration, dismissCelebration]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const save =
    mode === "demo" || saveState === "idle" ? null : saveState === "error" ? (
      <button type="button" onClick={retry} className="inline-flex items-center gap-1.5 rounded-full bg-bj-alert-soft px-3 py-1 text-[12px] font-medium text-bj-alert">
        <CloudSlashIcon size={14} />
        {t.common.retry}
      </button>
    ) : (
      <span className="inline-flex items-center gap-1.5 text-[12px] text-bj-muted" role="status">
        <CloudCheckIcon size={15} weight="regular" />
        {saveState === "saving" ? t.top.saving : t.top.saved}
      </span>
    );

  return (
    <div className="bj min-h-dvh" dir={lang === "ar" ? "rtl" : "ltr"} lang={lang}>
      {mode === "demo" && (
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-[#f6e1e7] px-4 py-2 text-center text-[12.5px] font-medium text-bj-ink">
          <span>{t.top.demo}</span>
          {buyHref && (
            <Link href={buyHref} className="font-bold text-bj-ink underline underline-offset-4">
              {t.brand} →
            </Link>
          )}
        </div>
      )}
      <div className="mx-auto flex max-w-[1440px]">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-dvh w-[252px] shrink-0 flex-col border-e border-bj-line bg-bj-paper/70 px-4 py-6 backdrop-blur lg:flex">
          <Link href={`/${locale}`} className="mb-5 flex items-center justify-center" aria-label="One Click">
            <span className="origin-center scale-[0.8]">
              <Logo />
            </span>
          </Link>
          <Link href={href()} className="block px-3 text-center">
            <span className="bj-serif bj-rosegold block text-[2rem] leading-tight">{t.brand}</span>
            <Flourish className="mx-auto mt-1" />
          </Link>
          <nav aria-label={t.brand} className="mt-7 flex-1 overflow-y-auto">
            <ul className="space-y-0.5">
              {sidebar.map((k) => {
                const I = navIcons[k];
                const active = section === k;
                return (
                  <li key={k || "overview"}>
                    <Link
                      href={href(k)}
                      aria-current={active ? "page" : undefined}
                      className={cx("flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-[14px] transition-colors", active ? "bg-bj-cream font-medium text-bj-ink" : "text-bj-ink-soft hover:bg-bj-cream/60")}
                    >
                      <I size={19} weight={active ? "regular" : "light"} className={active ? "text-bj-gold-ink" : ""} />
                      {label(k)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          {ws.profile && (
            <div className="mt-4 rounded-[16px] border border-bj-line bg-bj-ivory px-4 py-3">
              <p className="bj-serif text-[1.6rem] leading-none text-bj-ink">{num(Math.max(0, days))}</p>
              <p className="mt-1 text-[12px] text-bj-muted">{t.dash.daysUntil}</p>
            </div>
          )}
          <Link href={exitHref} className="mt-3 inline-flex items-center gap-2 px-3 text-[13px] text-bj-muted hover:text-bj-ink">
            <ArrowLeftIcon size={15} className="rtl:rotate-180" />
            {t.top.exit}
          </Link>
        </aside>

        <div className="min-w-0 flex-1">
          {/* Top bar */}
          <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-bj-line/70 bg-bj-ivory/85 px-4 backdrop-blur-md sm:px-6 lg:px-10">
            <Link href={`/${locale}`} aria-label="One Click" className="shrink-0 lg:hidden">
              {/* Distinct color: the sidebar Logo (hidden on mobile) owns the default gradient id. */}
              <LogoMark size={30} color="#13B6A7" />
            </Link>
            <Link href={href()} className="bj-serif bj-rosegold text-[1.45rem] leading-none lg:hidden">
              {t.brand}
            </Link>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="ms-auto hidden h-10 w-72 items-center gap-2 rounded-full border border-bj-line bg-bj-paper px-4 text-[13.5px] text-bj-muted hover:border-bj-taupe/40 md:flex lg:ms-0"
            >
              <MagnifyingGlassIcon size={16} />
              {t.top.search}
              <kbd className="ms-auto rounded border border-bj-line px-1.5 text-[10px]" dir="ltr">
                ⌘K
              </kbd>
            </button>
            <span className="hidden flex-1 lg:block" />
            <span className="hidden sm:inline-flex">{save}</span>
            <IconButton label={t.top.search} onClick={() => setSearchOpen(true)} className="ms-auto md:hidden">
              <MagnifyingGlassIcon size={20} weight="regular" />
            </IconButton>
            <IconButton label={t.top.notifications} onClick={() => setBellOpen(true)} className="relative">
              <BellIcon size={20} weight="regular" />
              {notes.length > 0 && <span className="absolute end-2 top-2 size-2 rounded-full bg-bj-rose ring-2 ring-bj-ivory" />}
            </IconButton>
            <Link href={switchHref} className="rounded-full px-3 py-1.5 text-[13px] text-bj-ink-soft hover:bg-bj-cream" hrefLang={otherLocale}>
              {t.top.switchLang}
            </Link>
          </header>

          <div className="px-4 pb-32 pt-6 sm:px-6 lg:px-10 lg:pb-16 lg:pt-9">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={section} initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? undefined : { opacity: 0, y: -6 }} transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}>
                {children}
              </motion.div>
            </AnimatePresence>
            <div className="mt-10 sm:hidden">{save}</div>
          </div>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <nav aria-label={t.brand} className="fixed inset-x-0 bottom-0 z-40 border-t border-bj-line bg-bj-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
        <ul className="mx-auto grid max-w-lg grid-cols-5">
          {bottom.map((k) => {
            const I = k === "more" ? DotsThreeOutlineIcon : navIcons[k];
            const active = k === "more" ? moreActive : section === k;
            return (
              <li key={k || "overview"}>
                <Link href={href(k)} aria-current={active ? "page" : undefined} className={cx("flex h-16 flex-col items-center justify-center gap-1 text-[11px]", active ? "text-bj-ink" : "text-bj-muted")}>
                  <span className={cx("grid h-8 w-12 place-items-center rounded-full transition-colors", active && "bg-bj-cream")}>
                    <I size={21} weight={active ? "regular" : "light"} className={active ? "text-bj-gold-ink" : ""} />
                  </span>
                  {k === "" ? t.nav.home : label(k)}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <SearchSheet open={searchOpen} onClose={() => setSearchOpen(false)} />
      <Sheet open={bellOpen} onClose={() => setBellOpen(false)} title={t.top.notifications}>
        <NoticeList notes={notes} onPick={() => setBellOpen(false)} />
      </Sheet>

      <AnimatePresence>
        {celebration && (
          <motion.div
            role="status"
            initial={reduce ? false : { opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-4 bottom-24 z-50 mx-auto flex max-w-sm items-center gap-4 rounded-[22px] border border-[#e6c2b6] bg-bj-paper px-5 py-4 shadow-[0_24px_60px_-24px_rgba(90,30,55,.22)] lg:bottom-10"
            onClick={dismissCelebration}
          >
            <span className="relative grid size-14 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#fbe7ed,#f4d2dc)] text-bj-gold-ink">
              <Petals count={14} />
              <DiamondIcon size={24} weight="duotone" />
            </span>
            <span>
              <span className="block text-[11px] uppercase tracking-[0.16em] text-bj-gold-ink">{t.celebrate}</span>
              <span className="bj-serif block text-[1.3rem] leading-snug text-bj-ink">{celebration} ✓</span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SearchSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, ws, tasks, href } = useBridal();
  const [q, setQ] = useState("");
  const hits = useMemo(() => search(ws, tasks, q), [ws, tasks, q]);
  return (
    <Sheet open={open} onClose={onClose} title={t.common.search}>
      <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.search.placeholder} aria-label={t.common.search} className={inputCls} autoFocus />
      {q.trim().length >= 2 && hits.length === 0 && <p className="mt-6 text-center text-sm text-bj-muted">{t.search.empty}</p>}
      <ul className="mt-4 divide-y divide-bj-line">
        {hits.map((h) => (
          <li key={`${h.kind}-${h.id}`}>
            <Link href={href(h.section)} onClick={onClose} className="flex items-center justify-between gap-3 py-3">
              <span className="min-w-0">
                <span className="block truncate text-[15px] text-bj-ink">{h.title}</span>
              </span>
              <Badge>{t.search.kinds[h.kind]}</Badge>
            </Link>
          </li>
        ))}
      </ul>
    </Sheet>
  );
}

export function NoticeList({ notes, onPick }: { notes: ReturnType<typeof notifications>; onPick?: () => void }) {
  const { t, money, rel, href, num, today } = useBridal();
  if (!notes.length) return <p className="py-6 text-center text-sm text-bj-muted">{t.alerts.none}</p>;
  const text = (n: (typeof notes)[number]) => {
    const when = (d: number) => rel(new Date(Date.parse(`${today}T00:00:00Z`) + d * 86_400_000).toISOString().slice(0, 10));
    switch (n.kind) {
      case "payment_overdue":
        return t.alerts.payment_overdue(n.label, money(n.amount ?? 0));
      case "payment_soon":
        return t.alerts.payment_soon(n.label, money(n.amount ?? 0), when(n.days));
      case "payment":
        return t.alerts.payment(n.label, money(n.amount ?? 0), when(n.days));
      case "task_overdue":
        return t.alerts.task_overdue(n.label);
      case "appt_soon":
      case "appt":
        return t.alerts.appt(n.label, when(n.days));
      case "passport":
        return t.alerts.passport;
      case "rsvp":
        return t.alerts.rsvp(num(n.count ?? 0));
      case "contract":
        return t.alerts.contract(n.label);
      case "countdown":
        return t.alerts.countdown(num(n.days));
      default:
        return n.label;
    }
  };
  return (
    <ul className="space-y-2">
      {notes.map((n) => {
        const urgent = n.kind === "payment_overdue" || n.kind === "task_overdue" || n.kind === "passport";
        return (
          <li key={n.id}>
            <Link href={href(n.section)} onClick={onPick} className={cx("flex items-start gap-3 rounded-[14px] border px-3.5 py-3 text-[14px] leading-snug", urgent ? "border-[#ecd2d4] bg-[#fdf2f4] text-bj-ink" : "border-bj-line bg-bj-paper text-bj-ink")}>
              <span className={cx("mt-1.5 size-2 shrink-0 rounded-full", urgent ? "bg-bj-alert" : "bg-bj-gold")} />
              {text(n)}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
