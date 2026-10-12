import aqiqah from "./looks-data/aqiqah";
import entrance from "./looks-data/entrance";
import family from "./looks-data/family";
import hospital from "./looks-data/hospital";
import majlis from "./looks-data/majlis";
import outdoor from "./looks-data/outdoor";
import reveal from "./looks-data/reveal";
import shower from "./looks-data/shower";

/**
 * Welcome looks: 500+ distinct setups, each one its own idea (not a colour swap of another), across
 * the places a Gulf family welcomes a baby, with a regional flavour. Each comes with what to prepare;
 * adopting one turns that list into her welcome tasks. Drawn in SVG (ui/Illustrations).
 */
export type LookMotif =
  | "clouds" | "moon" | "garden" | "teddy" | "balloons" | "sea" | "sadu" | "minimal" | "gold" | "butterflies"
  | "palm" | "lantern" | "dhow" | "dunes" | "pearls" | "arch" | "rainbow" | "hotair" | "tent" | "dallah" | "honey" | "books" | "stars" | "falcon";
/** Kept for the theme photos (the first ten motifs). */
export type LookTheme = LookMotif;
export type LookPlace = "hospital" | "entrance" | "majlis" | "family" | "outdoor" | "aqiqah" | "shower" | "reveal";
export type LookRegion = "gulf" | "sa" | "kw" | "ae" | "qa" | "bh" | "om";
export type Palette = { id: string; ar: string; en: string; main: string; soft: string; accent: string };
export type Look = { id: string; n: number; place: LookPlace; region: LookRegion; motif: LookMotif; palette: Palette; ar: string; en: string; arItems: string[]; enItems: string[] };

export const motifs: { id: LookMotif; ar: string; en: string }[] = [
  { id: "clouds", ar: "غيوم", en: "Clouds" },
  { id: "moon", ar: "قمر وليل", en: "Moon & night" },
  { id: "stars", ar: "نجوم", en: "Stars" },
  { id: "garden", ar: "ورد وحدائق", en: "Flowers & gardens" },
  { id: "teddy", ar: "دبدوب", en: "Teddy bears" },
  { id: "balloons", ar: "بالونات", en: "Balloons" },
  { id: "butterflies", ar: "فراشات", en: "Butterflies" },
  { id: "rainbow", ar: "ألوان مرحة", en: "Playful colours" },
  { id: "honey", ar: "نحل وعسل", en: "Bees & honey" },
  { id: "books", ar: "قصص وكتب", en: "Stories & books" },
  { id: "hotair", ar: "مناطيد ورحلات", en: "Balloons & journeys" },
  { id: "tent", ar: "خيام ومخيمات", en: "Tents & camps" },
  { id: "sea", ar: "البحر", en: "The sea" },
  { id: "dhow", ar: "سفن ومحامل", en: "Dhows & ships" },
  { id: "pearls", ar: "لؤلؤ وغوص", en: "Pearls & diving" },
  { id: "palm", ar: "نخيل وتمر", en: "Palms & dates" },
  { id: "dunes", ar: "صحراء ورمال", en: "Desert & dunes" },
  { id: "sadu", ar: "سدو وتراث", en: "Sadu & heritage" },
  { id: "dallah", ar: "قهوة ودلال", en: "Coffee & dallahs" },
  { id: "lantern", ar: "فوانيس", en: "Lanterns" },
  { id: "arch", ar: "أقواس وعمارة", en: "Arches & architecture" },
  { id: "falcon", ar: "صقور", en: "Falcons" },
  { id: "gold", ar: "فخامة ذهبية", en: "Golden luxury" },
  { id: "minimal", ar: "بسيط وأنيق", en: "Simple & elegant" },
];
/** Older name for the ten photo themes. */
export const themes = motifs;

export const places: { id: LookPlace; ar: string; en: string }[] = [
  { id: "hospital", ar: "غرفة المستشفى", en: "Hospital room" },
  { id: "entrance", ar: "مدخل البيت", en: "Home entrance" },
  { id: "majlis", ar: "المجلس", en: "Majlis" },
  { id: "family", ar: "تجمع العائلة", en: "Family gathering" },
  { id: "outdoor", ar: "في الخارج", en: "Outdoors" },
  { id: "aqiqah", ar: "العقيقة", en: "Aqiqah" },
  { id: "shower", ar: "بيبي شاور", en: "Baby shower" },
  { id: "reveal", ar: "كشف الجنس", en: "Gender reveal" },
];

export const regions: { id: LookRegion; ar: string; en: string }[] = [
  { id: "gulf", ar: "خليجي عام", en: "Across the Gulf" },
  { id: "sa", ar: "السعودية", en: "Saudi Arabia" },
  { id: "kw", ar: "الكويت", en: "Kuwait" },
  { id: "ae", ar: "الإمارات", en: "UAE" },
  { id: "qa", ar: "قطر", en: "Qatar" },
  { id: "bh", ar: "البحرين", en: "Bahrain" },
  { id: "om", ar: "عُمان", en: "Oman" },
];

