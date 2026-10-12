import {
  ArchiveIcon, ArmchairIcon, BabyCarriageIcon, BabyIcon, BackpackIcon, BasketIcon, BathtubIcon, BatteryChargingIcon, BedIcon, BookIcon, CarIcon,
  CookieIcon, DressIcon, DropIcon, FileTextIcon, FirstAidIcon, FlowerIcon, HandbagIcon, HeartIcon, IdentificationCardIcon, LampIcon, MoonIcon,
  PackageIcon, ScissorsIcon, SneakerIcon, SockIcon, SparkleIcon, TShirtIcon, TowelIcon, WindIcon, type Icon,
} from "@phosphor-icons/react";
import type { BagId, ItemCat } from "../model/types";

/** Name keywords first (Arabic and English), so the icon matches the thing itself. */
const rules: [RegExp, Icon][] = [
  [/كرسي سيارة|كرسي السيارة|car seat/i, CarIcon],
  [/عربة|stroller|pram/i, BabyCarriageIcon],
  [/شنطة|حقيبة|diaper bag|bag/i, HandbagIcon],
  [/حفاض|diaper|nappy/i, BabyIcon],
  [/مناديل|wipes|قطن وماء/i, DropIcon],
  [/منشف|towel/i, TowelIcon],
  [/حوض|استحمام|bath/i, BathtubIcon],
  [/مقص|أظافر|clipper|nail/i, ScissorsIcon],
  [/جوارب|قفازات|sock|mitten/i, SockIcon],
  [/شبشب|slipper/i, SneakerIcon],
  [/سرير|مهد|نوم آمن|crib|bassinet|sleep space|شراشف|sheet/i, BedIcon],
  [/كيس نوم|sleep sack|بيجام|sleepsuit|nightwear|ملابس نوم/i, MoonIcon],
  [/بطانية|blanket/i, WindIcon],
  [/طقم خروج|going-home|outfit|طقم الخروج/i, DressIcon],
  [/بودي|bodysuit|ملابس|clothes|طاقية|hat/i, TShirtIcon],
  [/رضاع|مرايل|feeding|bib|burp/i, HeartIcon],
  [/كرسي|chair|cushion|مخدة/i, ArmchairIcon],
  [/ستائر|curtain/i, WindIcon],
  [/إضاءة|ضوء|light|lamp/i, LampIcon],
  [/لوحة|sign/i, SparkleIcon],
  [/دولاب|أدراج|drawer|wardrobe|منظم/i, ArchiveIcon],
  [/سلة|basket/i, BasketIcon],
  [/ألبوم|ذكريات|album|memory/i, BookIcon],
  [/شاحن|charger|كيبل/i, BatteryChargingIcon],
  [/هوية|جواز|passport|\bid\b/i, IdentificationCardIcon],
  [/تأمين|insurance|ملف|file/i, FileTextIcon],
  [/أكل|ماء|snack|water|قارورة/i, CookieIcon],
  [/عناية|toiletr|care|كريم|cream/i, FirstAidIcon],
];
const byCat: Record<ItemCat, Icon> = {
  clothes: TShirtIcon, sleep: BedIcon, diaper: BabyIcon, bath: BathtubIcon, outing: BabyCarriageIcon, feeding: HeartIcon, storage: ArchiveIcon,
  extra: SparkleIcon, furniture: ArmchairIcon, decor: FlowerIcon, nurseryTextile: WindIcon, personal: HeartIcon, comfort: ArmchairIcon, custom: PackageIcon,
};
const byBag: Record<BagId, Icon> = { mother: HandbagIcon, baby: BabyIcon, companion: BackpackIcon, docs: FileTextIcon };

export function itemIcon(name: string, fallback: { cat?: ItemCat; bag?: BagId }): Icon {
  for (const [re, I] of rules) if (re.test(name)) return I;
  if (fallback.cat) return byCat[fallback.cat];
  if (fallback.bag) return byBag[fallback.bag];
  return PackageIcon;
}

/** A small soft icon beside a list item (decorative). */
export function ItemIcon({ name, cat, bag, done }: { name: string; cat?: ItemCat; bag?: BagId; done?: boolean }) {
  const I = itemIcon(name, { cat, bag });
  return (
    <span aria-hidden="true" className={`grid size-9 shrink-0 place-items-center rounded-[12px] ${done ? "bg-[var(--qd-sage-soft)] text-[var(--qd-sage)]" : "bg-[var(--qd-tint)] text-[var(--qd-primary)]"}`}>
      <I size={19} weight="duotone" />
    </span>
  );
}
