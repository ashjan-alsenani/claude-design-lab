import { beforeEach, describe, expect, it } from "vitest";
import { products } from "@/content/products";
import { createLicensingEngine, type ClientInfo, type SessionContext } from "@/lib/licensing/engine";
import { MemoryLicensingStore } from "@/lib/licensing/store";
import { maskEmail, normalizeEmail } from "@/lib/licensing/crypto";
import { SandboxProvider } from "@/lib/payments/sandbox";
import type { EmailContent } from "@/lib/email/templates";

type Mail = { to: string; content: EmailContent; kind: string };
const SECRET = "test-secret-test-secret-test-secret-123";
const BRIDE = "prd_bride"; // HYBRID by default, 18 OMR
const GROCERY = "prd_grocery"; // INTERACTIVE_PRIVATE, 4.5 OMR

let store: MemoryLicensingStore;
let mails: Mail[];
let clock: Date;
let engine: ReturnType<typeof createLicensingEngine>;
const provider = new SandboxProvider(SECRET);

const ua = { iphone: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Safari/604.1", mac: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) Chrome/130 Safari/537.36", win: "Mozilla/5.0 (Windows NT 10.0) Chrome/130 Safari/537.36" };

beforeEach(() => {
  store = new MemoryLicensingStore();
  mails = [];
  clock = new Date("2026-10-03T10:00:00Z");
  engine = createLicensingEngine({
    store,
    products,
    secret: SECRET,
    baseUrl: "https://oneclick.test",
    mail: async (to, content, meta) => void mails.push({ to, content, kind: meta.kind }),
    adminEmails: ["owner@example.com"],
    ownerEmails: ["Boss@Example.com"],
    now: () => clock,
  });
});

const lastCode = (to: string) => {
  const m = [...mails].reverse().find((x) => x.to === normalizeEmail(to) && x.kind === "access_code");
  return m!.content.text.match(/(\d{3}) (\d{3})/)!.slice(1).join("");
};
const claimToken = (to: string) => {
  const m = [...mails].reverse().find((x) => x.to === to && x.kind === "claim_product");
  return m ? new URL(m.content.text.match(/https:\/\/\S+/)![0]).searchParams.get("t")! : null;
};

async function signIn(email: string, client: ClientInfo = { userAgent: ua.iphone }) {
  const ch = await engine.startVerification({ email, purpose: "signin", locale: "en" });
  if (!ch.ok) throw new Error(ch.reason);
  const r = await engine.completeVerification({ challengeId: ch.challengeId, code: lastCode(email), client, locale: "en" });
  if (r.kind !== "signed_in") throw new Error("sign-in failed: " + JSON.stringify(r));
  const ctx = (await engine.getSessionContext(r.sessionToken)) as SessionContext;
  return { ...r, ctx };
}

async function pay(email: string, productIds: string[], opts: { userId?: string; amountDelta?: number; type?: "payment.succeeded" | "payment.failed" | "payment.pending" } = {}) {
  const o = await engine.createOrder({ productIds, purchaseEmail: email, userId: opts.userId, provider: "sandbox", sandbox: true, locale: "en" });
  if (!o.ok) throw new Error(o.reason);
  const ev = { eventId: `evt_${o.order.id}_${opts.type ?? "ok"}`, type: opts.type ?? ("payment.succeeded" as const), orderId: o.order.id, providerReference: "sbx_1", amount: { amountMinor: o.order.totalMinor + (opts.amountDelta ?? 0), currency: o.order.currency }, occurredAt: clock.toISOString() };
  const signed = provider.sign(ev);
  const verified = await provider.parseWebhook(signed.body, signed.headers);
  const r = await engine.handlePaymentEvent("sandbox", verified);
  return { order: o.order, outcome: r.outcome, event: verified };
}

