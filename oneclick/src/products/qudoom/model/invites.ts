/**
 * The invitation studio's 300 designs (story size, 1080×1920). Each one is its own idea: a main
 * motif placed in its own layout, in one material (knitted wool, felt, cut paper, watercolour, fine
 * line or gold on dark), with its own colours, companions, fonts and opening words. No two designs
 * share the same motif, layout and material. Drawn on the mother's device by ui/InviteArt and
 * ui/InviteCanvas, so she can download or print without any outside service.
 */
import { rng, type ArtLayout, type ArtPalette, type Band, type Material } from "../ui/InviteArt";

export type InviteTheme = "animals" | "sea" | "sky" | "flowers" | "heritage" | "things";
export type InviteOccasion = "welcome" | "aqiqah" | "shower" | "reveal";
export type InviteDesign = {
  id: string; n: number; ar: string; en: string;
  material: Material; layout: ArtLayout; hero: string; comps: string[]; band: Band; mirror: boolean;
  theme: InviteTheme; palette: ArtPalette; font: string; titleFont: string; body: string; text: number;
};

// ───────────────────────── colours ─────────────────────────
type PalIn = [id: string, ar: string, en: string, bg: string, bg2: string, main: string, light: string, accent: string, leaf: string, sun: string, dark: string, ink: string, name: string, soft: string];
const pal = (m: Material, list: PalIn[]): ArtPalette[] =>
  list.map(([id, ar, en, bg, bg2, main, light, accent, leaf, sun, dark, ink, name, soft]) => ({ id: `${m}-${id}`, ar, en, bg, bg2, main, light, accent, leaf, sun, dark, ink, name, soft, ...(m === "gold" ? { night: true } : {}) }));

