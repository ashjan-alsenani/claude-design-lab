import type { Money } from "@/lib/money";

/**
 * Provider-independent payment interface.
 *
 * STATUS: PAYMENT PROVIDER NOT YET CONNECTED. The owner is selecting a bank/payment
 * gateway in Oman. When chosen, implement `PaymentProvider` in
 * src/lib/payments/providers/<name>.ts and register it in ./index.ts. Nothing else in
 * the platform (orders, entitlements, emails, admin) needs to change.
 *
 * Rules:
 * - One Click never collects or stores card data. Customers pay on the provider's
 *   hosted page (redirect) or embedded secure fields.
 * - Orders are fulfilled ONLY from a verified provider webhook, never from the
 *   browser redirect alone.
 */
export type CheckoutRequest = {
  orderId: string;
  amount: Money;
  customerEmail: string;
  description: string;
  successUrl: string;
  cancelUrl: string;
  locale: "ar" | "en";
};

export type CheckoutSession =
  | { kind: "redirect"; url: string; providerReference: string }
  | { kind: "unavailable"; reason: "provider_not_connected" | "provider_error" };

export type PaymentEventType =
  | "payment.succeeded"
  | "payment.pending"
  | "payment.failed"
  | "payment.cancelled"
  | "payment.refunded"
  | "payment.chargeback";

/**
 * A payment confirmation that has ALREADY been verified by the provider adapter
 * (signature checked). Licenses are created or changed only from these events,
 * never from a browser redirect, URL parameter or client request.
 */
export type PaymentEvent = {
  /** Provider's unique event id: used for idempotency (each event is applied once). */
  eventId: string;
  type: PaymentEventType;
  orderId: string;
  providerReference: string;
  amount: Money;
  occurredAt: string;
  raw: unknown; // stored in payment_events for audit
};

export interface PaymentProvider {
  readonly id: string;
  readonly displayName: string;
  readonly live: boolean;
  /** True only for the clearly labeled local SANDBOX (never available in production). */
  readonly sandbox?: boolean;
  createCheckout(req: CheckoutRequest): Promise<CheckoutSession>;
  /** Verify signature and parse a webhook. Must throw on invalid signatures. */
  parseWebhook(rawBody: string, headers: Headers): Promise<PaymentEvent>;
  refund?(providerReference: string, amount?: Money): Promise<void>;
}