describe("purchase -> license -> access", () => {
  it("authorized access: signed-in buyer opens the product", async () => {
    const a = await signIn("sara@example.com");
    const { outcome } = await pay("sara@example.com", [GROCERY], { userId: a.userId });
    expect(outcome).toBe("licenses_activated");
    const d = await engine.checkAccess(a.ctx, GROCERY);
    expect(d.allowed).toBe(true);
    expect(mails.some((m) => m.kind === "products_ready" && m.to === "sara@example.com")).toBe(true);
    const mine = await engine.myProducts(a.userId);
    expect(mine.map((x) => x.product.id)).toEqual([GROCERY]);
  });

  it("unauthorized product: a license for one product never opens another", async () => {
    const a = await signIn("sara@example.com");
    await pay("sara@example.com", [GROCERY], { userId: a.userId });
    const d = await engine.checkAccess(a.ctx, BRIDE);
    expect(d).toMatchObject({ allowed: false, reason: "no_license" });
  });

  it("shared URL: another account opening the same product URL is denied", async () => {
    const a = await signIn("sara@example.com");
    await pay("sara@example.com", [BRIDE], { userId: a.userId });
    const b = await signIn("friend@example.com", { userAgent: ua.mac });
    expect((await engine.checkAccess(b.ctx, BRIDE)).allowed).toBe(false);
    expect((await engine.checkAccess(null, BRIDE)).reason).toBe("not_signed_in");
  });

  it("guest purchase: pending claim, then verification of the purchase email binds it", async () => {
    await pay("Guest@Example.com ", [BRIDE]);
    const lic = (await store.read((db) => db.licenses))[0];
    expect(lic).toMatchObject({ userId: null, status: "active", purchaseEmail: "guest@example.com" });
    const token = claimToken("guest@example.com")!;
    expect(token).toBeTruthy();
    const claim = await engine.getClaim(token);
    expect(claim).toMatchObject({ status: "ok", maskedEmail: maskEmail("guest@example.com") });
    const started = await engine.startClaim(token, "en");
    if (!started.ok) throw new Error("claim failed");
    const done = await engine.completeVerification({ challengeId: started.challengeId, code: lastCode("guest@example.com"), client: { userAgent: ua.iphone }, locale: "en" });
    expect(done.kind).toBe("signed_in");
    const ctx = await engine.getSessionContext((done as { sessionToken: string }).sessionToken);
    expect((await engine.checkAccess(ctx, BRIDE)).allowed).toBe(true);
  });

  it("forwarded purchase link: the holder cannot take ownership", async () => {
    await pay("owner1@example.com", [BRIDE]);
    const token = claimToken("owner1@example.com")!;
    // A friend receives the forwarded email and opens the link.
    const started = await engine.startClaim(token, "en");
    if (!started.ok) throw new Error("claim failed");
    // The code went to the purchase email, not to the friend.
    expect(mails.filter((m) => m.kind === "access_code").every((m) => m.to === "owner1@example.com")).toBe(true);
    // Guessing fails and locks the challenge.
    for (let i = 0; i < 5; i++) await engine.completeVerification({ challengeId: started.challengeId, code: "000000", client: {}, locale: "en" });
    const real = lastCode("owner1@example.com");
    const after = await engine.completeVerification({ challengeId: started.challengeId, code: real, client: {}, locale: "en" });
    expect(after).toMatchObject({ kind: "failed", reason: "too_many_attempts" });
    // A friend signed in with their own account still has nothing.
    const friend = await signIn("friend@example.com");
    expect((await engine.checkAccess(friend.ctx, BRIDE)).allowed).toBe(false);
    expect((await store.read((db) => db.licenses)).every((l) => l.userId === null)).toBe(true);
  });

  it("revoked license is denied; refund policy revokes automatically", async () => {
    const a = await signIn("sara@example.com");
    const { order } = await pay("sara@example.com", [GROCERY], { userId: a.userId });
    const ev = { eventId: "evt_refund_1", type: "payment.refunded" as const, orderId: order.id, providerReference: "sbx_1", amount: { amountMinor: order.totalMinor, currency: order.currency }, occurredAt: clock.toISOString(), raw: {} };
    expect((await engine.handlePaymentEvent("sandbox", ev)).outcome).toBe("licenses_revoked");
    expect(await engine.checkAccess(a.ctx, GROCERY)).toMatchObject({ allowed: false, reason: "license_revoked" });
  });

  it("admin suspend / reactivate / revoke are audited and enforced", async () => {
    const admin = await signIn("owner@example.com", { userAgent: ua.win });
    const a = await signIn("sara@example.com");
    await pay("sara@example.com", [GROCERY], { userId: a.userId });
    const lic = (await store.read((db) => db.licenses))[0];
    expect((await engine.adminLicenseAction(admin.ctx, lic.id, "suspend", "x")).ok).toBe(false); // reason required
    await engine.adminLicenseAction(admin.ctx, lic.id, "suspend", "chargeback review");
    expect((await engine.checkAccess(a.ctx, GROCERY)).reason).toBe("license_suspended");
    await engine.adminLicenseAction(admin.ctx, lic.id, "reactivate", "resolved");
    expect((await engine.checkAccess(a.ctx, GROCERY)).allowed).toBe(true);
    await engine.adminLicenseAction(admin.ctx, lic.id, "revoke", "abuse");
    expect((await engine.checkAccess(a.ctx, GROCERY)).reason).toBe("license_revoked");
    const auditActions = (await store.read((db) => db.audit)).map((x) => x.action);
    expect(auditActions).toEqual(expect.arrayContaining(["license_suspend", "license_reactivate", "license_revoke"]));
    await expect(engine.adminLicenseAction(a.ctx, lic.id, "reactivate", "self-help")).rejects.toThrow("FORBIDDEN");
  });

  it("bundle unlocks its included products; bundle refund revokes them", async () => {
    const a = await signIn("sara@example.com");
    const { order } = await pay("sara@example.com", ["prd_bundle"], { userId: a.userId });
    for (const id of ["prd_planner", "prd_grocery", "prd_budget"]) expect((await engine.checkAccess(a.ctx, id)).allowed).toBe(true);
    expect((await engine.myProducts(a.userId)).map((x) => x.product.id).sort()).toEqual(["prd_budget", "prd_grocery", "prd_planner"]);
    await engine.handlePaymentEvent("sandbox", { eventId: "evt_cb", type: "payment.chargeback", orderId: order.id, providerReference: "x", amount: { amountMinor: order.totalMinor, currency: order.currency }, occurredAt: "", raw: {} });
    expect((await engine.checkAccess(a.ctx, "prd_grocery")).reason).toBe("license_suspended");
  });

  it("expired licenses are denied after the configured duration", async () => {
    const admin = await signIn("owner@example.com", { userAgent: ua.win });
    await engine.adminUpdateProductSecurity(admin.ctx, GROCERY, { licenseDurationDays: 7 });
    const a = await signIn("sara@example.com");
    await pay("sara@example.com", [GROCERY], { userId: a.userId });
    expect((await engine.checkAccess(a.ctx, GROCERY)).allowed).toBe(true);
    clock = new Date(clock.getTime() + 8 * 24 * 3600 * 1000);
    expect((await engine.checkAccess(a.ctx, GROCERY)).reason).toBe("license_expired");
  });
});