export const palettes: Record<Material, ArtPalette[]> = {
  knit: pal("knit", [
    ["oat", "شوفاني ورمادي", "Oat & grey", "#e9e2d8", "#e1d8cb", "#8e8b86", "#f6efe2", "#bf9563", "#a2aa8a", "#e0bd72", "#3b322b", "#77726c", "#6f6b66", "#6f6a64"],
    ["sand", "رملي وبني", "Sand & tan", "#efe6d9", "#e6d9c6", "#b98d5c", "#f8f0e2", "#8c9aa6", "#9fae8b", "#e6bf6c", "#3a2c22", "#7b6a58", "#8b6a47", "#7a6a5a"],
    ["blush", "وردي شوفاني", "Blush oat", "#f1e6e2", "#ead9d3", "#c99aa0", "#fbf3ec", "#a7a3b8", "#a9b49a", "#e8c37a", "#3f2e30", "#7e6266", "#a8737b", "#7d6a6c"],
    ["sage", "أخضر وكريمي", "Sage & cream", "#e8eadf", "#dde1d1", "#94a585", "#f7f3e6", "#c9a06c", "#7f9670", "#e2c47a", "#2f3a2a", "#5f6b56", "#6e8460", "#66705f"],
    ["sky", "سماوي وشوفاني", "Sky & oat", "#e6e8ea", "#dcdfe3", "#8fa6bd", "#f6f2ea", "#c7a07a", "#a3ae92", "#e4c27a", "#2b3542", "#5f6d7c", "#6c86a0", "#66707b"],
    ["lilac", "ليلكي هادئ", "Soft lilac", "#ebe7ee", "#e1dbe6", "#a99bc0", "#f8f4f0", "#d3a7a1", "#a6b09a", "#e6c57e", "#352d40", "#6c6379", "#86769f", "#6d6676"],
    ["mustard", "خردلي ورمادي", "Mustard & grey", "#ecebe6", "#e2e0d8", "#d2a752", "#f7f2e6", "#8d9096", "#9aa786", "#e0b04f", "#33302a", "#6c6a64", "#a4823c", "#6c6a64"],
    ["cocoa", "كاكاو وكريمي", "Cocoa & cream", "#efe7df", "#e5d9cd", "#9b7458", "#faf3ea", "#d79d8f", "#a4ad8c", "#e5be74", "#33251c", "#715a49", "#7f5b42", "#6f5d50"],
  ]),
  felt: pal("felt", [
    ["rose", "وردي مغبّر", "Dusty rose", "#f5ece8", "#efe1dc", "#d49aa3", "#fbf4ef", "#8fb2c6", "#9cb48f", "#efc56f", "#3d2a2e", "#7e5f64", "#b86f7c", "#7d6a6d"],
    ["sage", "مريمية", "Sage", "#eef1e9", "#e3e8dc", "#9bb38c", "#f9f7ef", "#e2a487", "#7e9a6c", "#eec66d", "#2c3626", "#5e6e55", "#6b8c5d", "#65705e"],
    ["powder", "أزرق بودرة", "Powder blue", "#edf1f5", "#e1e8ef", "#8fb0cf", "#f9f9f5", "#f0b2a2", "#9bb58d", "#f0c86e", "#26313d", "#5b6c7e", "#5e87ae", "#62707e"],
    ["honey", "عسلي", "Honey", "#f6f0e4", "#efe4d0", "#e2b45a", "#fdf8ec", "#c98f8f", "#a2b38a", "#e9b54e", "#3b2f1d", "#796648", "#b18531", "#76684f"],
    ["lavender", "خزامى", "Lavender", "#f2eff6", "#e7e2ee", "#b4a1d2", "#fbf9f5", "#f2b6b6", "#a3b996", "#f1cb76", "#30293d", "#6b6280", "#8a74b0", "#6c6678"],
    ["peach", "خوخي", "Peach", "#fbf1ea", "#f5e3d7", "#f0a985", "#fff9f3", "#9cc3c1", "#a8bb8d", "#f2c66c", "#3f2a20", "#80604f", "#cc7d58", "#7c6b61"],
    ["mint", "نعناعي", "Mint", "#eef6f2", "#e0eee7", "#8fcab4", "#f9fbf6", "#f1a9a2", "#8db886", "#f2ca70", "#23362f", "#56756a", "#4f9c82", "#5f716b"],
    ["clay", "طيني", "Clay", "#f6ede6", "#eedfd3", "#cf8a68", "#fcf6ef", "#8ea7a3", "#a2b08c", "#ecbe68", "#3a261c", "#7a5a4a", "#a8603f", "#77655b"],
  ]),
  paper: pal("paper", [
    ["blue", "أبيض وأزرق", "White & blue", "#f7f7f5", "#e6e9ed", "#3f6ea3", "#dfe9f3", "#e5a3b0", "#8fae9a", "#e8c26e", "#1e2f45", "#6f7781", "#4c78a8", "#7b8189"],
    ["pink", "أبيض ووردي", "White & pink", "#f9f6f6", "#efe6e8", "#d77f98", "#f8e3e8", "#8fb1d2", "#9db797", "#efc777", "#3f2630", "#7b6a70", "#c46784", "#857a7e"],
    ["sage", "أبيض وأخضر", "White & green", "#f6f7f3", "#e7ebe3", "#6f9068", "#e3ecdc", "#e5b18f", "#6f9068", "#e5c573", "#25331f", "#6c7468", "#5c7d55", "#7a8077"],
    ["lilac", "أبيض وليلكي", "White & lilac", "#f8f7fa", "#ebe8f1", "#8c76c2", "#ece5f6", "#efb0a9", "#9db799", "#efca7a", "#2c2340", "#726c80", "#7a63b0", "#7f7a89"],
    ["teal", "أبيض وفيروزي", "White & teal", "#f5f8f8", "#e3ecec", "#2f8f8c", "#d9eeec", "#f0a98f", "#7fa889", "#ecc56c", "#163634", "#66777a", "#2a7f7c", "#76807f"],
    ["peach", "أبيض وخوخي", "White & peach", "#fbf8f5", "#f1e8e1", "#e08a5f", "#fbe6d8", "#8fb3c9", "#a1b68d", "#eec26a", "#3e2518", "#7c6d64", "#c6724a", "#857a72"],
    ["navy", "أبيض وكحلي", "White & navy", "#f6f6f7", "#e5e7ec", "#2c3e70", "#dde3f2", "#d9b26a", "#8ea79b", "#e2be6a", "#141d36", "#666d7c", "#2c3e70", "#777d89"],
    ["gold", "أبيض وذهبي", "White & gold", "#fbfaf6", "#f0ece2", "#c49a46", "#f5ecd6", "#a6b7c9", "#a5b38e", "#d9b25c", "#3a2c12", "#7a7262", "#a77f2f", "#857e70"],
  ]),
  watercolor: pal("watercolor", [
    ["cornflower", "كورن فلاور", "Cornflower", "#f8f8f6", "#f0f1f3", "#6f84d6", "#dfe5fa", "#9fb07f", "#93a77c", "#ecc66c", "#24306f", "#7d8dcc", "#2f4486", "#7d8dcc"],
    ["blush", "وردي مائي", "Blush wash", "#fbf8f6", "#f5eeec", "#e796ad", "#fbe4ea", "#9fb6d8", "#9cb48c", "#efc874", "#5a2a3a", "#b07a8a", "#b8577a", "#a78890"],
    ["lavender", "خزامى مائي", "Lavender wash", "#faf9fb", "#f2eff6", "#a48bd6", "#ece4fa", "#e8b3a0", "#9db48e", "#f0cc7a", "#3a2a5c", "#8a7aa8", "#6e56a6", "#8c839e"],
    ["mustard", "خردلي مائي", "Mustard wash", "#fbfaf5", "#f4f1e6", "#e0b04c", "#faf0d2", "#8fa8c6", "#9bb07e", "#e7b244", "#4a3814", "#9a8350", "#a77c22", "#8e866f"],
    ["sage", "أخضر مائي", "Sage wash", "#f8faf6", "#eff3ec", "#8fb07d", "#e4efdc", "#e7a99b", "#7ea56d", "#ecc570", "#2a3d22", "#6f8566", "#557548", "#7b8676"],
    ["coral", "مرجاني مائي", "Coral wash", "#fcf8f6", "#f6eeea", "#ee8f7a", "#fde3dc", "#88b6c0", "#9fb88a", "#f1c56e", "#4c2219", "#a87566", "#c75f4a", "#977f78"],
    ["sky", "سماوي مائي", "Sky wash", "#f7fafc", "#edf3f8", "#79acd8", "#deedf8", "#f0b3a6", "#9ab88f", "#eecb73", "#1e3a56", "#6d8ca8", "#3f7bb0", "#7a8b9a"],
    ["peony", "فاوانيا", "Peony", "#fcf8f8", "#f6eef0", "#d88aa8", "#f6dce6", "#c7b0de", "#97b08a", "#efc97c", "#4b2238", "#a47790", "#a64d78", "#957d88"],
  ]),
  line: pal("line", [
    ["navy", "كحلي على أبيض", "Navy on white", "#fbfbf9", "#f3f3ef", "#c9d3f2", "#e2e8fa", "#9aa7de", "#b9c7a6", "#ecd28e", "#2f3f7a", "#5f6ea8", "#2f4486", "#7d8dcc"],
    ["olive", "زيتوني", "Olive", "#fbfaf5", "#f2f0e6", "#d8dfc4", "#e9eddc", "#c7b37f", "#b5c39b", "#e7cf8a", "#4f5a2c", "#6d7650", "#58652f", "#7f8466"],
    ["terracotta", "طيني", "Terracotta", "#fcf8f4", "#f4ece4", "#f0cdb9", "#f8e3d6", "#d9a18a", "#c2c7a6", "#eccd8c", "#8a4a32", "#946a5b", "#9a4f33", "#97817a"],
    ["plum", "برقوقي", "Plum", "#fbf9fa", "#f3eef1", "#e3c9dc", "#f1e3ed", "#c9a3c0", "#bcc6ae", "#e9cf8e", "#5a2d50", "#7f5a76", "#6d3462", "#8d7889"],
    ["teal", "فيروزي", "Teal", "#f9fbfb", "#eef4f4", "#bfe0dc", "#ddefed", "#8cc4bd", "#b6c9ad", "#e8cf8c", "#1f5a57", "#4f7e7b", "#1f6b67", "#6f8a88"],
    ["charcoal", "فحمي", "Charcoal", "#fafaf8", "#f0f0ec", "#dcdcd6", "#ececea", "#c9b9a4", "#c0c6b4", "#e5cf96", "#33343a", "#5a5b62", "#33343a", "#7a7b80"],
    ["rose", "وردي غامق", "Deep rose", "#fcf9f9", "#f5eded", "#f2c9d1", "#f9e2e6", "#e3a3b2", "#c3c9ab", "#ecd08e", "#8a3550", "#9a6474", "#93385a", "#9a8189"],
    ["forest", "أخضر غامق", "Forest", "#f9faf7", "#eff2eb", "#cfdcc6", "#e3ebdc", "#b7c9a2", "#a9bf98", "#e6cf8a", "#2f4a33", "#55705a", "#2f5537", "#73806f"],
  ]),
  gold: pal("gold", [
    ["navy", "كحلي وذهبي", "Navy & gold", "#1f2b4a", "#141d33", "#d4ad55", "#f3e3b5", "#e9c97c", "#cdb36e", "#f0cf7a", "#e2c27a", "#f4e9cf", "#e8cc85", "#d4d7e0"],
    ["emerald", "زمردي وذهبي", "Emerald & gold", "#173f37", "#0f2d27", "#d4ad55", "#f3e3b5", "#e9c97c", "#cdb36e", "#f0cf7a", "#e2c27a", "#f3ecd8", "#e8cc85", "#cfdcd6"],
    ["plum", "بنفسجي وذهبي", "Plum & gold", "#3a2340", "#28172d", "#d4ad55", "#f3e3b5", "#ecbfcf", "#cdb36e", "#f0cf7a", "#e2c27a", "#f6ecf1", "#ecc98e", "#e0d2dc"],
    ["charcoal", "فحمي وذهبي", "Charcoal & gold", "#26262b", "#1a1a1e", "#d4ad55", "#f3e3b5", "#e9c97c", "#cdb36e", "#f0cf7a", "#e2c27a", "#f4efe4", "#e8cc85", "#d8d6d0"],
    ["burgundy", "عنابي وذهبي", "Burgundy & gold", "#4a1d27", "#33121a", "#d4ad55", "#f3e3b5", "#f0c39a", "#cdb36e", "#f0cf7a", "#e2c27a", "#fbefe9", "#f0cf8e", "#e8d4d0"],
    ["teal", "فيروزي ليلي", "Midnight teal", "#173a44", "#0f2930", "#d4ad55", "#f3e3b5", "#e9c97c", "#cdb36e", "#f0cf7a", "#e2c27a", "#f0f2ea", "#e8cc85", "#cfdde0"],
    ["cocoa", "شوكولاتة وذهبي", "Cocoa & gold", "#3a2a22", "#2a1d17", "#d4ad55", "#f3e3b5", "#e9c97c", "#cdb36e", "#f0cf7a", "#e2c27a", "#f7ede2", "#e8cc85", "#ddd0c4"],
    ["slate", "رمادي أزرق", "Slate & gold", "#2c3440", "#1f252e", "#d4ad55", "#f3e3b5", "#c9d6e6", "#cdb36e", "#f0cf7a", "#e2c27a", "#f1f2f2", "#e8cc85", "#d3d8de"],
  ]),
};

