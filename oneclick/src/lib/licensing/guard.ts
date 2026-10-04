import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { currentContext, licensing } from "./server";
import { productData } from "./product-data";
import type { SessionContext } from "./engine";
import type { AccessDecision } from "./types";

/**
 * THE way into any paid product, current or future. Every page or layout under
 * /[locale]/app/** calls openProduct(); every server action that reads or saves a customer's
 * product data calls productDataFor(). Both run the licensing engine on the server
 * (signed-in session → verified account → active license for THIS product → trusted device).
 * A repository test fails the build if a product route or a product-data access skips them.
 */

type Allowed = Extract<AccessDecision, { allowed: true }>;
type Denied = Extract<AccessDecision, { allowed: false }>;
export type ProductAccess = { allowed: true; ctx: SessionContext | null; decision: Allowed } | { allowed: false; decision: Denied };

// Once per request: a layout and its page may both ask (Next.js renders them in parallel, so each
// must check for itself), but the decision is made, and the access logged, only once.
const decide = cache(async (productId: string) => {
  const ctx = await currentContext();
  return { ctx, decision: await licensing().engine.checkAccess(ctx, productId, "open") };
});

/** For product pages/layouts. Signed out → sign in and come back here. Otherwise the decision (render AccessDenied when not allowed). */
export async function openProduct(locale: Locale, productId: string, here: string): Promise<ProductAccess> {
  const { ctx, decision } = await decide(productId);
  if (decision.allowed) return { allowed: true, ctx, decision };
  if (decision.reason === "not_signed_in" || decision.reason === "session_invalid") redirect(`/${locale}/account?next=${encodeURIComponent(here)}`);
  return { allowed: false, decision };
}

/**
 * The signed-in customer's private data for one product, available only after the same check.
 * Returns null when there is no session or no right to open the product.
 */
export async function productDataFor(productId: string) {
  const ctx = await currentContext();
  if (!ctx) return null;
  const decision = await licensing().engine.canUserAccessProduct(ctx.user.id, productId, { sessionId: ctx.session.id, deviceId: ctx.session.deviceId, purpose: "open" });
  if (!decision.allowed) return null;
  const store = productData();
  const userId = ctx.user.id;
  return {
    ctx,
    get: <T>() => store.get<T>(userId, productId),
    put: <T>(data: T, version: number) => store.put<T>(userId, productId, data, version),
  };
}
