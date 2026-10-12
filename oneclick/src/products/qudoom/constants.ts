import type { SectionId } from "./model/types";

export const QUDOOM_PRODUCT_ID = "prd_qudoom";
export const QUDOOM_SLUG = "hikayat-qudoom";

/** URL segment → the section it belongs to (for access checks and hiding switched-off sections). */
export const pages = {
  "": null,
  steps: null,
  looks: "reception",
  items: "prep",
  bag: "bag",
  nursery: "nursery",
  mother: "mother",
  events: "reception",
  visits: "visits",
  hospitality: "hospitality",
  favors: "favors",
  ideas: null,
  registry: "registry",
  received: "received",
  budget: "budget",
  calendar: "calendar",
  memories: "memories",
  cards: "memories",
  share: null,
  settings: null,
  more: null,
} as const satisfies Record<string, SectionId | null>;
export type PageKey = keyof typeof pages;
export const pageKeys = Object.keys(pages) as PageKey[];

export const groups: { key: "home" | "prep" | "reception" | "gifts" | "more"; pages: PageKey[] }[] = [
  { key: "home", pages: ["", "steps"] },
  { key: "prep", pages: ["items", "bag", "nursery", "mother"] },
  { key: "reception", pages: ["looks", "events", "visits", "hospitality", "favors"] },
  { key: "gifts", pages: ["ideas", "registry", "received"] },
  { key: "more", pages: ["more", "budget", "calendar", "memories", "cards", "share", "settings"] },
];