export const materials: { id: Material; ar: string; en: string }[] = [
  { id: "knit", ar: "صوف محبوك", en: "Knitted" },
  { id: "felt", ar: "لبّاد مخيّط", en: "Stitched felt" },
  { id: "paper", ar: "ورق مقصوص", en: "Cut paper" },
  { id: "watercolor", ar: "ألوان مائية", en: "Watercolour" },
  { id: "line", ar: "خط رفيع", en: "Fine line" },
  { id: "gold", ar: "ذهبي على داكن", en: "Gold on dark" },
];
export const themes: { id: InviteTheme; ar: string; en: string }[] = [
  { id: "animals", ar: "حيوانات لطيفة", en: "Sweet animals" },
  { id: "sea", ar: "بحر", en: "Sea" },
  { id: "sky", ar: "سماء وقمر", en: "Sky & moon" },
  { id: "flowers", ar: "زهور", en: "Flowers" },
  { id: "heritage", ar: "تراث خليجي", en: "Gulf heritage" },
  { id: "things", ar: "أشياء البيبي", en: "Baby things" },
];

// ───────────────────────── motifs ─────────────────────────
type Hero = { id: string; ar: string; en: string; theme: InviteTheme; layouts: ArtLayout[] };
const CREATURE: ArtLayout[] = ["corner", "bottom", "arch", "medallion", "window", "garden", "mobile", "scatter", "vine"];
const SEA: ArtLayout[] = ["bottom", "window", "arch", "medallion", "scatter", "corner", "mobile"];
const SKY: ArtLayout[] = ["top", "corner", "mobile", "scatter", "arch", "bottom", "medallion"];
const FLOWER: ArtLayout[] = ["frame", "vine", "medallion", "arch", "garden", "scatter", "top"];
const THING: ArtLayout[] = ["arch", "medallion", "scatter", "garden", "bottom", "corner", "mobile", "window"];
const h = (id: string, ar: string, en: string, theme: InviteTheme, layouts: ArtLayout[]): Hero => ({ id, ar, en, theme, layouts });
const heroes: Hero[] = [
  h("teddy", "دبدوب", "Teddy", "animals", CREATURE), h("bunny", "أرنوب", "Bunny", "animals", CREATURE), h("elephant", "فيل صغير", "Little elephant", "animals", CREATURE),
  h("lamb", "خروف العقيقة", "Little lamb", "animals", CREATURE), h("duckling", "بطّوط", "Duckling", "animals", CREATURE), h("owl", "بومة", "Owl", "animals", CREATURE),
  h("bird", "عصفور", "Little bird", "animals", CREATURE), h("lion", "شبل", "Lion cub", "animals", CREATURE), h("bee", "نحلة", "Bee", "animals", CREATURE),
  h("butterfly", "فراشة", "Butterfly", "animals", CREATURE), h("swan", "بجعة", "Swan", "animals", SEA),
  h("whale", "حوت", "Whale", "sea", SEA), h("fish", "سمكة", "Fish", "sea", SEA), h("turtle", "سلحفاة", "Turtle", "sea", SEA), h("shell", "محارة ولؤلؤ", "Shell & pearls", "sea", SEA),
  h("boat", "قارب ورق", "Paper boat", "sea", SEA), h("dhow", "سفينة شراع", "Dhow", "heritage", SEA),
  h("moon", "هلال", "Crescent", "sky", SKY), h("sun", "شمس", "Sun", "sky", SKY), h("rainbow", "قوس قزح", "Rainbow", "sky", SKY), h("hotair", "منطاد", "Hot-air balloon", "sky", SKY),
  h("kite", "طيّارة ورق", "Kite", "sky", SKY), h("paperplane", "طائرة ورقية", "Paper plane", "sky", SKY), h("umbrella", "مظلة مطر", "Rain umbrella", "sky", SKY),
  h("cornflower", "كورن فلاور", "Cornflowers", "flowers", FLOWER), h("rose", "ورد جوري", "Roses", "flowers", FLOWER), h("tulip", "توليب", "Tulips", "flowers", FLOWER),
  h("daisy", "أقحوان", "Daisies", "flowers", FLOWER), h("sprig", "أغصان", "Leafy sprigs", "flowers", FLOWER), h("pampas", "بامبس", "Pampas", "flowers", FLOWER),
  h("cotton", "قطن", "Cotton", "flowers", FLOWER), h("dandelion", "هندباء", "Dandelion", "flowers", FLOWER),
  h("palm", "نخلة", "Palm", "heritage", ["frame", "vine", "garden", "bottom", "medallion", "arch"]), h("camel", "ناقة", "Camel", "heritage", ["bottom", "corner", "arch", "medallion", "window", "garden"]),
  h("dallah", "دلّة", "Dallah", "heritage", THING), h("lantern", "فانوس", "Lantern", "heritage", THING),
  h("pram", "عربة بيبي", "Pram", "things", THING), h("gift", "هدية", "Gift", "things", THING), h("balloons", "بالونات", "Balloons", "things", THING),
  h("crown", "تاج", "Crown", "things", THING), h("bow", "فيونكة", "Bow", "things", THING), h("feet", "قدمين صغار", "Tiny feet", "things", THING),
  h("heart", "قلب", "Heart", "things", THING), h("rattle", "خشخيشة", "Rattle", "things", THING), h("mushroom", "فطر", "Mushroom", "things", THING),
];

