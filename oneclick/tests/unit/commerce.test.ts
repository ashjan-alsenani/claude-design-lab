import { describe, expect, it } from "vitest";
import { applyDiscount, canAccess, isEntitlementActive, newReference, type Discount, type Entitlement } from "@/lib/commerce/types";
import { money } from "@/lib/money";

const base: Entitlement = { id: "e1", userId: "u1", productId: "p1", source: "purchase", license: "personal", startsAt: "2026-01-01T00:00:00Z" };
const now = new Date("2026-10-02T00:00:00Z");

describe("entitlements", () => {
  it("lifetime entitlement is active", () => expect(isEntitlementActive(base, now)).toBe(true));
  it("revoked entitlement is not active", () => expect(isEntitlementActive({ ...base, revokedAt: "2026-05-01T00:00:00Z" }, now)).toBe(false));
  it("expired entitlement is not active", () => expect(isEntitlementActive({ ...base, endsAt: "2026-09-01T00:00:00Z" }, now)).toBe(false));
  it("future entitlement is not active yet", () => expect(isEntitlementActive({ ...base, startsAt: "2027-01-01T00:00:00Z" }, now)).toBe(false));
  it("access requires the same user AND product", () => {
    expect(canAccess([base], "u1", "p1", now)).toBe(true);
    expect(canAccess([base], "u2", "p1", now)).toBe(false);
    expect(canAccess([base], "u1", "p2", now)).toBe(false);
  });
});

describe("discounts", () => {
  const d: Discount = { code: "LAUNCH", kind: "percent", value: 20, usedCount: 0, active: true };
  it("applies a percentage", () => expect(applyDiscount(money(15), d, now).total.amountMinor).toBe(12000));
  it("never goes below zero", () => expect(applyDiscount(money(5), { ...d, kind: "fixed", value: 99000 }, now).total.amountMinor).toBe(0));
  it("respects expiry and max uses", () => {
    expect(applyDiscount(money(15), { ...d, expiresAt: "2026-01-01T00:00:00Z" }, now).reason).toBe("expired");
    expect(applyDiscount(money(15), { ...d, maxUses: 3, usedCount: 3 }, now).reason).toBe("used_up");
  });
  it("rejects a fixed discount in another currency", () => {
    expect(applyDiscount(money(15), { ...d, kind: "fixed", value: 100, currency: "USD" }, now).reason).toBe("currency");
  });
});

describe("references", () => {
  it("are prefixed and unambiguous", () => {
    const r = newReference("REQ");
    expect(r).toMatch(/^REQ-[2-9A-HJ-NP-Z]{6}$/);
  });
});
