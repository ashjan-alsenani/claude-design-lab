"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
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
  StorefrontIcon,
  SunHorizonIcon,
  UsersThreeIcon,
  WalletIcon,
  CaretDownIcon,
  DiamondIcon,
  SignOutIcon,
  type Icon,
} from "@phosphor-icons/react";
import { useBridal } from "./state";
import { LogoMark } from "@/components/brand/Logo";
import { BrandMark, Petals } from "../ui/Art";
import { notifications, search } from "../model/engine";
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

const topNav: Exclude<SectionKey, "more">[] = ["", "checklist", "budget", "vendors", "calendar", "guests"];
const moreNav: Exclude<SectionKey, "more">[] = ["bride", "closet", "shopping", "home", "honeymoon", "day", "inspiration", "documents", "settings"];
const bottom: SectionKey[] = ["", "checklist", "budget", "calendar", "more"];

export function Shell({ section, children, exitHref, buyHref }: { section: SectionKey; children: ReactNode; exitHref: string; buyHref?: string }) {
  const { t, href, ws, today, mode, saveState, retry, lang, tasks, celebration, dismissCelebration, locale } = useBridal();
  const label = useNavLabel();
  const reduce = useReducedMotion();
  const [searchOpen, setSearchOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLLIElement>(null);
  const pathname = usePathname();
  const otherLocale = locale === "ar" ? "en" : "ar";
  const switchHref = pathname.replace(`/${locale}/`, `/${otherLocale}/`);
  const notes = useMemo(() => notifications(ws, tasks, today), [ws, tasks, today]);
  const moreActive = !bottom.includes(section);

  useEffect(() => {
    if (!celebration) return;
    const id = setTimeout(dismissCelebration, 3600);
    return () => clearTimeout(id);
  }, [celebration, dismissCelebration]);

  useEffect(() => setMoreOpen(false), [section]);
  useEffect(() => {
    if (!moreOpen) return;
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !moreRef.current?.contains(e.target as Node)) setMoreOpen(false);
    };
    window.addEventListener("keydown", close);
    window.addEventListener("pointerdown", close);
    return () => {
      window.removeEventListener("keydown", close);
      window.removeEventListener("pointerdown", close);
    };
  }, [moreOpen]);

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
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-bj-champagne px-4 py-2 text-center text-[12.5px] font-medium text-bj-ink">
          <span>{t.top.demo}</span>
          {buyHref && (
            <Link href={buyHref} className="font-bold text-bj-ink underline underline-offset-4">
              {t.brand} →
            </Link>
          )}
        </div>
      )}
      {/* Top bar: brand, main sections, then language, search, alerts and the bride */}
      <header className="sticky top-0 z-30 border-b border-bj-line/80 bg-bj-paper/80 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-[1320px] items-center gap-3 px-4 sm:px-6 lg:h-[76px] lg:px-8">
          <Link href={href()} className="shrink-0" aria-label={t.brand}>
            <BrandMark />
          </Link>
          <span className="h-7 w-px shrink-0 bg-bj-line max-[359px]:hidden" aria-hidden="true" />
          <Link href={`/${locale}`} aria-label="One Click" title="One Click" className="shrink-0 transition-transform duration-300 hover:-rotate-6 hover:scale-110">
            <LogoMark size={26} />
          </Link>

          <nav aria-label={t.brand} className="mx-auto hidden h-full items-stretch xl:flex">
            <ul className="flex items-stretch gap-1">
              {topNav.map((k) => {
                const active = section === k;
                return (
                  <li key={k || "overview"} className="flex">
                    <Link
                      href={href(k)}
                      aria-current={active ? "page" : undefined}
                      className={cx("relative flex items-center px-3 text-[14px] transition-colors", active ? "font-medium text-bj-gold-ink" : "text-bj-ink-soft hover:text-bj-ink")}
                    >
                      {k === "" ? t.nav.home : label(k)}
                      {active && <motion.span layoutId="bj-nav-line" className="absolute inset-x-3 bottom-0 h-[2px] rounded-full bg-bj-gold-ink" />}
                    </Link>
                  </li>
                );
              })}
              <li ref={moreRef} className="relative flex">
                <button
                  type="button"
                  aria-expanded={moreOpen}
                  onClick={() => setMoreOpen((v) => !v)}
                  className={cx("flex items-center gap-1 px-3 text-[14px] transition-colors", moreActive && section !== "more" ? "font-medium text-bj-gold-ink" : "text-bj-ink-soft hover:text-bj-ink")}
                >
                  {t.nav.more}
                  <CaretDownIcon size={13} className={cx("transition-transform duration-300", moreOpen && "rotate-180")} />
                </button>
                <AnimatePresence>
                  {moreOpen && (
                    <motion.div
                      initial={reduce ? false : { opacity: 0, y: -6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute end-0 top-[calc(100%-6px)] z-40 grid w-[440px] grid-cols-2 gap-1 rounded-[20px] border border-bj-line bg-bj-paper p-2 shadow-[0_30px_60px_-30px_rgba(80,50,40,.3)]"
                    >
                      {moreNav.map((k) => {
                        const I = navIcons[k];
                        return (
                          <Link key={k} href={href(k)} onClick={() => setMoreOpen(false)} className="bj-icon-hover flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-[14px] text-bj-ink hover:bg-bj-cream">
                            <span className="grid size-9 place-items-center rounded-full bg-bj-cream text-bj-gold-ink">
                              <I size={18} className="bj-icon" />
                            </span>
                            {label(k)}
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            </ul>
          </nav>

          <div className="ms-auto flex items-center gap-1 xl:ms-0">
            <span className="hidden me-2 lg:inline-flex">{save}</span>
            <Link href={switchHref} hrefLang={otherLocale} className="hidden items-center rounded-full border border-bj-line bg-bj-ivory p-0.5 text-[12px] sm:inline-flex">
              <span className={cx("rounded-full px-2.5 py-1", lang === "en" ? "bg-bj-paper font-medium text-bj-ink shadow-sm" : "text-bj-muted")}>EN</span>
              <span className={cx("rounded-full px-2.5 py-1", lang === "ar" ? "bg-bj-paper font-medium text-bj-ink shadow-sm" : "text-bj-muted")}>العربية</span>
            </Link>
            <IconButton label={t.top.search} onClick={() => setSearchOpen(true)} className="bj-icon-hover">
              <MagnifyingGlassIcon size={20} className="bj-icon" />
            </IconButton>
            <IconButton label={t.top.notifications} onClick={() => setBellOpen(true)} className="bj-icon-hover relative">
              <BellIcon size={20} className="bj-icon" />
              {notes.length > 0 && <span className="absolute end-2 top-2 size-2 rounded-full bg-bj-rose ring-2 ring-bj-paper" />}
            </IconButton>
            {ws.profile && (
              <Link href={href("settings")} aria-label={label("settings")} className="ms-1 hidden size-10 place-items-center rounded-full bg-[linear-gradient(135deg,#f3e2db,#e6cbc0)] text-[15px] font-medium text-bj-gold-ink ring-2 ring-bj-paper sm:grid">
                {ws.profile.brideName.slice(0, 1)}
              </Link>
            )}
            <Link href={exitHref} aria-label={t.top.exit} title={t.top.exit} className="hidden size-10 place-items-center rounded-full text-bj-muted hover:bg-bj-cream hover:text-bj-ink xl:grid">
              <SignOutIcon size={19} className="rtl:rotate-180" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1320px] px-4 pb-32 pt-6 sm:px-6 lg:px-8 lg:pb-16 lg:pt-8">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={section} initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? undefined : { opacity: 0, y: -6 }} transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}>
            {children}
          </motion.div>
        </AnimatePresence>
        <div className="mt-10 sm:hidden">{save}</div>
        <footer className="mt-14 flex flex-wrap items-center justify-center gap-2 text-[12.5px] text-bj-muted">
          <span>{t.brand}</span>
          <span aria-hidden="true">·</span>
          <Link href={`/${locale}`} className="inline-flex items-center gap-1.5 hover:text-bj-ink" dir="ltr">
            <LogoMark size={18} color="#13B6A7" />
            One Click
          </Link>
        </footer>
      </main>

      {/* Mobile bottom navigation */}
      <nav aria-label={t.brand} className="fixed inset-x-0 bottom-0 z-40 border-t border-bj-line bg-bj-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
        <ul className="mx-auto grid max-w-lg grid-cols-5">
          {bottom.map((k) => {
            const I = k === "more" ? DotsThreeOutlineIcon : navIcons[k];
            const active = k === "more" ? moreActive : section === k;
            return (
              <li key={k || "overview"}>
                <Link href={href(k)} aria-current={active ? "page" : undefined} className={cx("flex h-16 flex-col items-center justify-center gap-1 text-[11px]", active ? "text-bj-ink" : "text-bj-muted")}>
                  <span className={cx("grid h-8 w-12 place-items-center rounded-full transition-colors duration-300", active && "bg-bj-champagne")}>
                    <I key={String(active)} size={21} weight={active ? "fill" : "light"} className={active ? "bj-icon-pop text-bj-gold-ink" : ""} />
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
            className="fixed inset-x-4 bottom-24 z-50 mx-auto flex max-w-sm items-center gap-4 rounded-[22px] border border-bj-beige bg-bj-paper px-5 py-4 shadow-[0_24px_60px_-24px_rgba(80,50,40,.25)] lg:bottom-10"
            onClick={dismissCelebration}
          >
            <span className="relative grid size-14 shrink-0 place-items-center rounded-full bj-shine bg-[linear-gradient(135deg,#f6ebe6,#e9d3ca)] text-bj-gold-ink">
              <Petals count={14} />
              <DiamondIcon size={24} weight="duotone" className="bj-icon-breathe" />
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
            <Link href={href(n.section)} onClick={onPick} className={cx("flex items-start gap-3 rounded-[14px] border px-3.5 py-3 text-[14px] leading-snug", urgent ? "border-[#ecd6d2] bg-[#fbf0ee] text-bj-ink" : "border-bj-line bg-bj-paper text-bj-ink")}>
              <span className={cx("mt-1.5 size-2 shrink-0 rounded-full", urgent ? "bg-bj-alert" : "bg-bj-gold")} />
              {text(n)}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