const pools: Record<InviteTheme, { sky: string[]; small: string[]; flora: string[]; band: Band[] }> = {
  animals: { sky: ["moon", "hotair", "sun", "rainbow", "kite", "balloons"], small: ["star", "heart", "sparkle", "butterfly"], flora: ["daisy", "tulip", "sprig", "cotton", "dandelion"], band: ["grass", "hills", "clouds"] },
  sea: { sky: ["sun", "moon", "cloud", "paperplane"], small: ["star", "sparkle", "fish", "shell"], flora: ["sprig", "pampas"], band: ["waves"] },
  sky: { sky: ["moon", "hotair", "sun", "rainbow", "cloud", "kite"], small: ["star", "sparkle", "heart"], flora: ["sprig", "daisy"], band: ["clouds", "hills"] },
  flowers: { sky: ["butterfly", "bee", "sun"], small: ["butterfly", "heart", "sparkle", "feet"], flora: ["sprig", "daisy", "cotton", "tulip", "rose", "cornflower"], band: ["grass", "hills"] },
  heritage: { sky: ["moon", "lantern", "sun", "star"], small: ["star", "sparkle", "heart"], flora: ["palm", "sprig", "cotton"], band: ["dunes", "waves"] },
  things: { sky: ["moon", "hotair", "balloons", "rainbow", "sun"], small: ["star", "heart", "sparkle", "bow"], flora: ["sprig", "daisy", "cotton", "pampas"], band: ["clouds", "grass", "hills"] },
};

