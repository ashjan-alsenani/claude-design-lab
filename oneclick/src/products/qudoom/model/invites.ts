/**
 * The invitation studio's designs: 32 layouts, each in its own set of colourways, 300 in all. A layout
 * is a whole composition (frame, ornaments, where the words sit); a colourway recolours it. Drawn on
 * a canvas by ui/InviteCanvas, so the mother can download or print the result without any service.
 */
export type InviteLayout =
  | "arch" | "watercolor" | "minimal" | "clouds" | "balloons" | "teddy" | "sadu" | "arabesque" | "florals" | "pampas"
  | "rainbow" | "polaroid" | "ticket" | "envelope" | "stamp" | "palm" | "waves" | "pearls" | "honey" | "butterflies"
  | "hotair" | "confetti" | "awning" | "gingham" | "bigtype" | "wreath" | "window" | "dallah"
  | "moon" | "lanterns" | "starfield" | "goldnight";
export type InviteStyle = "classic" | "boho" | "heritage" | "playful" | "modern" | "night";
export type InviteFont = "ruqaa" | "kufi" | "naskh" | "messiri" | "rubik";
export type InvitePalette = { id: string; ar: string; en: string; bg: string; bg2: string; ink: string; accent: string; soft: string; dark?: boolean };
export type InviteDesign = { id: string; n: number; layout: InviteLayout; style: InviteStyle; palette: InvitePalette; font: InviteFont; ar: string; en: string };
export type InviteOccasion = "welcome" | "aqiqah" | "shower" | "reveal";

export const invitePalettes: InvitePalette[] = [
  { id: "blush", ar: "وردي ناعم", en: "Soft blush", bg: "#fff6f7", bg2: "#fde3e8", ink: "#4a3540", accent: "#d9748f", soft: "#f6c7d2" },
  { id: "sky", ar: "سماوي", en: "Sky blue", bg: "#f4f9ff", bg2: "#dcebfb", ink: "#24364f", accent: "#4f86c6", soft: "#b9d4f1" },
  { id: "sage", ar: "أخضر هادئ", en: "Sage", bg: "#f6f8f2", bg2: "#e1eadb", ink: "#2f3d2c", accent: "#6f9168", soft: "#c3d5bd" },
  { id: "sand", ar: "رملي", en: "Sand", bg: "#fbf6ee", bg2: "#efe2cc", ink: "#4a3b2a", accent: "#b88a52", soft: "#e2cba7" },
  { id: "lilac", ar: "ليلكي", en: "Lilac", bg: "#faf7fd", bg2: "#ebe1f6", ink: "#3d3150", accent: "#8b6cc1", soft: "#d4c4ec" },
  { id: "peach", ar: "خوخي", en: "Peach", bg: "#fff8f2", bg2: "#fde3d2", ink: "#4d3326", accent: "#e08a5f", soft: "#f6c4a8" },
  { id: "mint", ar: "نعناعي", en: "Mint", bg: "#f3fbf8", bg2: "#d7f0e7", ink: "#1f4038", accent: "#3f9e85", soft: "#a8dccb" },
  { id: "ivory-gold", ar: "عاجي وذهبي", en: "Ivory & gold", bg: "#fffcf4", bg2: "#f5ead0", ink: "#3e3524", accent: "#b8913a", soft: "#e6d3a0" },
  { id: "lemon", ar: "ليموني", en: "Lemon", bg: "#fffdf0", bg2: "#fbf0b8", ink: "#3f3a1c", accent: "#d4a72c", soft: "#f4e08a" },
  { id: "coral", ar: "مرجاني", en: "Coral", bg: "#fff6f3", bg2: "#fddcd3", ink: "#4a2a24", accent: "#e46f5b", soft: "#f7b8aa" },
  { id: "teal", ar: "فيروزي", en: "Turquoise", bg: "#f2fafa", bg2: "#d3eeee", ink: "#173c3d", accent: "#2b9a98", soft: "#9fd6d4" },
  { id: "pastel", ar: "وردي وأزرق", en: "Pink & blue", bg: "#fbf8fd", bg2: "#e6effa", ink: "#363a55", accent: "#e889a6", soft: "#a9c8ec" },
  { id: "terracotta", ar: "طيني", en: "Terracotta", bg: "#fdf6f0", bg2: "#f2d8c6", ink: "#43281c", accent: "#bf6a43", soft: "#e3b394" },
  { id: "grey-rose", ar: "رمادي ووردي", en: "Grey & rose", bg: "#f8f8f9", bg2: "#e7e8ec", ink: "#34343e", accent: "#c97b8f", soft: "#d5d7de" },
  { id: "navy-night", ar: "كحلي ليلي", en: "Navy night", bg: "#1d2a4a", bg2: "#2c3d66", ink: "#fdf7ea", accent: "#e6c06b", soft: "#4a5f8f", dark: true },
  { id: "emerald-night", ar: "زمردي", en: "Emerald", bg: "#123a33", bg2: "#1d5247", ink: "#fbf6e8", accent: "#d9b766", soft: "#2f6e60", dark: true },
  { id: "plum-night", ar: "بنفسجي داكن", en: "Plum", bg: "#3a2340", bg2: "#53335b", ink: "#fbf2f7", accent: "#e9b9cf", soft: "#6e4a77", dark: true },
  { id: "charcoal", ar: "فحمي", en: "Charcoal", bg: "#26262b", bg2: "#38383f", ink: "#f7f3ea", accent: "#d8b979", soft: "#55555e", dark: true },
  { id: "burgundy", ar: "عنابي", en: "Burgundy", bg: "#4a1d27", bg2: "#64283a", ink: "#fdf3ee", accent: "#ebc28a", soft: "#81405a", dark: true },
];

