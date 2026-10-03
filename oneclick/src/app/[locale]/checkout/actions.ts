"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { products } from "@/content/products";
import { clientKey, rateLimit } from "@/lib/security/rate-limit";
import { randomToken } from "@/lib/licensing/crypto";
import { currentContext, licensing, licensingMode } from "@/lib/licensing/server";

const outcomes = { succeeded: "payment.succeeded", failed: "payment.failed", pending: "payment.pending" } as const;

/**
 * SANDBOX ONLY. Simulates the provider: creates the order server-side (price from the
 * catalog, never from the form), then sends a SIGNED sandbox event through the same
 * verification + engine path a real provider webhook uses.
 */
export async function sandboxPayAction(fd: FormData) {
  const l = String(fd.get("locale") ?? "");
  const locale = isLocale(l) ? l : "en";
  const slug = String(fd.get("slug") ?? "");
  const outcome = String(fd.get("outcome") ?? "") as keyof typeof outcomes;
  const { engine, sandboxProvider } = licensing();
  if (licensingMode() !== "sandbox" || !sandboxProvider || !(outcome in outcomes)) redirect(`/${locale}/checkout/${slug}`);
  if (!rateLimit(`sandbox-pay:${clientKey(await headers())}`, 60, 10 * 60 * 1000).ok) redirect(`/${locale}/checkout/${slug}?e=rate_limited`);
  const product = products.find((p) => p.slug === slug);
  if (!product) redirect(`/${locale}/products`);
  const ctx = await currentContext();
  const order = await engine.createOrder({ productIds: [product.id], purchaseEmail: String(fd.get("email") ?? ""), userId: ctx?.user.id, provider: "sandbox", sandbox: true, locale });
  if (!order.ok) redirect(`/${locale}/checkout/${slug}?e=${order.reason}`);
  const signed = sandboxProvider.sign({
    eventId: `sbx_evt_${randomToken(9)}`,
    type: outcomes[outcome],
    orderId: order.order.id,
    providerReference: `sbx_${randomToken(6)}`,
    amount: { amountMinor: order.order.totalMinor, currency: order.order.currency },
    occurredAt: new Date().toISOString(),
  });
  const event = await sandboxProvider.parseWebhook(signed.body, signed.headers);
  await engine.handlePaymentEvent(sandboxProvider.id, event);
  redirect(`/${locale}/checkout/done?r=${outcome}`);
}