const layoutWords: Record<ArtLayout, [string, string]> = {
  corner: ["في ليلة حالمة", "on a dreamy night"], bottom: ["فوق الغيم", "above the clouds"], top: ["في السماء", "in the sky"], frame: ["بين الزهور", "among the flowers"],
  arch: ["في القوس", "in the arch"], medallion: ["في الإكليل", "in the wreath"], mobile: ["تحت المعلّقة", "under the mobile"], garden: ["في الحديقة", "in the garden"],
  scatter: ["بين النجوم", "among the stars"], vine: ["على الغصن", "by the vine"], window: ["في نافذة القمر", "in the moon window"],
};
const bandWords: Record<Band, [string, string]> = { waves: ["على الموج", "on the waves"], dunes: ["على الكثبان", "on the dunes"], hills: ["على التلال", "on the hills"], grass: ["على العشب", "on the grass"], clouds: ["فوق الغيم", "above the clouds"] };

// ───────────────────────── fonts per material ─────────────────────────
const nameFonts: Record<Material, string[]> = {
  knit: ["el-messiri", "reem-kufi-fun", "marhey", "lemonada", "baloo-bhaijaan-2", "changa", "playpen-sans-arabic", "lalezar", "kufam", "alexandria"],
  felt: ["reem-kufi-fun", "marhey", "baloo-bhaijaan-2", "lemonada", "playpen-sans-arabic", "cairo", "zain", "fustat", "beiruti", "handjet"],
  paper: ["aref-ruqaa", "ruwudu", "vibes", "katibeh", "rakkas", "mirza", "gulzar", "jomhuria", "noto-nastaliq-urdu", "badeen-display"],
  watercolor: ["reem-kufi", "qahiri", "kufam", "el-messiri", "noto-kufi-arabic", "beiruti", "badeen-display", "readex-pro", "almarai", "fustat"],
  line: ["noto-nastaliq-urdu", "gulzar", "amiri", "scheherazade-new", "markazi-text", "noto-naskh-arabic", "lateef", "alkalami", "harmattan", "mirza"],
  gold: ["ruwudu", "vibes", "aref-ruqaa", "noto-nastaliq-urdu", "blaka", "amiri", "jomhuria", "katibeh", "blaka-hollow", "gulzar"],
};
const titleFonts: Record<Material, string[]> = {
  knit: ["aref-ruqaa", "ruwudu", "vibes", "katibeh"], felt: ["aref-ruqaa", "marhey", "reem-kufi-fun", "rakkas"], paper: ["aref-ruqaa", "ruwudu", "vibes", "katibeh"],
  watercolor: ["reem-kufi", "kufam", "qahiri", "aref-ruqaa"], line: ["noto-nastaliq-urdu", "amiri", "aref-ruqaa", "gulzar"], gold: ["ruwudu", "vibes", "aref-ruqaa", "amiri"],
};
const bodyFonts: Record<Material, string[]> = {
  knit: ["amiri-400", "noto-naskh-arabic-400", "tajawal-400", "markazi-text-400"], felt: ["tajawal-400", "cairo-400", "almarai-400", "readex-pro-400"],
  paper: ["amiri-400", "noto-naskh-arabic-400", "scheherazade-new-400", "markazi-text-400"], watercolor: ["reem-kufi-400", "el-messiri-400", "ibm-plex-sans-arabic-400", "tajawal-400"],
  line: ["amiri-400", "lateef-400", "markazi-text-400", "noto-naskh-arabic-400"], gold: ["amiri-400", "scheherazade-new-400", "noto-naskh-arabic-400", "el-messiri-400"],
};

