"use client";

import type { DemoId } from "@/content/types";
import type { Locale } from "@/i18n/config";
import { BrideDemo } from "./BrideDemo";
import { FitDemo } from "./FitDemo";
import { GroceryDemo } from "./GroceryDemo";
import { PlannerDemo } from "./PlannerDemo";
import { ResetDemo } from "./ResetDemo";

const map = { grocery: GroceryDemo, bride: BrideDemo, planner: PlannerDemo, fit: FitDemo, reset: ResetDemo } as const;

export function DemoById({ id, locale, hue }: { id: DemoId; locale: Locale; hue: string }) {
  const C = map[id];
  return <C locale={locale} hue={hue} />;
}
