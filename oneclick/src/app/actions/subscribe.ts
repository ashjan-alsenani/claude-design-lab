"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { DUPLICATE_LEAD, getLeadStore } from "@/lib/data/leads";
import { newReference } from "@/lib/commerce/types";
import { clientKey, rateLimit } from "@/lib/security/rate-limit";
import { isDemoMode } from "@/lib/env";
import { products } from "@/content/products";

/**
 * Newsletter and "notify me" sign-ups. Stored only with explicit consent (the exact consent text
 * and time are kept as proof). Never used for anything but One Click updates; see the privacy policy.
 */
const schema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  consent: z.literal(true),
  consentText: z.string().max(300),
  locale: z.enum(["ar", "en"]),
  productId: z.string().max(40).optional(),
});

export type SubscribeResult = { ok: true } | { ok: false; reason: "invalid" | "rate_limited" | "unavailable" };

export async function subscribe(input: unknown): Promise<SubscribeResult> {
  if (!rateLimit(`subscribe:${clientKey(await headers())}`, isDemoMode() ? 200 : 8, 10 * 60 * 1000).ok) return { ok: false, reason: "rate_limited" };
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, reason: "invalid" };
  const { email, consentText, locale, productId } = parsed.data;
  if (productId && !products.some((p) => p.id === productId)) return { ok: false, reason: "invalid" };
  const kind = productId ? "product_notify" : "newsletter";
  const store = getLeadStore();
  if (store.mode === "unavailable") return { ok: false, reason: "unavailable" };
  try {
    // Signing up twice is harmless and stores nothing new.
    const existing = await store.list(kind);
    if (existing.some((r) => r.data.email === email && (r.data.productId ?? null) === (productId ?? null) && r.status === "subscribed")) return { ok: true };
    await store.save({
      kind,
      reference: newReference(productId ? "NTF" : "NL"),
      createdAt: new Date().toISOString(),
      status: "subscribed",
      data: { email, locale, ...(productId ? { productId } : {}), consentText, consentedAt: new Date().toISOString() },
    });
    return { ok: true };
  } catch (e) {
    // Two sign-ups racing past the check above: the database keeps one, and both people are told yes.
    if ((e as Error).message === DUPLICATE_LEAD) return { ok: true };
    console.error(`[${kind}] save failed`, (e as Error).message);
    return { ok: false, reason: "unavailable" };
  }
}
