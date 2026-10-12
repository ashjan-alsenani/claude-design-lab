/**
 * Welcome looks for the baby's arrival: 10 themes × 20 colour palettes × 5 places = 1,000 distinct
 * looks, each drawn as its own illustration (see ui/Illustrations) with a ready checklist of what
 * to prepare. Suggestions only; the mother adopts one and its checklist becomes her tasks.
 */
export type LookTheme = "clouds" | "moon" | "garden" | "teddy" | "balloons" | "sea" | "sadu" | "minimal" | "gold" | "butterflies";
export type LookPlace = "hospital" | "majlis" | "family" | "outdoor" | "aqiqah";
export type Palette = { id: string; ar: string; en: string; main: string; soft: string; accent: string };
export type Look = { id: string; theme: LookTheme; palette: Palette; place: LookPlace };

export const themes: { id: LookTheme; ar: string; en: string }[] = [
  { id: "clouds", ar: "غيوم ونجوم", en: "Clouds & stars" },
  { id: "moon", ar: "قمر ونجوم الليل", en: "Moon & night stars" },
  { id: "garden", ar: "حديقة ورد", en: "Flower garden" },
  { id: "teddy", ar: "دبدوب", en: "Teddy bear" },
  { id: "balloons", ar: "بالونات", en: "Balloons" },
  { id: "sea", ar: "البحر", en: "By the sea" },
  { id: "sadu", ar: "تراث خليجي (سدو)", en: "Gulf heritage (Sadu)" },
  { id: "minimal", ar: "بسيط وأنيق", en: "Simple & elegant" },
  { id: "gold", ar: "فخامة ذهبية", en: "Golden luxury" },
  { id: "butterflies", ar: "فراشات", en: "Butterflies" },
];

export const places: { id: LookPlace; ar: string; en: string }[] = [
  { id: "hospital", ar: "غرفة المستشفى", en: "Hospital room" },
  { id: "majlis", ar: "مجلس البيت", en: "Home majlis" },
  { id: "family", ar: "تجمع العائلة", en: "Family gathering" },
  { id: "outdoor", ar: "حديقة خارجية", en: "Garden outdoors" },
  { id: "aqiqah", ar: "عشاء العقيقة", en: "Aqiqah dinner" },
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
];

export const looks: Look[] = places.flatMap((pl) => themes.flatMap((th) => palettes.map((pa) => ({ id: `${pl.id}.${th.id}.${pa.id}`, theme: th.id, palette: pa, place: pl.id }))));

const themeBits: Record<LookTheme, { ar: string[]; en: string[] }> = {
  clouds: { ar: ["خلفية غيوم قطنية معلقة", "نجوم ورقية صغيرة"], en: ["Hanging cotton-cloud backdrop", "Small paper stars"] },
  moon: { ar: ["قمر مضيء على الخلفية", "إضاءة نجوم خافتة"], en: ["Glowing moon on the backdrop", "Soft star lights"] },
  garden: { ar: ["قوس ورد طبيعي", "مزهريات صغيرة على الطاولات"], en: ["Fresh-flower arch", "Small vases on the tables"] },
  teddy: { ar: ["دبدوب كبير جنب لوحة الاسم", "مخدات بوجه دبدوب"], en: ["Big teddy beside the name sign", "Teddy-face cushions"] },
  balloons: { ar: ["قوس بالونات بالألوان المختارة", "بالونات شفافة فيها ورود"], en: ["Balloon arch in the chosen colours", "Clear balloons with petals"] },
  sea: { ar: ["أمواج قماش وأصداف", "سلال خوص وحبال"], en: ["Fabric waves and shells", "Woven baskets and rope"] },
  sadu: { ar: ["مفارش بنقشة السدو", "دلة وفناجين للزينة"], en: ["Sadu-pattern runners", "Dallah and cups as decor"] },
  minimal: { ar: ["خلفية سادة بخط أنيق", "ورد أبيض قليل"], en: ["Plain backdrop with elegant script", "A few white flowers"] },
  gold: { ar: ["إطارات ذهبية وشموع", "مفارش ساتان"], en: ["Gold frames and candles", "Satin runners"] },
  butterflies: { ar: ["فراشات ورقية طايرة على الجدار", "ورد ناعم بألوان باستيل"], en: ["Paper butterflies on the wall", "Soft pastel flowers"] },
};
const placeBits: Record<LookPlace, { ar: string[]; en: string[] }> = {
  hospital: { ar: ["لافتة صغيرة على باب الغرفة", "صينية شوكولاتة وتمر للزوار", "توزيعات صغيرة للممرضات"], en: ["Small sign on the room door", "Chocolate & dates tray for visitors", "Little favors for the nurses"] },
  majlis: { ar: ["ركن تصوير في المجلس", "ستاند قهوة وتمر", "مخدات مطرزة بالاسم"], en: ["Photo corner in the majlis", "Coffee & dates stand", "Name-embroidered cushions"] },
  family: { ar: ["طاولة حلويات بطبقات", "شجرة أمنيات للضيوف", "ركن ألعاب للأطفال"], en: ["Tiered sweets table", "Wish tree for guests", "Kids' play corner"] },
  outdoor: { ar: ["مظلة قماش وجلسات أرضية", "إضاءة خيوط", "ركن عصائر باردة"], en: ["Fabric canopy and floor seating", "String lights", "Cold-drinks corner"] },
  aqiqah: { ar: ["سفرة بأطباق خليجية", "بطاقة دعاء للمولود", "ركن صدقة باسم المولود"], en: ["Gulf-style dinner table", "Prayer card for the baby", "Charity corner in the baby's name"] },
};

/** What to prepare for this look, in the mother's language. */
export function lookChecklist(l: Look, lang: "ar" | "en"): string[] {
  const pa = lang === "ar" ? l.palette.ar : l.palette.en;
  const base = lang === "ar" ? [`لوحة الاسم بألوان ${pa}`, `توزيعات مغلفة بألوان ${pa}`] : [`Name sign in ${pa}`, `Favors wrapped in ${pa}`];
  return [...themeBits[l.theme][lang], ...base, ...placeBits[l.place][lang]];
}

/** A task made by adopting a look (its notes hold the look id; older ones start with a sparkle). */
export const isLookTask = (t: { area: string; title: string; notes?: string }) =>
  t.area === "reception" && (t.title.startsWith("\u2728") || /^(hospital|majlis|family|outdoor|aqiqah)\.[a-z]+\.[a-z-]+$/.test(t.notes ?? ""));

export function lookTitle(l: Look, lang: "ar" | "en") {
  const th = themes.find((x) => x.id === l.theme)!;
  return lang === "ar" ? `${th.ar} · ${l.palette.ar}` : `${th.en} · ${l.palette.en}`;
}
