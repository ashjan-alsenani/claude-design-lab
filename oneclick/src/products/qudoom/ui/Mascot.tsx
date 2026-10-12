import { Clicky, type ClickyMood } from "@/components/brand/Clicky";
import type { ThemeId } from "../model/types";

/** Baby Clicky, the planner's little guide: theme-colored, with a bow (girl), a knitted cap (boy) or a hair curl (surprise). Decorative. */
export function BabyMascot({ size = 96, theme = "cloud", mood = "love", body = false, animate = true }: { size?: number; theme?: ThemeId; mood?: ClickyMood; body?: boolean; animate?: boolean }) {
  return <Clicky size={size} color="var(--qd-mascot)" accessory={theme === "moon" ? "cap" : theme === "garden" ? "baby" : "bow"} mood={mood} body={body} animate={animate} />;
}
