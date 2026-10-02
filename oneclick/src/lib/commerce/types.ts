import type { Money } from "@/lib/money";

/**
 * Commerce domain model (mirrors supabase/migrations). Kept provider-independent.
 *
 * Flow: Order(pending) -> provider checkout -> verified webhook -> Order(paid)
 *       -> Purchase rows -> Entitlement rows -> access + emails.
 */
export type OrderStatus = "pending" | "paid" | "failed" | "refunded" | "partially_refunded" | "cancelled";

export type Order = {
  id: string; // public reference, e.g. OC-7K3M9Q
  userId: string;
  status: OrderStatus;
  subtotal: Money;
  discount: Money;
  tax: Money;
  total: Money;
  discountCode?: string;
  attribution?: { utmSource?: string; utmMedium?: string; utmCampaign?: string; referralCode?: string };
  createdAt: string;
  paidAt?: string;
};

export type OrderItem = { orderId: string; productId: string; unitPrice: Money; quantity: number; license: LicenseType };

export type LicenseType = "personal" | "commercial" | "team";

export type Entitlement = {
  id: string;
  userId: string;
  productId: string;
  source: "purchase" | "free" | "gift" | "admin_grant" | "subscription";
  license: LicenseType;
  orderId?: string;
  startsAt: string;
  endsAt?: string; // null = lifetime
  revokedAt?: string;
};

export function isEntitlementActive(e: Entitlement, now = new Date()) {
  if (e.revokedAt) return false;
  if (new Date(e.startsAt) > now) return false;
  if (e.endsAt && new Date(e.endsAt) <= now) return false;
  return true;
}

/** Server-side authorization check for an interactive product or download. */
export function canAccess(entitlements: Entitlement[], userId: string, productId: string, now = new Date()) {
  return entitlements.some((e) => e.userId === userId && e.productId === productId && isEntitlementActive(e, now));
}

export type Discount = {
  code: string;
  kind: "percent" | "fixed";
  value: number; // percent 0-100, or minor units for fixed
  currency?: Money["currency"];
  productIds?: string[];
  startsAt?: string;
  expiresAt?: string;
  maxUses?: number;
  usedCount: number;
  active: boolean;
};

/** Applies a discount to a subtotal. Never returns below zero. */
export function applyDiscount(subtotal: Money, discount: Discount | undefined, now = new Date()): { discount: Money; total: Money; reason?: string } {
  const zero = { amountMinor: 0, currency: subtotal.currency };
  if (!discount) return { discount: zero, total: subtotal };
  if (!discount.active) return { discount: zero, total: subtotal, reason: "inactive" };
  if (discount.startsAt && new Date(discount.startsAt) > now) return { discount: zero, total: subtotal, reason: "not_started" };
  if (discount.expiresAt && new Date(discount.expiresAt) <= now) return { discount: zero, total: subtotal, reason: "expired" };
  if (discount.maxUses !== undefined && discount.usedCount >= discount.maxUses) return { discount: zero, total: subtotal, reason: "used_up" };
  let off = 0;
  if (discount.kind === "percent") off = Math.round((subtotal.amountMinor * Math.min(100, Math.max(0, discount.value))) / 100);
  else {
    if (discount.currency && discount.currency !== subtotal.currency) return { discount: zero, total: subtotal, reason: "currency" };
    off = discount.value;
  }
  off = Math.min(off, subtotal.amountMinor);
  return { discount: { amountMinor: off, currency: subtotal.currency }, total: { amountMinor: subtotal.amountMinor - off, currency: subtotal.currency } };
}

/** Human-friendly unambiguous reference (no 0/O/1/I). */
export function newReference(prefix: string) {
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return `${prefix}-${Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("")}`;
}