// ───────────────────────── words ─────────────────────────
/** `{m|f}` picks the boy or girl form. */
export type TextSet = { opener: string; title: string; line: string };
export const textSets: { ar: TextSet; en: TextSet }[] = [
  { ar: { opener: "الحمدُ لله على تمام النعمة واكتمال المنّة\nالحمدُ لله حبّـــاً وشُكــراً وامتنانـــاً", title: "أجمل العطايا", line: "اللهم أنبت{ه|ها} نباتاً حسناً واجعل{ه|ها} قرّة عينٍ لنا" }, en: { opener: "With hearts full of gratitude", title: "The sweetest gift", line: "May God bless {him|her} and keep {him|her} close" } },
  { ar: { opener: "اللهـــم لــك الحمـد أكملــه\nولــك الثنـــاء أجملـــه", title: "الحمــدلله الذي أكرمنـــا ب{مولودنا|مولودتنا}", line: "اللهـــم أنبت{ـه|ـها} نباتـــاً حسنـــاً\nواجعل{ـه|ـها} قـــرّة عيـــنٍ لنـــا" }, en: { opener: "All praise and thanks", title: "We have been blessed with", line: "May {he|she} grow in goodness" } },
  { ar: { opener: "الحمدُ لله الذي وهبني روحاً من روحي\nوجعـل لنا من زينـة الحيـاة نصيبـاً", title: "ووهبنـــا الله", line: "اللهم أنبت{ه|ها} نباتاً حسناً واجعل{ه|ها} قرّة\nعينٍ لوالدي{ه|ها} واحفظ{ه|ها} وبارك في{ه|ها}" }, en: { opener: "A piece of our hearts", title: "God has given us", line: "Bless {him|her} and keep {him|her} safe" } },
  { ar: { opener: "﴿المالُ والبنونَ زينةُ الحياةِ الدنيا﴾", title: "زينـــة حياتنـــا", line: "حيّاكم الله لمشاركتنا فرحتنا بقدوم{ه|ها}" }, en: { opener: "The joy of our life", title: "Our little treasure", line: "Join us to celebrate {his|her} arrival" } },
  { ar: { opener: "بقلوبٍ ملؤها الفرح والامتنان", title: "ندعوكم لاستقبال", line: "حضوركم يُتمّ فرحتنا" }, en: { opener: "With joy and gratitude", title: "You're invited to welcome", line: "Your presence completes our joy" } },
  { ar: { opener: "هديّـــةٌ من الرحمــن", title: "{نوّر|نوّرت} دنيانا", line: "يا رب اجعل{ه|ها} من الصالحين" }, en: { opener: "A gift from above", title: "Our world is brighter", line: "May {he|she} be among the good" } },
  { ar: { opener: "أشرقت دنيانا بقدوم", title: "", line: "{أنار|أنارت} بيتنا وملأ{|ت} قلوبنا فرحاً" }, en: { opener: "Our world lit up with", title: "", line: "{He|She} filled our home with joy" } },
  { ar: { opener: "﴿ربِّ هَبْ لي من لدُنكَ ذريّةً طيّبة﴾", title: "وصلت الأمنية", line: "الحمد لله الذي استجاب دعاءنا" }, en: { opener: "Our prayer was answered", title: "Our wish came true", line: "Thanks be to God" } },
  { ar: { opener: "بسم الله ما شاء الله", title: "قـــرّة العيـــن", line: "نسأل الله أن يجعل{ه|ها} {بارّاً|بارّةً} بوالدي{ه|ها}" }, en: { opener: "In God's name", title: "The joy of our eyes", line: "May {he|she} be kind and loving" } },
  { ar: { opener: "بحمد الله وفضله", title: "رُزقنا ب{صغيرنا|صغيرتنا}", line: "أسعد الله أيامكم كما أسعد أيامنا ب{ه|ها}" }, en: { opener: "By God's grace", title: "Welcome, little one", line: "May your days be as happy as ours" } },
  { ar: { opener: "مرحبـــاً بالضيـــف الصغيـــر", title: "أهلاً بالنور", line: "شاركونا الفرحة واستقبال{ه|ها}" }, en: { opener: "Hello, little guest", title: "Welcome to the light", line: "Share our joy and welcome {him|her}" } },
  { ar: { opener: "فرحــة العمــر", title: "{جاء الغالي|جاءت الغالية}", line: "الله يحفظ{ه|ها} ويخلّي{ه|ها} لنا" }, en: { opener: "The joy of a lifetime", title: "Our dear one is here", line: "God keep {him|her} for us" } },
  { ar: { opener: "وتبقى الفرحة أجمل حين نتشاركها", title: "استقبال المولود", line: "يسعدنا حضوركم ومشاركتكم" }, en: { opener: "Joy is sweeter when shared", title: "Baby welcome", line: "We would love to see you" } },
  { ar: { opener: "بكل حبّ نعلن وصول", title: "", line: "أصغر فرد في العائلة" }, en: { opener: "With love we announce", title: "", line: "The newest member of the family" } },
  { ar: { opener: "الحمد لله الذي بنعمته تتمّ الصالحات", title: "{مولودنا الغالي|مولودتنا الغالية}", line: "اللهم بارك ل{ه|ها} واحفظ{ه|ها} من كل سوء" }, en: { opener: "Thanks for every blessing", title: "Our precious baby", line: "God bless and protect {him|her}" } },
  { ar: { opener: "يا ربّ احفظ{ه|ها} بعينك التي لا تنام", title: "{نجم بيتنا|نجمة بيتنا}", line: "حيّاكم الله" }, en: { opener: "Watched over with love", title: "The star of our home", line: "You are warmly welcome" } },
];
export const genderize = (s: string, girl: boolean) => s.replace(/\{([^|{}]*)\|([^|{}]*)\}/g, (_, m: string, f: string) => (girl ? f : m));