const layouts: { id: InviteLayout; style: InviteStyle; font: InviteFont; ar: string; en: string }[] = [
  { id: "arch", style: "classic", font: "messiri", ar: "قوس الأوراق", en: "Leafy arch" },
  { id: "watercolor", style: "classic", font: "naskh", ar: "ألوان مائية", en: "Watercolour wash" },
  { id: "minimal", style: "modern", font: "messiri", ar: "خط رفيع", en: "Fine line" },
  { id: "clouds", style: "playful", font: "kufi", ar: "فوق الغيم", en: "Above the clouds" },
  { id: "balloons", style: "playful", font: "kufi", ar: "بالونات", en: "Balloons" },
  { id: "teddy", style: "playful", font: "kufi", ar: "دبدوب", en: "Teddy" },
  { id: "sadu", style: "heritage", font: "kufi", ar: "سدو", en: "Sadu" },
  { id: "arabesque", style: "heritage", font: "ruqaa", ar: "زخرفة عربية", en: "Arabesque" },
  { id: "florals", style: "classic", font: "naskh", ar: "ورد الزوايا", en: "Corner florals" },
  { id: "pampas", style: "boho", font: "messiri", ar: "بامبس بوهو", en: "Boho pampas" },
  { id: "rainbow", style: "boho", font: "messiri", ar: "قوس قزح بوهو", en: "Boho rainbow" },
  { id: "polaroid", style: "modern", font: "kufi", ar: "صورة فورية", en: "Instant photo" },
  { id: "ticket", style: "modern", font: "kufi", ar: "تذكرة وصول", en: "Arrival ticket" },
  { id: "envelope", style: "modern", font: "naskh", ar: "ظرف", en: "Envelope" },
  { id: "stamp", style: "modern", font: "kufi", ar: "طابع بريد", en: "Postage stamp" },
  { id: "palm", style: "heritage", font: "messiri", ar: "نخلة وتمر", en: "Palm & dates" },
  { id: "waves", style: "heritage", font: "messiri", ar: "موج الخليج", en: "Gulf waves" },
  { id: "pearls", style: "heritage", font: "naskh", ar: "خيوط لؤلؤ", en: "Pearl strings" },
  { id: "honey", style: "playful", font: "kufi", ar: "خلية عسل", en: "Honeycomb" },
  { id: "butterflies", style: "classic", font: "messiri", ar: "فراشات", en: "Butterflies" },
  { id: "hotair", style: "playful", font: "kufi", ar: "منطاد", en: "Hot-air balloon" },
  { id: "confetti", style: "boho", font: "kufi", ar: "قصاصات ملونة", en: "Confetti" },
  { id: "awning", style: "playful", font: "kufi", ar: "مظلة مخططة", en: "Striped awning" },
  { id: "gingham", style: "boho", font: "messiri", ar: "مربعات نزهة", en: "Picnic gingham" },
  { id: "bigtype", style: "modern", font: "kufi", ar: "اسم كبير", en: "Big name" },
  { id: "wreath", style: "classic", font: "ruqaa", ar: "إكليل", en: "Wreath" },
  { id: "window", style: "heritage", font: "ruqaa", ar: "نافذة خليجية", en: "Gulf window" },
  { id: "dallah", style: "heritage", font: "ruqaa", ar: "دلة وفناجين", en: "Dallah & cups" },
  { id: "moon", style: "night", font: "ruqaa", ar: "هلال الليل", en: "Night crescent" },
  { id: "lanterns", style: "night", font: "ruqaa", ar: "فوانيس", en: "Lanterns" },
  { id: "starfield", style: "night", font: "messiri", ar: "سماء نجوم", en: "Starry sky" },
  { id: "goldnight", style: "night", font: "naskh", ar: "ذهب على داكن", en: "Gold on dark" },
];

