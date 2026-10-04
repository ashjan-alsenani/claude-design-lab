import { describe, expect, it } from "vitest";
import { products } from "@/content/products";
import { createLicensingEngine, type SessionContext } from "@/lib/licensing/engine";
import { MemoryLicensingStore } from "@/lib/licensing/store";
import { defaultSecurity, offersDownloads, opensInteractive } from "@/lib/licensing/policy";
import { SandboxProvider } from "@/lib/payments/sandbox";

/**
 * Runs EVERY product in the catalog, including any added later, through the same ownership rules.
 * A new product needs no new test: it is picked up here automatically.
 */
const SECRET = "test-secret-test-secret-test-secret-123";

function setup() {
  const store = new MemoryLicensingStore();
  const mails: { to: string; text: string; kind: string }[] = [];
  const provider = new SandboxProvider(SECRET);
  const engine = createLicensingEngine({ store, products, secret: SECRET, baseUrl: "https://oneclick.test", mail: async (to, c, m) => void mails.push({ to, text: c.text, kind: m.kind }) });
  const signIn = async (email: string) => {
    const ch = await engine.startVerification({ email, purpose: "signin", locale: "en" });
    if (!ch.ok) throw new Error(ch.reason);
    const code = [...mails].reverse().find((m) => m.to === email && m.kind === "access_code")!.text.match(/\b(\d{6})\b/)![1];
    const r = await engine.completeVerification({ challengeId: ch.challengeId, code, client: { userAgent: "Mozilla/5.0 (Macintosh) Chrome/130" }, locale: "en" });
    if (r.kind !== "signed_in") throw new Error("sign-in failed");
    return (await engine.getSessionContext(r.sessionToken)) as SessionContext;
  };
  const pay = async (email: string, productId: string, userId?: string, type: "payment.succeeded" | "payment.refunded" = "payment.succeeded", orderId?: string) => {
    let order = orderId;
    if (!order) {
      const o = await engine.createOrder({ productIds: [productId], purchaseEmail: email, userId, provider: "sandbox", sandbox: true, locale: "en" });
      if (!o.ok) throw new Error(o.reason);
      order = o.order.id;
    }
    const p = products.find((x) => x.id === productId)!;
    const amountMinor = Math.round((p.price?.amountMinor ?? 0));
    const signed = provider.sign({ eventId: `evt_${order}_${type}`, type, orderId: order, providerReference: "sbx", amount: { amountMinor, currency: p.price!.currency }, occurredAt: new Date().toISOString() });
    await engine.handlePaymentEvent("sandbox", await provider.parseWebhook(signed.body, signed.headers));
    return order;
  };
  return { engine, signIn, pay };
}

describe("every product in the catalog follows the ownership rules", () => {
  it("covers the whole catalog", () => {
    expect(products.length).toBeGreaterThan(10);
  });

  for (const product of products) {
    const s = defaultSecurity(product);
    const purpose = opensInteractive(s.accessType) ? "open" : offersDownloads(s) ? "download" : null;

    it(`${product.slug} (${s.accessType})`, async () => {
      const { engine, signIn, pay } = setup();

      if (s.accessType === "PUBLIC_FREE") {
        // Free products are open to everyone by design, and can't be bought.
        expect((await engine.checkAccess(null, product.id)).allowed).toBe(true);
        return;
      }
      if (s.accessType === "CUSTOM_SERVICE") {
        expect((await engine.checkAccess(null, product.id)).allowed).toBe(false);
        expect((await engine.createOrder({ productIds: [product.id], purchaseEmail: "x@example.com", provider: "sandbox", sandbox: true, locale: "en" })).ok).toBe(false);
        return;
      }
      expect(purpose).not.toBeNull();
      const p = purpose!;

      // Signed out: no access, whatever the URL.
      expect((await engine.checkAccess(null, product.id, p)).allowed).toBe(false);
      // Signed in without buying: no access.
      const stranger = await signIn("stranger@example.com");
      expect((await engine.checkAccess(stranger, product.id, p)).allowed).toBe(false);

      // Guest purchase: nothing opens until the purchase email is verified...
      const order = await pay("buyer@example.com", product.id);
      expect((await engine.checkAccess(stranger, product.id, p)).allowed).toBe(false);
      // ...then the verified buyer has it, and only the buyer.
      const buyer = await signIn("buyer@example.com");
      expect((await engine.checkAccess(buyer, product.id, p)).allowed).toBe(true);
      expect((await engine.checkAccess(stranger, product.id, p)).allowed).toBe(false);

      // Bundles unlock exactly their included products, for the buyer only.
      for (const child of product.includes ?? []) {
        expect((await engine.checkAccess(buyer, child, "open")).allowed).toBe(true);
        expect((await engine.checkAccess(stranger, child, "open")).allowed).toBe(false);
      }
      // Owning this product opens nothing else that is paid.
      const other = products.find((x) => x.id !== product.id && x.price && !(product.includes ?? []).includes(x.id) && opensInteractive(defaultSecurity(x).accessType));
      if (other) expect((await engine.checkAccess(buyer, other.id, "open")).allowed).toBe(false);

      // A refund takes access away again.
      await pay("buyer@example.com", product.id, undefined, "payment.refunded", order);
      expect((await engine.checkAccess(buyer, product.id, p)).allowed).toBe(false);
    });
  }
});
