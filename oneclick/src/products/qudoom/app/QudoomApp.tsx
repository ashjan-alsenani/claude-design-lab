"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { EyeSlashIcon, HourglassMediumIcon } from "@phosphor-icons/react";
import { useEffect, useMemo } from "react";
import { QProvider, useQ, type Access, type Mode } from "./state";
import { Shell, usePageVisible } from "./Shell";
import { demoApi } from "./demo-api";
import { liveApi } from "./live-api";
import { pageKeys, type PageKey } from "../constants";
import type { Lang } from "../i18n";
import type { Plan } from "../model/types";
import { Home } from "../sections/Home";
import { Setup } from "../sections/Setup";
import { EmptyState } from "../ui/kit";
import { helperSync, qudoomSync } from "../server/actions";

/*
 * Each group of sections is its own script; the home screen ships with the app and the rest load
 * in the background once the page is idle, so moving between sections never waits.
 */
const load = {
  prep: () => import("../sections/Prep"),
  reception: () => import("../sections/Reception"),
  gifts: () => import("../sections/Gifts"),
  money: () => import("../sections/Money"),
  memories: () => import("../sections/Memories"),
  share: () => import("../sections/Share"),
  settings: () => import("../sections/Settings"),
};
const ItemsPage = dynamic(() => load.prep().then((m) => m.ItemsPage));
const BagPage = dynamic(() => load.prep().then((m) => m.BagPage));
const NurseryPage = dynamic(() => load.prep().then((m) => m.NurseryPage));
const MotherPage = dynamic(() => load.prep().then((m) => m.MotherPage));
const EventsPage = dynamic(() => load.reception().then((m) => m.EventsPage));
const VisitsPage = dynamic(() => load.reception().then((m) => m.VisitsPage));
const HospitalityPage = dynamic(() => load.reception().then((m) => m.HospitalityPage));
const FavorsPage = dynamic(() => load.reception().then((m) => m.FavorsPage));
const RegistryPage = dynamic(() => load.gifts().then((m) => m.RegistryPage));
const ReceivedPage = dynamic(() => load.gifts().then((m) => m.ReceivedPage));
const BudgetPage = dynamic(() => load.money().then((m) => m.BudgetPage));
const CalendarPage = dynamic(() => load.money().then((m) => m.CalendarPage));
const MemoriesPage = dynamic(() => load.memories().then((m) => m.MemoriesPage));
const CardsPage = dynamic(() => load.memories().then((m) => m.CardsPage));
const SharePage = dynamic(() => load.share().then((m) => m.SharePage));
const SettingsPage = dynamic(() => load.settings().then((m) => m.SettingsPage));
const MorePage = dynamic(() => load.settings().then((m) => m.MorePage));

type Props = {
  initial: Plan;
  version: number;
  today: string;
  lang: Lang;
  locale: string;
  base: string;
  mode: Mode;
  access?: Access;
  /** Helper mode: the grant id the server re-checks on every save and file. */
  helperId?: string;
  exitHref: string;
  buyHref?: string;
};

/** The whole «حكاية قدوم» app. State lives in the provider; sections are plain components. */
export function QudoomApp(props: Props) {
  const { mode, today, lang, locale, helperId } = props;
  const api = useMemo(() => (mode === "demo" ? demoApi(today, lang) : liveApi(locale, helperId)), [mode, today, lang, locale, helperId]);
  const sync = useMemo(() => (mode === "demo" ? undefined : mode === "helper" ? (ops: Parameters<typeof qudoomSync>[0], v: number) => helperSync(helperId ?? "", ops, v) : qudoomSync), [mode, helperId]);
  return (
    <QProvider initial={props.initial} version={props.version} today={today} lang={lang} locale={locale} base={props.base} mode={mode} access={props.access} sync={sync} api={api}>
      <Router {...props} />
    </QProvider>
  );
}

function Router({ base, exitHref, buyHref, locale }: Props) {
  const { plan, mode, t } = useQ();
  const path = usePathname() ?? base;
  const seg = path.slice(base.length).split("/").filter(Boolean)[0] ?? "";
  const page: PageKey = (pageKeys as string[]).includes(seg) ? (seg as PageKey) : "";
  const visible = usePageVisible();
  const other = locale === "ar" ? "en" : "ar";
  const switchHref = path.replace(new RegExp(`^/${locale}(?=/|$)`), `/${other}`);
  useEffect(() => {
    const run = () => Object.values(load).forEach((f) => void f().catch(() => {}));
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(run, { timeout: 3000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(run, 1500);
    return () => clearTimeout(id);
  }, []);

  if (!plan.profile) {
    if (mode === "helper")
      return (
        <div className="qd grid min-h-dvh place-items-center p-6" dir={locale === "ar" ? "rtl" : "ltr"}>
          <EmptyState icon={<HourglassMediumIcon size={26} />} title={t.help.notReady} />
        </div>
      );
    return (
      <div className="qd min-h-dvh" dir={locale === "ar" ? "rtl" : "ltr"} lang={locale}>
        <Setup />
      </div>
    );
  }

  const view: Record<PageKey, React.ReactNode> = {
    "": <Home />,
    items: <ItemsPage />,
    bag: <BagPage />,
    nursery: <NurseryPage />,
    mother: <MotherPage />,
    events: <EventsPage />,
    visits: <VisitsPage />,
    hospitality: <HospitalityPage />,
    favors: <FavorsPage />,
    registry: <RegistryPage />,
    received: <ReceivedPage />,
    budget: <BudgetPage />,
    calendar: <CalendarPage />,
    memories: <MemoriesPage />,
    cards: <CardsPage />,
    share: <SharePage />,
    settings: <SettingsPage switchHref={switchHref} />,
    more: <MorePage />,
  };
  return (
    <Shell page={page} exitHref={exitHref} buyHref={buyHref} switchHref={switchHref}>
      {visible(page) ? view[page] : <EmptyState icon={<EyeSlashIcon size={26} />} title={t.common.sectionOff} />}
    </Shell>
  );
}
