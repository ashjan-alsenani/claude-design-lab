import {
  AirplaneTiltIcon,
  BabyIcon,
  BarbellIcon,
  BasketIcon,
  BriefcaseIcon,
  BroomIcon,
  CalendarCheckIcon,
  CoinsIcon,
  ConfettiIcon,
  DiamondIcon,
  FlameIcon,
  ForkKnifeIcon,
  GiftIcon,
  GraduationCapIcon,
  MoonStarsIcon,
  MosqueIcon,
  PackageIcon,
  SprayBottleIcon,
  StarIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import type { ClickyMood } from "@/components/brand/Clicky";
import type { Hue } from "./types";
import { hueVar } from "@/lib/hues";

/**
 * Every product's own look: a color of its own (spread around the color wheel so no two products
 * look alike), an icon that says what it is, and the mood of its Clicky. Collections keep their
 * shared hue; products use these.
 */
export type ProductLook = { color: string; icon: Icon; mood: ClickyMood };

export const productLooks: Record<string, ProductLook> = {
  prd_bride: { color: "#F0567A", icon: DiamondIcon, mood: "love" },
  prd_party: { color: "#D946EF", icon: ConfettiIcon, mood: "celebrate" },
  prd_gift: { color: "#E11D48", icon: GiftIcon, mood: "love" },
  prd_meal: { color: "#EF4444", icon: ForkKnifeIcon, mood: "happy" },
  prd_fit: { color: "#FF7A2F", icon: BarbellIcon, mood: "celebrate" },
  prd_habits: { color: "#F59E0B", icon: FlameIcon, mood: "wink" },
  prd_budget: { color: "#CA8A04", icon: CoinsIcon, mood: "happy" },
  prd_kids: { color: "#65A30D", icon: StarIcon, mood: "celebrate" },
  prd_grocery: { color: "#16A34A", icon: BasketIcon, mood: "happy" },
  prd_umrah: { color: "#047857", icon: MosqueIcon, mood: "happy" },
  prd_reset: { color: "#14B8A6", icon: BroomIcon, mood: "wink" },
  prd_home: { color: "#06B6D4", icon: SprayBottleIcon, mood: "happy" },
  prd_travel: { color: "#0EA5E9", icon: AirplaneTiltIcon, mood: "wink" },
  prd_baby: { color: "#60A5FA", icon: BabyIcon, mood: "love" },
  prd_planner: { color: "#3D7BFF", icon: CalendarCheckIcon, mood: "wink" },
  prd_ramadan: { color: "#4F46E5", icon: MoonStarsIcon, mood: "happy" },
  prd_study: { color: "#8B5CF6", icon: GraduationCapIcon, mood: "think" },
  prd_business: { color: "#475569", icon: BriefcaseIcon, mood: "wink" },
  prd_bundle: { color: "#12B5A6", icon: PackageIcon, mood: "celebrate" },
};

export function productLook(p: { id: string; hue: Hue }): ProductLook {
  return productLooks[p.id] ?? { color: hueVar(p.hue), icon: PackageIcon, mood: "happy" };
}

/** Soft tint of a product color over the surface (works in both themes). */
export const toneSoft = (color: string, pct = 12) => `color-mix(in oklab, ${color} ${pct}%, var(--oc-surface))`;
