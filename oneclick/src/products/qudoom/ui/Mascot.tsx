import { Clicky, type ClickyMood } from "@/components/brand/Clicky";
import type { ThemeId } from "../model/types";

/** Soft grey line colour for the planner (no heavy black outlines). */
export const QD_INK = "#5a5570";

/** Baby Clicky, the planner's little guide: theme-coloured with a baby face; a side bow (girl), a bow tie and curl (boy) or a curl (surprise). Decorative. */
export function BabyMascot({ size = 96, theme = "cloud", mood = "sweet", body = false, animate = true }: { size?: number; theme?: ThemeId; mood?: ClickyMood; body?: boolean; animate?: boolean }) {
  return <Clicky size={size} color="var(--qd-mascot)" ink={QD_INK} accessory={theme === "moon" ? "boy" : theme === "garden" ? "baby" : "girl"} mood={mood} body={body} animate={animate} />;
}
