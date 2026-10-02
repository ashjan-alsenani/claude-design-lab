import {
  AirplaneTiltIcon,
  BarbellIcon,
  BasketIcon,
  BookOpenTextIcon,
  CalendarCheckIcon,
  HeartIcon,
  SparkleIcon,
  WalletIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import type { Hue } from "@/content/types";

export const hueIcon: Record<Hue, Icon> = {
  bride: HeartIcon,
  grocery: BasketIcon,
  planner: CalendarCheckIcon,
  fit: BarbellIcon,
  budget: WalletIcon,
  study: BookOpenTextIcon,
  travel: AirplaneTiltIcon,
  brand: SparkleIcon,
};

export function ProductIcon({ hue, size = 22, weight = "duotone" as const }: { hue: Hue; size?: number; weight?: "duotone" | "bold" | "fill" | "regular" }) {
  const I = hueIcon[hue];
  return <I size={size} weight={weight} />;
}