describe("site owner", () => {
  it("the owner email opens every product without buying, and gets the admin role", async () => {
    const o = await signIn("boss@example.com");
    expect(o.ctx.roles).toEqual(expect.arrayContaining(["owner", "admin"]));
    expect(await engine.checkAccess(o.ctx, BRIDE)).toMatchObject({ allowed: true, reason: "owner" });
    expect(await engine.checkAccess(o.ctx, GROCERY)).toMatchObject({ allowed: true, reason: "owner" });
    // Owner rights cover opening, not unlicensed downloads.
    expect((await engine.checkAccess(o.ctx, BRIDE, "download")).allowed).toBe(false);
  });

  it("nobody else becomes owner: admins and customers still need a license", async () => {
    const admin = await signIn("owner@example.com");
    expect(admin.ctx.roles).not.toContain("owner");
    expect(await engine.checkAccess(admin.ctx, GROCERY)).toMatchObject({ allowed: false, reason: "no_license" });
    const c = await signIn("boss.example@example.com", { userAgent: ua.mac });
    expect(await engine.checkAccess(c.ctx, GROCERY)).toMatchObject({ allowed: false, reason: "no_license" });
  });
});

describe("invalid payments create no active entitlement", () => {
  it("failed payment", async () => {
    const { outcome } = await pay("sara@example.com", [GROCERY], { type: "payment.failed" });
    expect(outcome).toBe("no_access");
    expect(await store.read((db) => db.licenses.filter((l) => l.status === "active").length)).toBe(0);
  });
  it("pending payment creates pending (non-opening) licenses, then activates on success", async () => {
    const a = await signIn("sara@example.com");
    const { order } = await pay("sara@example.com", [GROCERY], { userId: a.userId, type: "payment.pending" });
    expect((await engine.checkAccess(a.ctx, GROCERY)).reason).toBe("license_pending");
    await engine.handlePaymentEvent("sandbox", { eventId: "evt_ok_later", type: "payment.succeeded", orderId: order.id, providerReference: "x", amount: { amountMinor: order.totalMinor, currency: order.currency }, occurredAt: "", raw: {} });
    expect((await engine.checkAccess(a.ctx, GROCERY)).allowed).toBe(true);
  });
  it("wrong amount, unknown order, wrong provider, duplicate event", async () => {
    expect((await pay("sara@example.com", [GROCERY], { amountDelta: -1000 })).outcome).toBe("amount_mismatch");
    const o = await engine.createOrder({ productIds: [GROCERY], purchaseEmail: "sara@example.com", provider: "sandbox", sandbox: true, locale: "en" });
    if (!o.ok) throw new Error();
    const ev = { eventId: "evt_dupe_1", type: "payment.succeeded" as const, orderId: o.order.id, providerReference: "x", amount: { amountMinor: o.order.totalMinor, currency: o.order.currency }, occurredAt: "", raw: {} };
    expect((await engine.handlePaymentEvent("other", ev)).outcome).toBe("provider_mismatch");
    expect((await engine.handlePaymentEvent("sandbox", { ...ev, eventId: "evt_x", orderId: "OC-ZZZZZZ" })).outcome).toBe("unknown_order");
    expect((await engine.handlePaymentEvent("sandbox", ev)).outcome).toBe("licenses_activated");
    expect((await engine.handlePaymentEvent("sandbox", ev)).outcome).toBe("duplicate");
    expect(await store.read((db) => db.licenses.filter((l) => l.status === "active").length)).toBe(1);
  });
  it("forged or tampered sandbox events are rejected before the engine", async () => {
    const signed = provider.sign({ eventId: "evt_forge", type: "payment.succeeded", orderId: "OC-ABCDEF", providerReference: "x", amount: { amountMinor: 1, currency: "OMR" }, occurredAt: "" });
    await expect(provider.parseWebhook(signed.body.replace('"amountMinor":1', '"amountMinor":2'), signed.headers)).rejects.toThrow("INVALID_SIGNATURE");
    await expect(new SandboxProvider("other-secret").parseWebhook(signed.body, signed.headers)).rejects.toThrow("INVALID_SIGNATURE");
  });
  it("free and custom products cannot be ordered", async () => {
    expect((await engine.createOrder({ productIds: ["prd_reset"], purchaseEmail: "a@b.co", provider: "sandbox", sandbox: true, locale: "en" })).ok).toBe(false);
  });
});

