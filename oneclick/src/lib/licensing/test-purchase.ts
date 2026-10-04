import "server-only";
import { cookies } from "next/headers";
import { SandboxProvider } from "@/lib/payments/sandbox";
import { signPayload, verifySignedPayload } from "./crypto";
import { licensing, licensingMode, licensingSecret } from "./server";

/**
 * OWNER TEST PURCHASES on the live site, before a payment provider is connected.
 *
 * An admin creates a signed link that is valid for 2 hours. Opening it in any browser (for
 * example a private window, signed out, like a real visitor) turns on test mode for that browser
 * only. In test mode the checkout shows "simulate payment" instead of real payment. Everything
 * after that is real: order, license, email, code, account and product. Test orders are marked
 * SANDBOX everywhere (emails, admin), no money moves, and an admin can revoke them.
 *
 * Without a valid link nothing changes: the checkout stays "payment not connected".
 */
export const TEST_COOKIE = "oc_test_purchase";
const HOURS = 2;

export function createTestPurchaseToken(adminUserId: string) {
  return signPayload(licensingSecret(), { k: "test_purchase", by: adminUserId, exp: Date.now() + HOURS * 3600 * 1000 });
}

export function isValidTestPurchaseToken(token: string | undefined | null) {
  if (!token || licensingMode() !== "database") return false;
  const p = verifySignedPayload<{ k: string; exp: number }>(licensingSecret(), token);
  return !!p && p.k === "test_purchase" && p.exp > Date.now();
}

/** True when this browser opened a valid owner test link (or the local sandbox is running). */
export async function testPurchasesEnabled() {
  if (licensingMode() === "sandbox") return true;
  return isValidTestPurchaseToken((await cookies()).get(TEST_COOKIE)?.value);
}

/** The simulated payment provider: the local sandbox one, or a fresh one for owner test mode. */
export function testPaymentProvider() {
  return licensing().sandboxProvider ?? new SandboxProvider(licensingSecret());
}

export const testCookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge: HOURS * 3600 };
