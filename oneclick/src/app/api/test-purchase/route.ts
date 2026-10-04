import { isLocale } from "@/i18n/config";
import { isValidTestPurchaseToken, TEST_COOKIE, testCookieOptions } from "@/lib/licensing/test-purchase";

/**
 * Opens owner test mode in this browser (see src/lib/licensing/test-purchase.ts).
 * GET /api/test-purchase?t=<signed token>&locale=ar  → cookie set, then the products page.
 * GET /api/test-purchase?end=1&locale=ar             → test mode off.
 * An invalid or expired token changes nothing.
 */
export async function GET(req: Request) {
  const u = new URL(req.url);
  const l = u.searchParams.get("locale") ?? "en";
  const locale = isLocale(l) ? l : "en";
  const headers = new Headers({ "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" });
  const cookie = (value: string, maxAge: number) => {
    const o = testCookieOptions;
    headers.append("Set-Cookie", `${TEST_COOKIE}=${value}; Path=${o.path}; Max-Age=${maxAge}; HttpOnly; SameSite=Lax${o.secure ? "; Secure" : ""}`);
  };
  if (u.searchParams.get("end")) {
    cookie("", 0);
    headers.set("Location", `/${locale}`);
    return new Response(null, { status: 303, headers });
  }
  const token = u.searchParams.get("t");
  if (!isValidTestPurchaseToken(token)) {
    headers.set("Location", `/${locale}?test=expired`);
    return new Response(null, { status: 303, headers });
  }
  cookie(encodeURIComponent(token!), testCookieOptions.maxAge);
  headers.set("Location", `/${locale}/products`);
  return new Response(null, { status: 303, headers });
}
