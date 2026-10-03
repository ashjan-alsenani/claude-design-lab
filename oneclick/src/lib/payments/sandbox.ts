import { z } from "zod";
import { hmac, safeEqual } from "@/lib/licensing/crypto";
import type { CheckoutSession, PaymentEvent, PaymentProvider } from "./types";

/**
 * SANDBOX payment provider: simulated confirmations for testing the licensing engine.
 * NO REAL MONEY MOVES. It is only created in local demo mode (never in production; see
 * getSandboxProvider) and every order it touches is flagged `sandbox: true`.
 *
 * It still behaves like a real provider: events are signed with a server-side secret
 * and must pass `parseWebhook` verification before any license changes.
 */
const eventSchema = z.object({
  eventId: z.string().min(8).max(100),
  type: z.enum(["payment.succeeded", "payment.pending", "payment.failed", "payment.cancelled", "payment.refunded", "payment.chargeback"]),
  orderId: z.string().regex(/^OC-[A-Z0-9]{6}$/),
  providerReference: z.string().max(100),
  amount: z.object({ amountMinor: z.number().int().nonnegative(), currency: z.enum(["OMR", "USD", "SAR", "AED", "QAR", "KWD", "BHD", "EUR", "GBP"]) }),
  occurredAt: z.string(),
});

export const SANDBOX_SIGNATURE_HEADER = "x-oneclick-sandbox-signature";

export class SandboxProvider implements PaymentProvider {
  readonly id = "sandbox";
  readonly displayName = "SANDBOX: test payments, no real money";
  readonly live = false;
  readonly sandbox = true;
  constructor(private secret: string) {}

  async createCheckout(): Promise<CheckoutSession> {
    // The sandbox has no hosted page; the checkout screen offers labeled simulation buttons.
    return { kind: "unavailable", reason: "provider_not_connected" };
  }

  /** Test helper: what the provider would send. */
  sign(event: Omit<PaymentEvent, "raw">) {
    const body = JSON.stringify(event);
    return { body, headers: new Headers({ [SANDBOX_SIGNATURE_HEADER]: hmac(`sandbox:${this.secret}`, body) }) };
  }

  async parseWebhook(rawBody: string, headers: Headers): Promise<PaymentEvent> {
    const sig = headers.get(SANDBOX_SIGNATURE_HEADER) ?? "";
    if (!sig || !safeEqual(sig, hmac(`sandbox:${this.secret}`, rawBody))) throw new Error("INVALID_SIGNATURE");
    const parsed = eventSchema.parse(JSON.parse(rawBody));
    return { ...parsed, raw: parsed };
  }
}
