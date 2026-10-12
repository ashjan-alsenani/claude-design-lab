"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowCounterClockwiseIcon, BabyIcon, BagIcon, BedIcon, CalendarHeartIcon, CardsIcon, CloudCheckIcon, CloudSlashIcon, CoffeeIcon, DotsThreeOutlineIcon, EnvelopeOpenIcon, GearSixIcon,
  GiftIcon, HandHeartIcon, HeartIcon, LightbulbIcon, MapTrifoldIcon, PaletteIcon, HouseSimpleIcon, ImagesIcon, ShareNetworkIcon, SignOutIcon, SparkleIcon, StarIcon, UsersThreeIcon, WalletIcon, type Icon,
} from "@phosphor-icons/react";
import { useQ } from "./state";
import { groups, pages, type PageKey } from "../constants";
import { RemindersBell } from "../ui/Reminders";
import { BabyMascot } from "../ui/Mascot";
import { Button, cx } from "../ui/kit";

export const pageIcons: Record<PageKey, Icon> = {
  "": HouseSimpleIcon, steps: MapTrifoldIcon, looks: PaletteIcon, items: BabyIcon, bag: BagIcon, nursery: BedIcon, mother: HandHeartIcon, events: StarIcon, invite: EnvelopeOpenIcon, visits: UsersThreeIcon, hospitality: CoffeeIcon,
  favors: SparkleIcon, ideas: LightbulbIcon, registry: GiftIcon, received: HeartIcon, budget: WalletIcon, calendar: CalendarHeartIcon, memories: ImagesIcon, cards: CardsIcon, share: ShareNetworkIcon, settings: GearSixIcon, more: DotsThreeOutlineIcon,
};
const groupIcons = { home: HouseSimpleIcon, prep: BabyIcon, reception: StarIcon, gifts: GiftIcon, more: DotsThreeOutlineIcon };

export function usePageLabel() {
  const { t, plan } = useQ();
  return (p: PageKey) => {
    if (p === "nursery" && plan.profile?.nurseryKind === "corner") return t.nav.nurseryCorner;
    const map: Record<PageKey, string> = { "": t.nav.home, steps: t.nav.steps, looks: t.nav.looks, items: t.nav.items, bag: t.nav.bag, nursery: t.nav.nursery, mother: t.nav.mother, events: t.nav.events, invite: t.nav.invite, visits: t.nav.visits, hospitality: t.nav.hospitality, favors: t.nav.favors, ideas: t.nav.ideas, registry: t.nav.registry, received: t.nav.received, budget: t.nav.budget, calendar: t.nav.calendar, memories: t.nav.memories, cards: t.nav.cards, share: t.nav.share, settings: t.nav.settings, more: t.nav.more };
    return map[p];
  };
}
export function usePageVisible() {
  const { can, mode } = useQ();
  return (p: PageKey) => {
    const s = pages[p];
    if (p === "share" || p === "settings") return mode !== "helper";
    return s === null || can(s);
  };
}

