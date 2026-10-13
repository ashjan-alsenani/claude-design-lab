/**
 * Arabic fonts for the invitation studio: 44 free (SIL Open Font License) families, self-hosted
 * under /brand/fonts/qudoom/inv (Arabic subset only). Nothing loads until a design or the font
 * picker needs it, so the studio stays light.
 */
export type FontGroup = "diwani" | "ruqaa" | "nastaliq" | "naskh" | "kufi" | "modern" | "fun" | "display";
export type InviteFontDef = { id: string; ar: string; en: string; group: FontGroup; weight: number; file: string };

const f = (id: string, ar: string, en: string, group: FontGroup, weight = 700, file = id): InviteFontDef => ({ id, ar, en, group, weight, file });

export const fontGroups: { id: FontGroup; ar: string; en: string }[] = [
  { id: "diwani", ar: "ديواني", en: "Diwani" },
  { id: "ruqaa", ar: "رقعة", en: "Ruqaa" },
  { id: "nastaliq", ar: "نستعليق", en: "Nastaliq" },
  { id: "naskh", ar: "نسخ", en: "Naskh" },
  { id: "kufi", ar: "كوفي", en: "Kufi" },
  { id: "modern", ar: "عصري", en: "Modern" },
  { id: "fun", ar: "مرح", en: "Playful" },
  { id: "display", ar: "عريض للعناوين", en: "Display" },
];

/** Display fonts: the baby's name and the title. */
export const inviteFonts: InviteFontDef[] = [
  f("ruwudu", "رُوُدو ديواني", "Ruwudu", "diwani"),
  f("vibes", "فايبز ديواني", "Vibes", "diwani", 400),
  f("aref-ruqaa", "عارف رقعة", "Aref Ruqaa", "ruqaa"),
  f("katibeh", "كاتبة", "Katibeh", "ruqaa", 400),
  f("rakkas", "رقّاص", "Rakkas", "ruqaa", 400),
  f("noto-nastaliq-urdu", "نستعليق", "Nastaliq", "nastaliq"),
  f("gulzar", "گلزار نستعليق", "Gulzar", "nastaliq", 400),
  f("amiri", "أميري", "Amiri", "naskh"),
  f("scheherazade-new", "شهرزاد", "Scheherazade", "naskh"),
  f("noto-naskh-arabic", "نسخ نوتو", "Noto Naskh", "naskh"),
  f("markazi-text", "مركزي", "Markazi", "naskh"),
  f("mirza", "ميرزا", "Mirza", "naskh"),
  f("lateef", "لطيف", "Lateef", "naskh"),
  f("harmattan", "هرمتان", "Harmattan", "naskh"),
  f("alkalami", "القلمي", "Alkalami", "naskh", 400),
  f("reem-kufi", "ريم كوفي", "Reem Kufi", "kufi"),
  f("reem-kufi-fun", "ريم كوفي مرح", "Reem Kufi Fun", "kufi"),
  f("kufam", "كُفام", "Kufam", "kufi"),
  f("qahiri", "قاهري", "Qahiri", "kufi", 400),
  f("noto-kufi-arabic", "كوفي نوتو", "Noto Kufi", "kufi"),
  f("el-messiri", "المسيري", "El Messiri", "modern"),
  f("cairo", "القاهرة", "Cairo", "modern"),
  f("tajawal", "تجوّل", "Tajawal", "modern"),
  f("almarai", "المراعي", "Almarai", "modern"),
  f("changa", "تشانغا", "Changa", "modern"),
  f("mada", "مدى", "Mada", "modern"),
  f("ibm-plex-sans-arabic", "آي بي إم بلكس", "IBM Plex Arabic", "modern"),
  f("readex-pro", "ريدكس", "Readex Pro", "modern"),
  f("alexandria", "الإسكندرية", "Alexandria", "modern"),
  f("noto-sans-arabic", "نوتو سانس", "Noto Sans Arabic", "modern"),
  f("beiruti", "بيروتي", "Beiruti", "modern"),
  f("zain", "زين", "Zain", "modern"),
  f("fustat", "فسطاط", "Fustat", "modern"),
  f("rubik", "روبيك", "Rubik", "modern"),
  f("marhey", "مرحي", "Marhey", "fun"),
  f("lemonada", "ليمونادة", "Lemonada", "fun"),
  f("baloo-bhaijaan-2", "بالو بهايجان", "Baloo Bhaijaan", "fun"),
  f("playpen-sans-arabic", "بلاي بن", "Playpen Sans", "fun"),
  f("handjet", "هاندجت", "Handjet", "fun"),
  f("lalezar", "لاله‌زار", "Lalezar", "display", 400),
  f("jomhuria", "جمهورية", "Jomhuria", "display", 400),
  f("badeen-display", "بديع", "Badeen Display", "display", 400),
  f("blaka", "بلاكا", "Blaka", "display", 400),
  f("blaka-hollow", "بلاكا مفرّغ", "Blaka Hollow", "display", 400),
];

/** Text fonts: the softer lines (regular weight). */
export const inviteBodyFonts: InviteFontDef[] = [
  f("amiri-400", "أميري", "Amiri", "naskh", 400),
  f("noto-naskh-arabic-400", "نسخ نوتو", "Noto Naskh", "naskh", 400),
  f("markazi-text-400", "مركزي", "Markazi", "naskh", 400),
  f("scheherazade-new-400", "شهرزاد", "Scheherazade", "naskh", 400),
  f("lateef-400", "لطيف", "Lateef", "naskh", 400),
  f("tajawal-400", "تجوّل", "Tajawal", "modern", 400),
  f("cairo-400", "القاهرة", "Cairo", "modern", 400),
  f("readex-pro-400", "ريدكس", "Readex Pro", "modern", 400),
  f("ibm-plex-sans-arabic-400", "آي بي إم بلكس", "IBM Plex Arabic", "modern", 400),
  f("almarai-400", "المراعي", "Almarai", "modern", 400),
  f("el-messiri-400", "المسيري", "El Messiri", "modern", 400),
  f("reem-kufi-400", "ريم كوفي", "Reem Kufi", "kufi", 400),
];

const all = new Map([...inviteFonts, ...inviteBodyFonts].map((x) => [x.id, x]));
export const fontById = (id: string) => all.get(id);
/** The CSS family a canvas uses; Latin letters fall back to the site font. */
export const fontFamily = (id: string) => `"QDI ${id}", "Rubik", system-ui, sans-serif`;

const loading = new Map<string, Promise<void>>();
/** Load one font (once). Resolves even if it fails, so drawing never hangs. */
export function loadFont(id: string): Promise<void> {
  const def = all.get(id);
  if (!def || typeof document === "undefined" || typeof FontFace === "undefined") return Promise.resolve();
  let p = loading.get(id);
  if (!p) {
    const face = new FontFace(`QDI ${id}`, `url(/brand/fonts/qudoom/inv/${def.file}.woff2) format("woff2")`, { weight: "100 900", display: "swap" });
    p = face.load().then((ff) => { document.fonts.add(ff); }).catch(() => undefined);
    loading.set(id, p);
  }
  return p;
}
