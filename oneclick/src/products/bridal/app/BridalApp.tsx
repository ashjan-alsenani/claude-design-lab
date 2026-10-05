"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BridalProvider, useBridal, type SyncFn } from "./state";
import { Shell, type SectionKey } from "./Shell";
import type { Workspace } from "../model/types";
import type { Lang } from "../i18n";
import { sectionKeys } from "../constants";
import { Dashboard } from "../sections/Dashboard";

/*
 * Each section is its own script, so a page downloads only what it shows. The home dashboard stays in
 * the main bundle (it is the first screen); the rest are fetched in the background once the page is idle,
 * so moving between sections never waits.
 */
const load = {
  onboarding: () => import("../sections/Onboarding"),
  checklist: () => import("../sections/Checklist"),
  budget: () => import("../sections/Budget"),
  vendors: () => import("../sections/Vendors"),
  calendar: () => import("../sections/Calendar"),
  guests: () => import("../sections/Guests"),
  lists: () => import("../sections/Lists"),
  personal: () => import("../sections/Personal"),
  library: () => import("../sections/Library"),
  settings: () => import("../sections/Settings"),
};
const Welcome = dynamic(() => load.onboarding().then((m) => m.Welcome));
const Onboarding = dynamic(() => load.onboarding().then((m) => m.Onboarding));
const Checklist = dynamic(() => load.checklist().then((m) => m.Checklist));
const Budget = dynamic(() => load.budget().then((m) => m.Budget));
const Vendors = dynamic(() => load.vendors().then((m) => m.Vendors));
const Calendar = dynamic(() => load.calendar().then((m) => m.Calendar));
const Guests = dynamic(() => load.guests().then((m) => m.Guests));
const Closet = dynamic(() => load.lists().then((m) => m.Closet));
const NewHome = dynamic(() => load.lists().then((m) => m.NewHome));
const Shopping = dynamic(() => load.lists().then((m) => m.Shopping));
const Bride = dynamic(() => load.personal().then((m) => m.Bride));
const Honeymoon = dynamic(() => load.personal().then((m) => m.Honeymoon));
const WeddingDay = dynamic(() => load.personal().then((m) => m.WeddingDay));
const Documents = dynamic(() => load.library().then((m) => m.Documents));
const Moodboard = dynamic(() => load.library().then((m) => m.Moodboard));
const More = dynamic(() => load.settings().then((m) => m.More));
const Settings = dynamic(() => load.settings().then((m) => m.Settings));

function usePrefetchSections() {
  useEffect(() => {
    const run = () => Object.values(load).forEach((f) => void f().catch(() => {}));
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(run, { timeout: 3000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(run, 1500);
    return () => clearTimeout(id);
  }, []);
}


type Props = {
  initial: Workspace;
  version: number;
  today: string;
  lang: Lang;
  locale: string;
  base: string;
  mode: "licensed" | "demo";
  sync?: SyncFn;
  exitHref: string;
  buyHref?: string;
  accountHref: string;
};

/** The whole Bridal Journey app. State lives in the provider; sections are plain components. */
export function BridalApp(props: Props) {
  return (
    <BridalProvider initial={props.initial} version={props.version} today={props.today} lang={props.lang} locale={props.locale} base={props.base} mode={props.mode} sync={props.sync}>
      <Router {...props} />
    </BridalProvider>
  );
}

function Router({ exitHref, buyHref, accountHref, base }: Props) {
  const { ws } = useBridal();
  // The app lives in a persistent layout; the section comes from the URL (/…/bride-planner/budget).
  const seg = (usePathname() ?? "").slice(base.length).split("/").filter(Boolean)[0] ?? "";
  const section: SectionKey = (sectionKeys as readonly string[]).includes(seg) ? (seg as SectionKey) : "";
  const [onboarding, setOnboarding] = useState(false);
  usePrefetchSections();
  if (!ws.profile) return onboarding ? <Onboarding onCancel={() => setOnboarding(false)} /> : <Welcome onStart={() => setOnboarding(true)} exitHref={exitHref} />;
  const view = {
    "": <Dashboard />,
    checklist: <Checklist />,
    calendar: <Calendar />,
    budget: <Budget />,
    vendors: <Vendors />,
    guests: <Guests />,
    bride: <Bride />,
    closet: <Closet />,
    shopping: <Shopping />,
    home: <NewHome />,
    honeymoon: <Honeymoon />,
    inspiration: <Moodboard />,
    documents: <Documents />,
    day: <WeddingDay />,
    settings: <Settings accountHref={accountHref} />,
    more: <More />,
  }[section];
  return (
    <Shell section={section} exitHref={exitHref} buyHref={buyHref}>
      {view}
    </Shell>
  );
}