export function Shell({ page, children, exitHref, buyHref, switchHref }: { page: PageKey; children: ReactNode; exitHref: string; buyHref?: string; switchHref: string }) {
  const { t, plan, href, saveState, retry, mode, remoteNote, toast, dispatch, today, lang, access } = useQ();
  const label = usePageLabel();
  const visible = usePageVisible();
  const group = groups.find((g) => g.pages.includes(page))?.key ?? "home";
  const tabs = group === "more" ? [] : groups.find((g) => g.key === group)!.pages.filter(visible);
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const up = () => setOnline(true), down = () => setOnline(false);
    setOnline(navigator.onLine);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => (window.removeEventListener("online", up), window.removeEventListener("offline", down));
  }, []);
  const sideGroups = groups.map((g) => ({ ...g, pages: g.pages.filter((p) => p !== "more" && visible(p)) })).filter((g) => g.pages.length);
  const navGroups = groups.filter((g) => g.pages.some(visible));
  const firstOf = (g: (typeof groups)[number]) => (g.key === "more" ? "more" : g.pages.find(visible) ?? "");

  return (
    <div className="qd qd-wallpaper min-h-dvh" data-theme={plan.profile?.theme ?? "cloud"} dir={lang === "ar" ? "rtl" : "ltr"} lang={lang}>
      <a href="#qd-main" className="sr-only focus:not-sr-only focus:fixed focus:start-3 focus:top-3 focus:z-50 focus:rounded-full focus:bg-[var(--qd-paper)] focus:px-4 focus:py-2">
        {lang === "ar" ? "تخطي إلى المحتوى" : "Skip to content"}
      </a>
      {mode === "demo" && (
        <div className="qd-noprint flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-[var(--qd-ink)] px-4 py-2 text-center text-[13px] text-white">
          <span>{t.top.demo}</span>
          <button type="button" onClick={() => dispatch({ t: "reset" }) && window.location.reload()} className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 font-semibold hover:bg-white/25">
            <ArrowCounterClockwiseIcon size={14} /> {t.top.resetDemo}
          </button>
          {buyHref && (
            <Link href={buyHref} className="rounded-full bg-white px-3 py-1 font-semibold text-[var(--qd-ink)]">
              {t.top.buy}
            </Link>
          )}
        </div>
      )}
      <div className="relative">
      <header className="qd-noprint relative z-30 border-b border-[var(--qd-line)] bg-[var(--qd-bg)]/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4 sm:px-6 lg:h-[76px]">
          <Link href={href()} className="flex min-w-0 shrink-0 items-center gap-2.5" aria-label={t.brand}>
            <span className="grid size-10 shrink-0 place-items-center rounded-[14px] bg-[var(--qd-primary)] text-white shadow-[0_6px_16px_-8px_var(--qd-primary)] lg:size-11">
              <BabyIcon size={22} weight="fill" />
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-[1.12rem] font-extrabold text-[var(--qd-ink)]">{mode === "helper" && access.ownerName ? t.top.helperOf(access.ownerName) : t.brand}</span>
              <span className="hidden text-[12px] font-semibold text-[var(--qd-primary)] lg:block">{lang === "ar" ? "Hikayat Qudoom • One Click" : "حكاية قدوم • One Click"}</span>
            </span>
            <span className="ms-1 hidden border-s border-[var(--qd-line)] ps-3 sm:block"><BabyMascot size={30} theme={plan.profile?.theme} animate={false} /></span>
          </Link>
          {/* Desktop: the sections as plain text links, the current one underlined. */}
          <nav aria-label={t.brand} className="mx-auto hidden h-full lg:block">
            <ul className="flex h-full items-stretch gap-1">
              {navGroups.map((g) => {
                const on = g.key === group;
                return (
                  <li key={g.key} className="flex">
                    <Link href={href(firstOf(g) || undefined)} aria-current={on ? "page" : undefined} className={cx("flex items-center border-b-2 px-3.5 text-[15px] font-semibold transition-colors", on ? "border-[var(--qd-primary)] text-[var(--qd-primary)]" : "border-transparent text-[var(--qd-ink-soft)] hover:text-[var(--qd-ink)]")}>
                      {t.nav[g.key]}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <span className="flex-1 lg:hidden" />
          <SaveBadge state={saveState} retry={retry} mode={mode} />
          <Link href={switchHref} className="hidden h-9 items-center rounded-full border border-[var(--qd-line)] bg-[var(--qd-paper)] p-0.5 text-[12.5px] font-semibold sm:inline-flex" hrefLang={lang === "ar" ? "en" : "ar"}>
            <span className={cx("rounded-full px-2.5 py-1", lang === "ar" ? "bg-[var(--qd-tint)] text-[var(--qd-primary-deep)]" : "text-[var(--qd-muted)]")}>العربية</span>
            <span className={cx("rounded-full px-2.5 py-1", lang === "en" ? "bg-[var(--qd-tint)] text-[var(--qd-primary-deep)]" : "text-[var(--qd-muted)]")}>EN</span>
          </Link>
          {plan.profile && <RemindersBell />}
          <Link href={href("more")} className="grid size-10 place-items-center rounded-full text-[var(--qd-ink-soft)] hover:bg-[var(--qd-tint-2)]" aria-label={t.nav.more} title={t.nav.more}>
            <DotsThreeOutlineIcon size={19} weight="fill" />
          </Link>
          <Link href={exitHref} className="grid size-10 place-items-center rounded-full text-[var(--qd-ink-soft)] hover:bg-[var(--qd-tint-2)]" aria-label={t.top.exit} title={t.top.exit}>
            <SignOutIcon size={19} className="rtl:-scale-x-100" />
          </Link>
        </div>
      </header>
      {!online && <p className="qd-noprint bg-[var(--qd-amber-soft)] px-4 py-2 text-center text-[13px] text-[var(--qd-amber)]">{lang === "ar" ? "ما فيه اتصال بالإنترنت. تعديلاتك محفوظة هنا وبتنرسل أول ما يرجع الاتصال." : "You're offline. Your edits are kept here and will be sent when you're back online."}</p>}
      {remoteNote && <p className="qd-noprint bg-[var(--qd-tint)] px-4 py-2 text-center text-[13px] text-[var(--qd-primary-deep)]">{lang === "ar" ? "تحدّثت البيانات من جهاز أو شخص ثاني، ودمجناها مع تعديلاتك." : "The plan was updated from another device or person; we merged it with your edits."}</p>}

      <div className="relative mx-auto flex max-w-6xl px-4 pb-32 sm:px-6 lg:pb-12">
        <main id="qd-main" className="min-w-0 flex-1 py-5 sm:py-7">
          {tabs.length > 1 && (
            <nav aria-label={t.nav[group]} className="qd-noprint qd-scroll-x -mx-4 mb-6 flex gap-2 overflow-x-auto px-4">
              {tabs.map((p) => {
                const I = pageIcons[p];
                return (
                <Link key={p} href={href(p)} aria-current={p === page ? "page" : undefined} className={cx("inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border pe-4 ps-3 text-[14px]", p === page ? "border-[var(--qd-primary)] bg-[var(--qd-primary)] font-semibold text-white" : "border-[var(--qd-line)] bg-[var(--qd-paper)] text-[var(--qd-ink-soft)] hover:border-[var(--qd-primary)]")}>
                  <I size={17} weight={p === page ? "fill" : "duotone"} aria-hidden="true" />
                  {label(p)}
                </Link>
                );
              })}
            </nav>
          )}
          <div key={page} className="qd-page">
            {children}
          </div>
        </main>
      </div>
      </div>

      <nav aria-label={t.brand} className="qd-noprint fixed inset-x-3 bottom-[max(12px,env(safe-area-inset-bottom))] z-30 rounded-[28px] bg-white/95 shadow-[0_10px_34px_-12px_rgb(30_27_58/.35)] backdrop-blur lg:hidden">
        <ul className="mx-auto flex max-w-lg">
          {navGroups.filter((g) => g.key !== "more").map((g) => {
            const I = groupIcons[g.key];
            const on = g.key === group;
            return (
              <li key={g.key} className="flex-1">
                <Link href={href(firstOf(g) || undefined)} aria-current={on ? "page" : undefined} className={cx("flex h-16 flex-col items-center justify-center gap-0.5 text-[11.5px] font-semibold", on ? "text-[var(--qd-primary)]" : "text-[#8a86a8]")}>
                  <span className={cx("grid h-8 w-12 place-items-center rounded-full transition-colors", on && "bg-[var(--qd-tint)]")}><I size={22} weight={on ? "fill" : "regular"} /></span>
                  {t.nav[g.key]}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-40 flex justify-center px-4 lg:bottom-8">
        {toast && <p className="qd-pop rounded-full bg-[var(--qd-ink)] px-5 py-2.5 text-[14px] text-white shadow-lg">{toast}</p>}
      </div>
    </div>
  );
}

function SaveBadge({ state, retry, mode }: { state: string; retry: () => void; mode: string }) {
  const { t } = useQ();
  if (mode === "demo") return null;
  if (state === "error")
    return (
      <Button size="sm" variant="soft" onClick={retry} className="!bg-[var(--qd-alert-soft)] !text-[var(--qd-alert)]">
        <CloudSlashIcon size={16} /> {t.top.error} · {t.top.retry}
      </Button>
    );
  if (state === "idle") return null;
  return (
    <span role="status" data-save={state} className="inline-flex items-center gap-1.5 text-[12.5px] text-[var(--qd-muted)]">
      <CloudCheckIcon size={16} className={state === "saving" ? "animate-pulse" : "text-[var(--qd-sage)]"} />
      <span className="hidden sm:inline">{state === "saving" ? t.top.saving : t.top.saved}</span>
    </span>
  );
}