describe("devices and sessions", () => {
  it("existing trusted device: password sign-in needs no code", async () => {
    const first = await signIn("sara@example.com");
    expect((await engine.setPassword(first.ctx, { next: "correct horse battery" })).ok).toBe(true);
    const sent = mails.filter((m) => m.kind === "access_code").length;
    const r = await engine.passwordSignIn({ email: "sara@example.com", password: "correct horse battery", client: { userAgent: ua.iphone, deviceToken: first.deviceToken }, locale: "en" });
    expect(r.ok).toBe(true);
    expect(mails.filter((m) => m.kind === "access_code").length).toBe(sent);
  });

  it("new device triggers verification, then the device-limit flow", async () => {
    const one = await signIn("sara@example.com", { userAgent: ua.iphone });
    await engine.setPassword(one.ctx, { next: "correct horse battery" });
    await pay("sara@example.com", [GROCERY], { userId: one.userId });
    await signIn("sara@example.com", { userAgent: ua.mac }); // 2nd device: trusted (limit 2), alert email sent
    expect(mails.some((m) => m.kind === "new_device")).toBe(true);

    // 3rd device with the right password: must verify by email first.
    const pw = await engine.passwordSignIn({ email: "sara@example.com", password: "correct horse battery", client: { userAgent: ua.win }, locale: "en" });
    expect(pw).toMatchObject({ ok: false, reason: "device_verification_required" });
    const challengeId = (pw as { challengeId: string }).challengeId;
    const done = await engine.completeVerification({ challengeId, code: lastCode("sara@example.com"), client: { userAgent: ua.win }, locale: "en" });
    expect(done).toMatchObject({ kind: "signed_in", deviceState: "pending" });
    const ctx3 = (await engine.getSessionContext((done as { sessionToken: string }).sessionToken))!;
    expect((await engine.checkAccess(ctx3, GROCERY)).reason).toBe("device_not_authorized");

    // Show devices -> remove an old one -> authorize.
    const { devices } = await engine.myDevices(one.userId);
    expect(devices).toHaveLength(2);
    expect(await engine.authorizePendingDevice(ctx3, null)).toMatchObject({ ok: false, reason: "choose_device" });
    expect((await engine.authorizePendingDevice(ctx3, devices[0].id)).ok).toBe(true);
    const ctx3b = (await engine.getSessionContext((done as { sessionToken: string }).sessionToken))!;
    expect((await engine.checkAccess(ctx3b, GROCERY)).allowed).toBe(true);
    // The removed device's session no longer works.
    expect(await engine.getSessionContext(one.sessionToken)).toBeNull();
  });

  it("per-product device limit", async () => {
    const admin = await signIn("owner@example.com", { userAgent: ua.win });
    await engine.adminUpdateProductSecurity(admin.ctx, GROCERY, { deviceLimit: 1 });
    const a = await signIn("sara@example.com", { userAgent: ua.iphone });
    await pay("sara@example.com", [GROCERY], { userId: a.userId });
    expect((await engine.checkAccess(a.ctx, GROCERY)).allowed).toBe(true);
    const b = await signIn("sara@example.com", { userAgent: ua.mac });
    expect((await engine.checkAccess(b.ctx, GROCERY)).reason).toBe("device_limit");
  });

  it("concurrent use is detected and logged, not blocked", async () => {
    const a = await signIn("sara@example.com", { userAgent: ua.iphone });
    const b = await signIn("sara@example.com", { userAgent: ua.mac });
    await pay("sara@example.com", [GROCERY], { userId: a.userId });
    expect((await engine.checkAccess(a.ctx, GROCERY)).allowed).toBe(true);
    expect((await engine.checkAccess(b.ctx, GROCERY)).allowed).toBe(true);
    expect(await store.read((db) => db.accessLogs.some((l) => l.event === "concurrent_use"))).toBe(true);
  });

  it("sign out everywhere and suspended accounts end sessions", async () => {
    const a = await signIn("sara@example.com", { userAgent: ua.iphone });
    const b = await signIn("sara@example.com", { userAgent: ua.mac });
    await engine.signOutEverywhere(a.ctx, true);
    expect(await engine.getSessionContext(a.sessionToken)).not.toBeNull();
    expect(await engine.getSessionContext(b.sessionToken)).toBeNull();
    const admin = await signIn("owner@example.com", { userAgent: ua.win });
    await engine.adminUserAction(admin.ctx, a.userId, { kind: "set_status", status: "suspended" }, "fraud check");
    expect(await engine.getSessionContext(a.sessionToken)).toBeNull();
  });
});