/** Words for the other occasions (all editable). */
export const occasionText: Record<Exclude<InviteOccasion, "welcome">, { ar: TextSet; en: TextSet }> = {
  aqiqah: { ar: { opener: "الحمدُ لله على تمام النعمة", title: "ندعوكم لحضور عقيقة", line: "حضوركم يسعدنا ويُكمل فرحتنا" }, en: { opener: "With gratitude to God", title: "You're invited to the aqiqah of", line: "Your presence completes our joy" } },
  shower: { ar: { opener: "على وشك نصير أكثر", title: "بيبي شاور", line: "تعالوا نحتفل قبل وصول الصغير" }, en: { opener: "Soon we'll be one more", title: "Baby shower", line: "Come celebrate before the little one arrives" } },
  reveal: { ar: { opener: "ولد ولا بنت؟", title: "حفلة كشف الجنس", line: "تعالوا نكتشف السر سوا" }, en: { opener: "Boy or girl?", title: "Gender reveal", line: "Come find out with us" } },
};
export const occasions: { id: InviteOccasion; ar: string; en: string }[] = [
  { id: "welcome", ar: "استقبال المولود", en: "Welcome" },
  { id: "aqiqah", ar: "العقيقة", en: "Aqiqah" },
  { id: "shower", ar: "بيبي شاور", en: "Baby shower" },
  { id: "reveal", ar: "كشف الجنس", en: "Gender reveal" },
];

