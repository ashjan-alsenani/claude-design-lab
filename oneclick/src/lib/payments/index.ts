import "server-only";
import type { PaymentProvider } from "./types";

/** Placeholder used until the owner's chosen Oman bank/gateway is integrated. */
class NotConnectedProvider implements PaymentProvider {
  readonly id = "none";
  readonly displayName = "Payment provider not yet connected";
  readonly live = false;
  async createCheckout() {
    return { kind: "unavailable", reason: "provider_not_connected" } as const;
  }
  async parseWebhook(): Promise<never> {
    throw new Error("PAYMENT PROVIDER NOT YET CONNECTED: webhooks are rejected.");
  }
}

const providers: Record<string, () => PaymentProvider> = {
  none: () => new NotConnectedProvider(),
  // "bank-xyz": () => new BankXyzProvider(process.env.PAYMENT_API_KEY!, ...),
};

export function getPaymentProvider(): PaymentProvider {
  const id = process.env.PAYMENT_PROVIDER || "none";
  return (providers[id] ?? providers.none)();
}

export type { PaymentProvider } from "./types";