const light = invitePalettes.filter((p) => !p.dark);
const dark = invitePalettes.filter((p) => p.dark);

/** 28 light layouts × 10 colourways (a different ten for each) + 4 night layouts × 5 = 300. */
export const inviteDesigns: InviteDesign[] = layouts.flatMap((l, li) => {
  const pals = l.style === "night" ? dark : Array.from({ length: 10 }, (_, k) => light[(li * 3 + k) % light.length]);
  return pals.map((palette, k) => ({ id: `${l.id}-${palette.id}`, n: li * 10 + k, layout: l.id, style: l.style, palette, font: l.font, ar: `${l.ar} · ${palette.ar}`, en: `${l.en} · ${palette.en}` }));
});

export const inviteStyles: { id: InviteStyle; ar: string; en: string }[] = [
  { id: "classic", ar: "كلاسيكي ناعم", en: "Soft classic" },
  { id: "heritage", ar: "تراث خليجي", en: "Gulf heritage" },
  { id: "playful", ar: "مرح للأطفال", en: "Playful" },
  { id: "boho", ar: "بوهو", en: "Boho" },
  { id: "modern", ar: "عصري", en: "Modern" },
  { id: "night", ar: "داكن فخم", en: "Dark & grand" },
];
export const inviteFonts: { id: InviteFont; ar: string; en: string; family: string }[] = [
  { id: "ruqaa", ar: "خط رقعة", en: "Ruqaa calligraphy", family: '"QD Ruqaa", "QD Naskh", serif' },
  { id: "naskh", ar: "خط نسخ", en: "Naskh", family: '"QD Naskh", serif' },
  { id: "kufi", ar: "كوفي عصري", en: "Modern Kufi", family: '"QD Kufi", "Rubik", sans-serif' },
  { id: "messiri", ar: "أنيق", en: "Elegant", family: '"QD Messiri", "Rubik", sans-serif' },
  { id: "rubik", ar: "بسيط", en: "Simple", family: '"Rubik", system-ui, sans-serif' },
];

/** Default words for each occasion (all editable). */
export const occasionText: Record<InviteOccasion, { ar: { opener: string; title: string; line: string }; en: { opener: string; title: string; line: string } }> = {
  welcome: { ar: { opener: "بكل الحب والفرح", title: "ندعوكم لاستقبال", line: "شاركونا فرحتنا بقدومه" }, en: { opener: "With love and joy", title: "You're invited to welcome", line: "Share our joy at the new arrival" } },
  aqiqah: { ar: { opener: "الحمد لله على تمام النعمة", title: "ندعوكم لحضور عقيقة", line: "حضوركم يسعدنا ويكمل فرحتنا" }, en: { opener: "With gratitude to God", title: "You're invited to the aqiqah of", line: "Your presence completes our joy" } },
  shower: { ar: { opener: "على وشك نصير أكثر", title: "بيبي شاور", line: "تعالوا نحتفل قبل وصول الصغير" }, en: { opener: "Soon we'll be one more", title: "Baby shower", line: "Come celebrate before the little one arrives" } },
  reveal: { ar: { opener: "ولد ولا بنت؟", title: "حفلة كشف الجنس", line: "تعالوا نكتشف السر سوا" }, en: { opener: "Boy or girl?", title: "Gender reveal", line: "Come find out with us" } },
};
export const occasions: { id: InviteOccasion; ar: string; en: string }[] = [
  { id: "welcome", ar: "استقبال المولود", en: "Welcome" },
  { id: "aqiqah", ar: "العقيقة", en: "Aqiqah" },
  { id: "shower", ar: "بيبي شاور", en: "Baby shower" },
  { id: "reveal", ar: "كشف الجنس", en: "Gender reveal" },
];