// ───────────────────────── the 300 ─────────────────────────
const MATS: Material[] = ["knit", "paper", "watercolor", "felt", "line", "gold"];
type Idea = { hero: Hero; layout: ArtLayout; material: Material };

function build(): InviteDesign[] {
  const r = rng(20261013);
  const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)];
  // Every motif gets a queue of distinct (layout, material) ideas: each layout once before any repeats.
  const queues: Idea[][] = heroes.map((hero, hi) => {
    const first = hero.layouts.map((layout, li) => ({ hero, layout, material: MATS[(hi + li) % MATS.length] }));
    const second = hero.layouts.map((layout, li) => ({ hero, layout, material: MATS[(hi + li + 3) % MATS.length] }));
    return [...first, ...second];
  });
  const ideas: Idea[] = [];
  for (let round = 0; ideas.length < 300; round++) {
    let added = false;
    for (const q of queues) if (q[round] && ideas.length < 300) { ideas.push(q[round]); added = true; }
    if (!added) break;
  }
  const used: Record<string, number> = {};
  return ideas.map(({ hero, layout, material }, n) => {
    const pool = pools[hero.theme];
    const pals = palettes[material];
    used[material] = (used[material] ?? -1) + 1;
    const palette = pals[(used[material] * 3 + hero.id.length) % pals.length];
    const framing = layout === "frame" || layout === "vine" || layout === "medallion" || layout === "arch" || layout === "garden";
    const first = pick((framing ? pool.flora : pool.sky).filter((x) => x !== hero.id));
    const second = pick(pool.small.filter((x) => x !== hero.id));
    const third = pick([...pool.sky, ...pool.small].filter((x) => x !== hero.id && x !== first && x !== second));
    const band = pick(pool.band);
    const where = layout === "bottom" ? bandWords[band] : layoutWords[layout];
    const mat = materials.find((m) => m.id === material)!;
    const k = used[material];
    const nf = nameFonts[material], tf = titleFonts[material], bf = bodyFonts[material];
    return {
      id: `${hero.id}-${layout}-${material}`,
      n,
      ar: `${hero.ar} ${where[0]} · ${mat.ar}`,
      en: `${hero.en} ${where[1]} · ${mat.en}`,
      material, layout, hero: hero.id, comps: [first, second, third], band, mirror: r() < 0.5, theme: hero.theme, palette,
      font: nf[k % nf.length], titleFont: tf[(k >> 1) % tf.length], body: bf[(k >> 2) % bf.length], text: (n * 7) % textSets.length,
    };
  });
}

export const inviteDesigns: InviteDesign[] = build();
export const designById = (id?: string) => inviteDesigns.find((d) => d.id === id);
