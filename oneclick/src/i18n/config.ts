// Locale registry. Adding a language = add it here + a dictionary file + content strings.
export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const localeMeta: Record<Locale, { dir: "ltr" | "rtl"; label: string; htmlLang: string; ogLocale: string }> = {
  en: { dir: "ltr", label: "English", htmlLang: "en", ogLocale: "en_US" },
  ar: { dir: "rtl", label: "العربية", htmlLang: "ar", ogLocale: "ar_OM" },
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

/** A string that exists in every supported language. */
export type Localized = Record<Locale, string>;

/** Read a localized value, falling back to the default locale. */
export function tr(value: Localized | undefined, locale: Locale): string {
  if (!value) return "";
  return value[locale] || value[defaultLocale];
}

export function otherLocale(locale: Locale): Locale {
  return locale === "ar" ? "en" : "ar";
}

/** Plural-aware string: forms keyed by Intl.PluralRules category ("{n}" is replaced). */
export function plural(locale: Locale, n: number, forms: Record<string, string>) {
  const cat = new Intl.PluralRules(locale).select(n);
  const form = forms[cat] ?? forms.other ?? "";
  return form.replace("{n}", num(n, locale));
}

/** Locale digits: Arabic UI uses Arabic-Indic digits consistently (see BRAND_GUIDELINES.md). */
export function num(n: number, locale: Locale, opts?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat(locale === "ar" ? "ar-OM" : "en", opts).format(n);
}
