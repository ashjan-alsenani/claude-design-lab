import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
// @ts-expect-error plain .mjs build script without type declarations
import { checkEnv, checkResendKey } from "../../scripts/check-production-env.mjs";
import { opsAlert, resetOpsAlertThrottle } from "@/lib/ops/alert";
import { sendEmail } from "@/lib/email";

const good = {
  EMAIL_PROVIDER: "resend",
  RESEND_API_KEY: "re_live_example",
  EMAIL_FROM: "One Click <mail@oneclick.computer>",
  SUPABASE_URL: "https://x.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "sb_secret_x",
  LICENSING_SECRET: "x".repeat(40),
  OPS_ALERT_URL: "https://ntfy.sh/private-topic",
};

describe("pre-deploy env check", () => {
  it("passes a complete production configuration", () => {
    expect(checkEnv(good)).toEqual({ errors: [], warnings: [] });
  });

  it("stops the deploy when the Resend key is missing, naming the setting but no values", () => {
    const { errors } = checkEnv({ ...good, RESEND_API_KEY: undefined });
    expect(errors).toEqual(["RESEND_API_KEY is missing"]);
    expect(errors.join(" ")).not.toContain("sb_secret_x");
  });

  it("flags a malformed sender and a missing alert channel", () => {
    const r = checkEnv({ ...good, EMAIL_FROM: "One Click", OPS_ALERT_URL: undefined });
    expect(r.errors[0]).toMatch(/EMAIL_FROM/);
    expect(r.warnings[0]).toMatch(/OPS_ALERT_URL/);
  });

  it("treats 401/403 from Resend as a rejected key, other answers as accepted, network errors as a warning", async () => {
    const reply = (status: number) => async () => new Response("{}", { status });
    expect((await checkResendKey(good, reply(401))).error).toMatch(/rejected RESEND_API_KEY/);
    expect((await checkResendKey(good, reply(403))).error).toMatch(/rejected/);
    expect(await checkResendKey(good, reply(422))).toEqual({});
    expect((await checkResendKey(good, async () => { throw new Error("offline"); })).warning).toMatch(/Could not reach/);
  });
});

describe("email failures reach the owner without email", () => {
  const saved = { ...process.env };
  let calls: { url: string; init: RequestInit }[] = [];

  beforeEach(() => {
    calls = [];
    resetOpsAlertThrottle();
    vi.stubGlobal("fetch", async (url: string, init: RequestInit) => {
      calls.push({ url: String(url), init });
      if (String(url).includes("resend")) return new Response(JSON.stringify({ name: "validation_error", message: "API key is invalid" }), { status: 401 });
      return new Response("ok", { status: 200 });
    });
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    process.env = { ...saved };
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("does nothing without OPS_ALERT_URL and throttles repeats", async () => {
    delete process.env.OPS_ALERT_URL;
    expect(await opsAlert("k", "t", "m")).toBe(false);
    process.env.OPS_ALERT_URL = "https://ntfy.sh/private-topic";
    expect(await opsAlert("k", "t", "m")).toBe(true);
    expect(await opsAlert("k", "t", "m")).toBe(false);
    expect(calls).toHaveLength(1);
  });

  it("a rejected key is logged and pushed with no recipient, code or key in either", async () => {
    Object.assign(process.env, { NODE_ENV: "production", EMAIL_PROVIDER: "resend", RESEND_API_KEY: "re_secret_value", EMAIL_FROM: "One Click <mail@oneclick.computer>", OPS_ALERT_URL: "https://ntfy.sh/private-topic" });
    const r = await sendEmail("bride@example.com", { subject: "Your code 123456", html: "<p>123456</p>", text: "123456" }, { kind: "access_code" });
    expect(r).toEqual({ sent: false, reason: "error" });
    const alert = calls.find((c) => c.url.includes("ntfy"));
    expect(alert).toBeDefined();
    const logged = (console.error as unknown as { mock: { calls: unknown[][] } }).mock.calls.flat().join(" ");
    for (const text of [String(alert!.init.body), logged]) {
      expect(text).toContain("401");
      expect(text).not.toContain("bride@example.com");
      expect(text).not.toContain("123456");
      expect(text).not.toContain("re_secret_value");
    }
  });

  it("a missing key in production is logged by name and pushed", async () => {
    Object.assign(process.env, { NODE_ENV: "production", EMAIL_PROVIDER: "resend", EMAIL_FROM: "One Click <mail@oneclick.computer>", OPS_ALERT_URL: "https://ntfy.sh/private-topic" });
    delete process.env.RESEND_API_KEY;
    const r = await sendEmail("bride@example.com", { subject: "s", html: "h", text: "t" }, { kind: "access_code" });
    expect(r).toEqual({ sent: false, reason: "not_connected" });
    expect(String(calls.find((c) => c.url.includes("ntfy"))!.init.body)).toContain("RESEND_API_KEY");
    expect(calls.some((c) => c.url.includes("resend"))).toBe(false);
  });
});