describe("verification codes", () => {
  it("are stored hashed, single-use, expiring and rate-limited", async () => {
    const ch = await engine.startVerification({ email: "sara@example.com", purpose: "signin", locale: "en" });
    if (!ch.ok) throw new Error();
    const code = lastCode("sara@example.com");
    const raw = JSON.stringify(store.snapshot());
    expect(raw).not.toContain(code);
    expect(mails.at(-1)!.content.subject).not.toContain(code);
    const ok = await engine.completeVerification({ challengeId: ch.challengeId, code, client: {}, locale: "en" });
    expect(ok.kind).toBe("signed_in");
    expect(await engine.completeVerification({ challengeId: ch.challengeId, code, client: {}, locale: "en" })).toMatchObject({ kind: "failed", reason: "used" });

    const ch2 = await engine.startVerification({ email: "sara@example.com", purpose: "signin", locale: "en" });
    if (!ch2.ok) throw new Error();
    clock = new Date(clock.getTime() + 11 * 60 * 1000);
    expect(await engine.completeVerification({ challengeId: ch2.challengeId, code: lastCode("sara@example.com"), client: {}, locale: "en" })).toMatchObject({ kind: "failed", reason: "expired" });

    for (let i = 0; i < 3; i++) await engine.startVerification({ email: "sara@example.com", purpose: "signin", locale: "en" });
    expect(await engine.startVerification({ email: "sara@example.com", purpose: "signin", locale: "en" })).toMatchObject({ ok: false, reason: "rate_limited" });
  });

  it("a newer code replaces the older one; Arabic-Indic digits are accepted", async () => {
    const a = await engine.startVerification({ email: "sara@example.com", purpose: "signin", locale: "ar" });
    const oldCode = lastCode("sara@example.com");
    const b = await engine.startVerification({ email: "sara@example.com", purpose: "signin", locale: "ar" });
    if (!a.ok || !b.ok) throw new Error();
    expect((await engine.completeVerification({ challengeId: a.challengeId, code: oldCode, client: {}, locale: "ar" })).kind).toBe("failed");
    const arabic = lastCode("sara@example.com").replace(/\d/g, (d) => String.fromCharCode(0x660 + Number(d)));
    expect((await engine.completeVerification({ challengeId: b.challengeId, code: arabic, client: {}, locale: "ar" })).kind).toBe("signed_in");
  });

  it("logs never contain codes, tokens or passwords", async () => {
    const a = await signIn("sara@example.com");
    await engine.setPassword(a.ctx, { next: "correct horse battery" });
    const logs = JSON.stringify(await store.read((db) => [db.accessLogs, db.audit]));
    expect(logs).not.toMatch(/correct horse|[A-Za-z0-9_-]{40,}/);
  });

  it("email change is verified, audited and keeps the original purchase email", async () => {
    const a = await signIn("sara@example.com");
    await pay("sara@example.com", [GROCERY], { userId: a.userId });
    const req = await engine.requestEmailChange(a.ctx, "Sara.New@Example.com", "en");
    if (!req.ok) throw new Error();
    const done = await engine.completeVerification({ challengeId: req.challengeId, code: lastCode("sara.new@example.com"), client: {}, locale: "en", sessionToken: a.sessionToken });
    expect(done).toMatchObject({ kind: "email_changed", email: "sara.new@example.com" });
    const lic = (await store.read((db) => db.licenses))[0];
    expect(lic.purchaseEmail).toBe("sara@example.com");
    expect((await engine.checkAccess(a.ctx, GROCERY)).allowed).toBe(true);
    expect(mails.some((m) => m.kind === "email_changed" && m.to === "sara@example.com")).toBe(true);
  });
});

describe("downloads", () => {
  it("signed links are bound to the session, expire, and re-check the license", async () => {
    const a = await signIn("sara@example.com");
    await pay("sara@example.com", [BRIDE], { userId: a.userId });
    const link = await engine.createDownloadLink(a.ctx, BRIDE, "printable");
    if (!link.ok) throw new Error(link.reason);
    const token = link.url.split("/").pop()!;
    expect((await engine.redeemDownload(a.ctx, token)).ok).toBe(true);
    const other = await signIn("friend@example.com", { userAgent: ua.mac });
    expect(await engine.redeemDownload(other.ctx, token)).toMatchObject({ ok: false, reason: "not_your_link" });
    expect(await engine.redeemDownload(null, token)).toMatchObject({ ok: false, reason: "not_your_link" });
    expect(await engine.redeemDownload(a.ctx, token.slice(0, -2) + "xx")).toMatchObject({ ok: false, reason: "link_expired" });
    clock = new Date(clock.getTime() + 10 * 60 * 1000);
    expect(await engine.redeemDownload(a.ctx, token)).toMatchObject({ ok: false, reason: "link_expired" });
    expect((await engine.createDownloadLink(a.ctx, GROCERY, "printable")).ok).toBe(false); // interactive-only product
  });
});
