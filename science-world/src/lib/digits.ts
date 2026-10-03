const AR = '٠١٢٣٤٥٦٧٨٩';

/** 123.5 → "١٢٣,٥" (the book writes Arabic-Indic digits with a decimal comma). */
export function toArabicDigits(v: number | string): string {
  return String(v)
    .replace(/\d/g, (d) => AR[Number(d)])
    .replace(/\./g, ',');
}

/** Normalise a typed or authored number so "٠,٥", "0.50" and ".5" compare equal. */
export function normalizeNumber(raw: string): string {
  let s = raw
    .trim()
    .replace(/[٠-٩]/g, (d) => String(AR.indexOf(d)))
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٫,،]/g, '.')
    .replace(/[\s ٬']/g, '')
    .replace(/[−–]/g, '-');
  if (s === '' || s === '-' || s === '.') return s;
  const n = Number(s);
  if (Number.isFinite(n)) s = String(n);
  return s;
}

export function sameNumber(a: string, b: string): boolean {
  return normalizeNumber(a) === normalizeNumber(b);
}

/**
 * The book groups thousands with a space (٥٤ ٧٥٤). In right-to-left text a plain space lets the
 * groups swap places (٧٥٤ ٥٤). A no-break space keeps the number in one piece and in order.
 */
export function keepNumberGroups(text: string): string {
  return text.replace(/(^|[^٠-٩])([٠-٩]{1,3}(?: [٠-٩]{3})+)(?![٠-٩])/g, (_m, pre: string, num: string) => pre + num.replace(/ /g, '\u00A0'));
}
