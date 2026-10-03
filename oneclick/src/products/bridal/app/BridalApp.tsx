"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { BridalProvider, useBridal, type SyncFn } from "./state";
import { Shell, type SectionKey } from "./Shell";
import type { Workspace } from "../model/types";
import type { Lang } from "../i18n";
import { sectionKeys } from "../constants";
import { Welcome, Onboarding } from "../sections/Onboarding";
import { Dashboard } from "../sections/Dashboard";
import { Checklist } from "../sections/Checklist";
import { Budget } from "../sections/Budget";
import { Vendors } from "../sections/Vendors";
import { Calendar } from "../sections/Calendar";
import { Guests } from "../sections/Guests";
import { Closet, NewHome, Shopping } from "../sections/Lists";
import { Bride, Honeymoon, WeddingDay } from "../sections/Personal";
import { Documents, Moodboard } from "../sections/Library";
import { More, Settings } from "../sections/Settings";


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
