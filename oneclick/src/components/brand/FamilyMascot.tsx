import type { Locale } from "@/i18n/config";
import { family, type FamilyMember } from "@/content/clicky-family";
import { inkTint } from "@/lib/hues";
import { Clicky, type ClickyMood } from "./Clicky";

/**
 * A member of the Clicky family at their post (Shams on guides, Marjan on help, Lilac on security…),
 * with a small name tag. Decorative: the page heading carries the meaning.
 */
export function FamilyMascot({ id, locale, size = 96, mood, body = true, className = "" }: { id: FamilyMember["id"]; locale: Locale; size?: number; mood?: ClickyMood; body?: boolean; className?: string }) {
  const m = family(id);
  return (
    <div aria-hidden="true" className={`flex shrink-0 flex-col items-center ${className}`}>
      <Clicky size={size} color={m.color} mood={mood ?? m.mood} accessory={m.accessory} body={body} animate />
      <span
        className="mt-1 rounded-full px-2.5 py-0.5 text-xs font-bold"
        style={{ color: inkTint(m.color), background: `color-mix(in oklab, ${m.color} 14%, var(--oc-surface))` }}
      >
        {m.name[locale]}
      </span>
    </div>
  );
}
