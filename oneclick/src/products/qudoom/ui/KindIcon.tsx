import { BabyCarriageIcon, BalloonIcon, CameraIcon, CoffeeIcon, EnvelopeSimpleOpenIcon, FlowerTulipIcon, GiftIcon, HandHeartIcon, HospitalIcon, MoonStarsIcon, SignpostIcon, type Icon } from "@phosphor-icons/react";
import type { IdeaKind } from "../model/all-ideas";

const icons: Record<IdeaKind, Icon> = {
  favor: GiftIcon, gift: BabyCarriageIcon, mother: FlowerTulipIcon, decor: BalloonIcon, sign: SignpostIcon, hosp: CoffeeIcon,
  photo: CameraIcon, hospital: HospitalIcon, aqiqah: MoonStarsIcon, keepsake: EnvelopeSimpleOpenIcon, thanks: HandHeartIcon,
};

/** The planner's own soft duotone icon for each kind of idea (in its pastel, with a deeper line). */
export function KindIcon({ kind, color, size = 22, className = "" }: { kind: IdeaKind; color: string; size?: number; className?: string }) {
  const I = icons[kind];
  return (
    <span aria-hidden="true" className={`grid shrink-0 place-items-center rounded-full ${className}`} style={{ background: `color-mix(in oklab, ${color} 34%, var(--qd-paper, #fff))`, color: `color-mix(in oklab, ${color} 55%, #4a4560)` }}>
      <I size={size} weight="duotone" />
    </span>
  );
}
