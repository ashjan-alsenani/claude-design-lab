import type { IdeaKind } from "./all-ideas";
import type { Country } from "./types";

/**
 * «وين ألاقيها»: ready search links for an idea, local to the mother's country and city. We don't
 * list or rank shops (no ads, no commissions); each link opens a normal search in Maps, Instagram,
 * Google Shopping or a big marketplace that serves her country. Nothing is sent from the app.
 */
export type WhereLink = { id: "maps" | "instagram" | "shopping" | "noon" | "amazon" | "web"; label: { ar: string; en: string }; url: string };

const countryName: Record<Country, { ar: string; en: string }> = {
  OM: { ar: "عمان", en: "Oman" }, SA: { ar: "السعودية", en: "Saudi Arabia" }, AE: { ar: "الإمارات", en: "UAE" },
  KW: { ar: "الكويت", en: "Kuwait" }, BH: { ar: "البحرين", en: "Bahrain" }, QA: { ar: "قطر", en: "Qatar" }, other: { ar: "", en: "" },
};
const market: Partial<Record<Country, { noon?: string; amazon?: string }>> = {
  SA: { noon: "https://www.noon.com/saudi-ar/search/?q=", amazon: "https://www.amazon.sa/s?k=" },
  AE: { noon: "https://www.noon.com/uae-ar/search/?q=", amazon: "https://www.amazon.ae/s?k=" },
};
/** What to look for, by kind: the idea itself plus the word a shop would use. */
const suffix: Record<IdeaKind, { ar: string; en: string } | null> = {
  favor: { ar: "توزيعات مواليد", en: "baby favors" },
  gift: { ar: "", en: "" },
  mother: { ar: "", en: "" },
  decor: { ar: "تنسيق استقبال مواليد", en: "baby welcome decor" },
  sign: { ar: "لوحة اسم مواليد", en: "baby name sign" },
  hosp: { ar: "ضيافة", en: "catering" },
  photo: { ar: "مصورة مواليد", en: "newborn photographer" },
  hospital: { ar: "تنسيق استقبال مستشفى مواليد", en: "hospital baby welcome decor" },
  aqiqah: { ar: "عقيقة", en: "aqiqah" },
  keepsake: { ar: "تذكار مواليد", en: "baby keepsake" },
  thanks: null,
};
/** Short enough for a search box: the idea's main words, without the long detail after a comma. */
const core = (s: string) => s.split(/[،,(«]/)[0].trim().slice(0, 60);
const q = encodeURIComponent;

export function whereLinks(o: { text: string; kind: IdeaKind; country: Country; city?: string; lang: "ar" | "en" }): WhereLink[] {
  const sfx = suffix[o.kind];
  if (!sfx) return [];
  const L = o.lang;
  const place = [o.city?.trim(), countryName[o.country][L]].filter(Boolean).join(" ");
  const what = [core(o.text), sfx[L]].filter(Boolean).join(" ");
  const local = [what, place].filter(Boolean).join(" ");
  const tag = (o.kind === "photo" ? sfx[L] : core(o.text)).replace(/\s+/g, "");
  const links: WhereLink[] = [
    { id: "maps", label: { ar: "محلات قريبة في خرائط Google", en: "Nearby shops on Google Maps" }, url: `https://www.google.com/maps/search/?api=1&query=${q(local)}` },
    { id: "instagram", label: { ar: "حسابات وصور في إنستقرام", en: "Accounts and photos on Instagram" }, url: `https://www.instagram.com/explore/search/keyword/?q=${q(`${tag} ${o.city?.trim() ?? ""}`.trim())}` },
  ];
  if (o.kind !== "photo" && o.kind !== "hosp" && o.kind !== "aqiqah") {
    const m = market[o.country];
    if (m?.noon) links.push({ id: "noon", label: { ar: "ابحثي في نون", en: "Search on noon" }, url: m.noon + q(core(o.text)) });
    if (m?.amazon) links.push({ id: "amazon", label: { ar: "ابحثي في أمازون", en: "Search on Amazon" }, url: m.amazon + q(core(o.text)) });
    const gl = o.country === "other" ? "" : `&gl=${o.country}`;
    links.push({ id: "shopping", label: { ar: "قارني الأسعار في Google", en: "Compare prices on Google" }, url: `https://www.google.com/search?tbm=shop${gl}&q=${q(what)}` });
  }
  links.push({ id: "web", label: { ar: "بحث عام", en: "General search" }, url: `https://www.google.com/search?q=${q(local)}` });
  return links;
}
