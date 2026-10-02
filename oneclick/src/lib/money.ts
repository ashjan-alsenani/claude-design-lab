import type { Locale } from "@/i18n/config";

/**
 * Money is always stored in minor units (integers) to avoid floating-point errors.
 * OMR, KWD and BHD use 3 decimals (1 OMR = 1000 baisa). SAR/AED/QAR/USD/EUR/GBP use 2.
 * No currency conversion happens in this codebase: each price is entered explicitly
 * per currency by the owner (Admin) or by the future payment provider.
 */
export const currencies = ["OMR", "SAR", "AED", "KWD", "QAR", "BHD", "USD", "EUR", "GBP"] as const;
export type Currency = (typeof currencies)[number];
export const baseCurrency: Currency = "OMR";

export const minorUnitDigits: Record<Currency, number> = {
  OMR: 3,
  KWD: 3,
  BHD: 3,
  SAR: 2,
  AED: 2,
  QAR: 2,
  USD: 2,
  EUR: 2,
  GBP: 2,
};

export type Money = { amountMinor: number; currency: Currency };

export function money(major: number, currency: Currency = baseCurrency): Money {
  return { amountMinor: Math.round(major * 10 ** minorUnitDigits[currency]), currency };
}

export function toMajor(m: Money): number {
  return m.amountMinor / 10 ** minorUnitDigits[m.currency];
}

export function formatMoney(m: Money, locale: Locale): string {
  const digits = minorUnitDigits[m.currency];
  const major = toMajor(m);
  // Show whole numbers without trailing zeros ("15 OMR"), otherwise full precision.
  const whole = Number.isInteger(major);
  return new Intl.NumberFormat(locale === "ar" ? "ar-OM" : "en-OM", {
    style: "currency",
    currency: m.currency,
    currencyDisplay: locale === "ar" ? "symbol" : "code",
    minimumFractionDigits: whole ? 0 : digits,
    maximumFractionDigits: digits,
  }).format(major);
}

export function addMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) throw new Error("Cannot add different currencies");
  return { amountMinor: a.amountMinor + b.amountMinor, currency: a.currency };
}