export const palettes: Palette[] = [
  { id: "rose-gold", ar: "وردي وذهبي", en: "Pink & gold", main: "#e7859f", soft: "#fde4ec", accent: "#d9a441" },
  { id: "navy-white", ar: "كحلي وأبيض", en: "Navy & white", main: "#2c4e86", soft: "#e6edf8", accent: "#c9a14a" },
  { id: "mint-cream", ar: "نعناعي وكريمي", en: "Mint & cream", main: "#5fb9a0", soft: "#e6f6f0", accent: "#f2c86b" },
  { id: "beige-white", ar: "بيج وأبيض", en: "Beige & white", main: "#c7a98a", soft: "#f6efe6", accent: "#a88459" },
  { id: "lavender-silver", ar: "لافندر وفضي", en: "Lavender & silver", main: "#a08bd6", soft: "#efeafb", accent: "#b9bcc8" },
  { id: "peach-olive", ar: "خوخي وزيتوني", en: "Peach & olive", main: "#f2a07b", soft: "#fdeee4", accent: "#8a9a5b" },
  { id: "sky-lemon", ar: "سماوي وليموني", en: "Sky & lemon", main: "#7fb8e6", soft: "#e9f4fd", accent: "#f2d35b" },
  { id: "ivory-gold", ar: "عاجي وذهبي", en: "Ivory & gold", main: "#d9b76a", soft: "#fbf6ea", accent: "#b88a2e" },
  { id: "pastel-mix", ar: "وردي وأزرق باستيل", en: "Pastel pink & blue", main: "#f2a7bb", soft: "#eef4fc", accent: "#9fc1ea" },
  { id: "olive-sand", ar: "زيتوني ورملي", en: "Olive & sand", main: "#8a9a5b", soft: "#f3efe2", accent: "#d4b483" },
  { id: "coral-cream", ar: "مرجاني وكريمي", en: "Coral & cream", main: "#f08a7e", soft: "#fdf0ea", accent: "#f5c36b" },
  { id: "teal-sand", ar: "تركوازي ورملي", en: "Teal & sand", main: "#3fa8a0", soft: "#e4f4f2", accent: "#dcbf8e" },
  { id: "grey-blush", ar: "رمادي ووردي ناعم", en: "Grey & blush", main: "#9aa0ab", soft: "#f6eef0", accent: "#efb6c3" },
  { id: "lilac-white", ar: "ليلكي وأبيض", en: "Lilac & white", main: "#b89ad9", soft: "#f6f1fc", accent: "#e8c3e0" },
  { id: "caramel-cream", ar: "كراميل وكريمي", en: "Caramel & cream", main: "#c48a52", soft: "#faf1e6", accent: "#e9c79e" },
  { id: "babyblue-white", ar: "أزرق سماوي وأبيض", en: "Baby blue & white", main: "#8cb8e8", soft: "#eef5fd", accent: "#d7e6f7" },
  { id: "apricot-cream", ar: "مشمشي وكريمي", en: "Apricot & cream", main: "#f3b07a", soft: "#fef3e8", accent: "#e98f6c" },
  { id: "sage-white", ar: "أخضر هادئ وأبيض", en: "Sage & white", main: "#9cb59a", soft: "#eef4ec", accent: "#d8c7a4" },
  { id: "fuchsia-soft", ar: "فوشي ناعم وأبيض", en: "Soft fuchsia & white", main: "#d96aa4", soft: "#fcebf4", accent: "#f2b8d4" },
  { id: "sunshine", ar: "أصفر مشمس وأبيض", en: "Sunshine & white", main: "#f2c14e", soft: "#fff8e3", accent: "#e88c5c" },
  { id: "pearl-grey", ar: "لؤلؤي ورمادي", en: "Pearl & grey", main: "#a7adb8", soft: "#f4f4f2", accent: "#e8dcc8" },
  { id: "saffron-ivory", ar: "زعفراني وعاجي", en: "Saffron & ivory", main: "#e3a33a", soft: "#fdf5e4", accent: "#b5532f" },
  { id: "sea-white", ar: "أزرق بحري وأبيض", en: "Sea blue & white", main: "#2f7fb5", soft: "#e8f3fa", accent: "#f2d9a6" },
  { id: "sand-teal", ar: "رملي وفيروزي", en: "Sand & turquoise", main: "#d2b48c", soft: "#f8f1e6", accent: "#2f9c95" },
];

const blocks: Record<LookPlace, string> = { hospital, entrance, majlis, family, outdoor, aqiqah, shower, reveal };
const byId = new Map(palettes.map((p) => [p.id, p]));

export const looks: Look[] = (Object.keys(blocks) as LookPlace[]).flatMap((place) =>
  blocks[place]
    .trim()
    .split("\n")
    .filter((l) => l.includes("|"))
    .map((line, i) => {
      const [region, motif, pal, ar, en, arItems, enItems] = line.split("|").map((x) => x.trim());
      return {
        id: `${place}-${i + 1}`,
        n: i + 1,
        place,
        region: region as LookRegion,
        motif: motif as LookMotif,
        palette: byId.get(pal) ?? palettes[0],
        ar,
        en,
        arItems: arItems.split("؛").map((x) => x.trim()).filter(Boolean),
        enItems: enItems.split(";").map((x) => x.trim()).filter(Boolean),
      };
    }),
);

/** What to prepare for this look, in the mother's language. */
export function lookChecklist(l: Look, lang: "ar" | "en"): string[] {
  const pa = lang === "ar" ? l.palette.ar : l.palette.en;
  return [...(lang === "ar" ? l.arItems : l.enItems), lang === "ar" ? `الألوان: ${pa}` : `Colours: ${pa}`];
}

/** A task made by adopting a look (its notes hold the look id; older ones start with a sparkle). */
export const isLookTask = (t: { area: string; title: string; notes?: string }) =>
  t.area === "reception" && (t.title.startsWith("✨") || /^(hospital|majlis|family|outdoor|aqiqah)\.[a-z]+\.[a-z-]+$/.test(t.notes ?? "") || /^look:[a-z]+-\d+$/.test(t.notes ?? ""));

export const lookTitle = (l: Look, lang: "ar" | "en") => (lang === "ar" ? l.ar : l.en);
