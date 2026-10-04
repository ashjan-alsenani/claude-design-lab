/**
 * Customer profile: what we ask on first sign-in and what the account pages show.
 * Shared by server (validation) and client (the avatar picker), so no server-only imports.
 */

/** Default avatars are the person's initials on one of these brand colors. */
export const AVATAR_COLORS = ["teal", "coral", "sunshine", "lilac", "rose", "sky"] as const;
export type AvatarColor = (typeof AVATAR_COLORS)[number];
export const AVATAR_COLOR_VALUES: Record<AvatarColor, { bg: string; fg: string }> = {
  teal: { bg: "#0e7c71", fg: "#ffffff" },
  coral: { bg: "#e4664f", fg: "#ffffff" },
  sunshine: { bg: "#f4b740", fg: "#3a2a05" },
  lilac: { bg: "#8b6fd6", fg: "#ffffff" },
  rose: { bg: "#d9577e", fg: "#ffffff" },
  sky: { bg: "#3b8fd9", fg: "#ffffff" },
};

export type Avatar = { kind: "initials"; color: AvatarColor } | { kind: "photo"; v: number };

/** Uploaded photos: the browser resizes to a small square first; the server re-checks everything. */
export const AVATAR_MAX_BYTES = 400 * 1024;
export const AVATAR_SIZE = 256;
export const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

/** Gulf first (most customers), then other Arab countries, then the rest. ISO 3166-1 alpha-2. */
export const COUNTRIES = ["OM", "AE", "SA", "QA", "KW", "BH", "EG", "JO", "LB", "IQ", "YE", "MA", "TN", "DZ", "SD", "PS", "SY", "LY", "GB", "US", "OTHER"] as const;
export type Country = (typeof COUNTRIES)[number];

export type ProfileInput = { name: string; country: string; phone?: string; locale: "en" | "ar"; marketingOptIn: boolean; avatarColor?: string };
export type ProfileError = "name" | "country" | "phone" | "avatar";

const toLatinDigits = (s: string) => s.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x660)).replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x6f0));

export function cleanName(raw: string) {
  return raw.normalize("NFC").replace(/[\u0000-\u001f\u007f<>]/g, "").replace(/\s+/g, " ").trim();
}

/** Optional. Stored as digits with an optional leading +, e.g. +96891234567. */
export function cleanPhone(raw: string | undefined) {
  const s = toLatinDigits(raw ?? "").replace(/[\s()-]/g, "");
  return s === "" ? "" : /^\+?[0-9]{7,15}$/.test(s) ? s : null;
}

export function validateProfile(input: ProfileInput): { ok: true; value: { name: string; country: Country; phone?: string; locale: "en" | "ar"; marketingOptIn: boolean; avatarColor?: AvatarColor } } | { ok: false; error: ProfileError } {
  const name = cleanName(input.name);
  if (name.length < 2 || name.length > 60) return { ok: false, error: "name" };
  if (!(COUNTRIES as readonly string[]).includes(input.country)) return { ok: false, error: "country" };
  const phone = cleanPhone(input.phone);
  if (phone === null) return { ok: false, error: "phone" };
  if (input.avatarColor !== undefined && !(AVATAR_COLORS as readonly string[]).includes(input.avatarColor)) return { ok: false, error: "avatar" };
  return {
    ok: true,
    value: { name, country: input.country as Country, phone: phone || undefined, locale: input.locale === "ar" ? "ar" : "en", marketingOptIn: Boolean(input.marketingOptIn), avatarColor: input.avatarColor as AvatarColor | undefined },
  };
}

/**
 * Latin names: first letters of the first and last words ("Sara Al Hinai" → "SH").
 * Arabic names: one letter ("سارة الهنائي" → "س"), because Arabic letters join and "ال" would give "سا".
 */
export function initials(name: string | undefined, email: string) {
  const words = cleanName(name ?? "").split(" ").filter(Boolean);
  if (!words.length) return (email[0] ?? "?").toUpperCase();
  const pick = (w: string) => Array.from(w)[0] ?? "";
  if (/[\u0600-\u06ff]/.test(words[0])) return pick(words[0]);
  return (pick(words[0]) + (words.length > 1 ? pick(words[words.length - 1]) : "")).toUpperCase();
}

/** A stable default color per account, so a new person never starts with a blank circle. */
export function defaultAvatarColor(seed: string): AvatarColor {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

/** Checks the first bytes so a renamed file of another type is refused, whatever its claimed type. */
export function sniffImage(b: Uint8Array): (typeof AVATAR_TYPES)[number] | null {
  if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b.length > 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 && b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a) return "image/png";
  if (b.length > 12 && String.fromCharCode(...b.slice(0, 4)) === "RIFF" && String.fromCharCode(...b.slice(8, 12)) === "WEBP") return "image/webp";
  return null;
}
