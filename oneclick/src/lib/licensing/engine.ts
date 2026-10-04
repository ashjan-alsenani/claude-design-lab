import type { Locale } from "@/i18n/config";
import type { Product } from "@/content/types";
import { emailTemplates, type EmailContent } from "@/lib/email/templates";
import { newReference } from "@/lib/commerce/types";
import type { PaymentEvent } from "@/lib/payments/types";
import {
  generateCode,
  hashPassword,
  hmac,
  isValidEmail,
  maskEmail,
  normalizeEmail,
  randomId,
  randomToken,
  safeEqual,
  signPayload,
  verifyPassword,
  verifySignedPayload,
} from "./crypto";
import { describeDevice } from "./device";
import { offersDownloads, opensInteractive, resolvePolicy, resolveSecurity } from "./policy";
import type { LicensingStore } from "./store";
import type {
  AccessDecision,
  AccessLog,
  AccountStatus,
  AuditEntry,
  Challenge,
  ChallengePurpose,
  Device,
  License,
  LicenseStatus,
  LicensingDb,
  LicensingPolicy,
  LOrder,
  ProductSecuritySettings,
  Role,
  User,
  UserSession,
} from "./types";

/**
 * THE LICENSING & ACCESS ENGINE.
 *
 * One reusable service for every paid product. Products never contain licensing code:
 * they are opened through the protected routes, which call `checkAccess`, which calls
 * `canUserAccessProduct`. Per-product behaviour (access type, device limit, downloads,
 * watermark, duration, pause) is data, editable in Admin.
 *
 * Trust boundaries:
 * - Licenses become active ONLY in `handlePaymentEvent` (verified provider event),
 *   `adminGrant` (audited) or for free products (no license needed).
 * - Ownership is bound to a verified account. Links (claim, download) only start a
 *   verification or carry a short-lived signature bound to the signed-in session.
 * - Codes and tokens are stored as HMAC digests; nothing secret is logged.
 */
/** Resolves to `{ sent: false }` when the provider refused or could not be reached. */
export type Mailer = (to: string, content: EmailContent, meta: { kind: string }) => Promise<void | { sent: boolean }>;

export type EngineDeps = {
  store: LicensingStore;
  products: Product[];
  /** Server-only secret (LICENSING_SECRET). Never sent to the browser. */
  secret: string;
  /** Absolute site origin for links in emails, e.g. https://oneclick.om */
  baseUrl: string;
  mail: Mailer;
  adminEmails?: string[];
  /** Owner emails: admin rights plus opening every product without buying it. */
  ownerEmails?: string[];
  now?: () => Date;
};

export type ClientInfo = { userAgent?: string | null; deviceToken?: string | null };

export type SessionContext = {
  user: User;
  session: UserSession;
  device?: Device;
  roles: Role[];
};

export type SignInResult =
  | { ok: true; userId: string; sessionToken: string; deviceToken: string; deviceState: "trusted" | "pending" }
  | { ok: false; reason: "account_suspended" | "device_verification_required" | "invalid_credentials" | "rate_limited"; challengeId?: string };

export type VerifyFailure = { ok: false; reason: "invalid" | "expired" | "used" | "too_many_attempts" | "wrong_account"; attemptsLeft?: number };

export type CompleteResult =
  | ({ kind: "signed_in" } & Extract<SignInResult, { ok: true }>)
  | { kind: "email_changed"; email: string }
  | { kind: "failed"; reason: VerifyFailure["reason"] | "account_suspended" | "email_taken" };

const SECRET_KEYS = /code|otp|token|password|secret|hash/i;
function redact(meta?: AccessLog["meta"]) {
  if (!meta) return undefined;
  return Object.fromEntries(Object.entries(meta).filter(([k]) => !SECRET_KEYS.test(k)));
}

const DAY = 24 * 3600 * 1000;

/**
 * THE central authorization rule. Pure: reads data, decides, never trusts the caller's
 * claims about ownership. Every protected page, download and API goes through it.
 */
export function canUserAccessProduct(
  db: Readonly<LicensingDb>,
  products: Product[],
  input: {
    userId: string | null | undefined;
    productId: string;
    sessionId?: string;
    deviceId?: string | null;
    purpose?: "open" | "download";
    /** Normalized owner emails: the site owner opens every product without a license. */
    owners?: ReadonlySet<string>;
  },
  now = new Date()
): AccessDecision {
  const purpose = input.purpose ?? "open";
  const product = products.find((p) => p.id === input.productId);
  if (!product) return { allowed: false, reason: "product_not_found" };
  const settings = resolveSecurity(db, product);
  if (settings.accessType === "CUSTOM_SERVICE") return { allowed: false, reason: "custom_service", settings };
  if (settings.status === "paused") return { allowed: false, reason: "product_paused", settings };
  if (settings.accessType === "PUBLIC_FREE") return { allowed: true, reason: "public_free", settings };

  if (purpose === "open" && !opensInteractive(settings.accessType)) return { allowed: false, reason: "open_not_supported", settings };
  if (purpose === "download" && !offersDownloads(settings)) return { allowed: false, reason: "download_not_available", settings };

  if (!input.userId) return { allowed: false, reason: "not_signed_in", settings };
  const user = db.users.find((u) => u.id === input.userId);
  if (!user) return { allowed: false, reason: "session_invalid", settings };
  if (user.accountStatus === "suspended" || user.accountStatus === "closed") return { allowed: false, reason: "account_suspended", settings };
  if (!user.emailVerifiedAt || user.accountStatus !== "active") return { allowed: false, reason: "account_unverified", settings };

  if (input.sessionId !== undefined) {
    const s = db.sessions.find((x) => x.id === input.sessionId);
    if (!s || s.userId !== user.id || !isSessionLive(s, now)) return { allowed: false, reason: "session_invalid", settings };
    if (s.deviceState !== "trusted") return { allowed: false, reason: "device_not_authorized", settings };
  }

  const mine = db.licenses.filter((l) => l.userId === user.id && l.productId === product.id);
  // The owner still needs a verified account, a live session and a trusted device (above);
  // only the purchase requirement is waived. Downloads keep their per-license accounting.
  if (purpose === "open" && input.owners?.has(normalizeEmail(user.email))) return { allowed: true, reason: "owner", settings };
  if (mine.length === 0) return { allowed: false, reason: "no_license", settings };
  const rank: Record<LicenseStatus, number> = { active: 0, suspended: 1, pending: 2, expired: 3, revoked: 4 };
  const license = [...mine].sort((a, b) => rank[effectiveStatus(a, now)] - rank[effectiveStatus(b, now)])[0];
  const status = effectiveStatus(license, now);
  if (status !== "active") return { allowed: false, reason: `license_${status}` as const, settings };

  if (settings.deviceLimit !== null && input.deviceId && !license.deviceIds.includes(input.deviceId) && license.deviceIds.length >= settings.deviceLimit) {
    return { allowed: false, reason: "device_limit", settings };
  }
  if (purpose === "download" && settings.downloadLimit !== null) {
    const used = db.downloads.filter((d) => d.licenseId === license.id).length;
    if (used >= settings.downloadLimit) return { allowed: false, reason: "download_limit", settings };
  }
  return { allowed: true, reason: "licensed", license, settings };
}

export function effectiveStatus(l: License, now = new Date()): LicenseStatus {
  if (l.status === "active" && l.expiresAt && new Date(l.expiresAt) <= now) return "expired";
  return l.status;
}

export function isSessionLive(s: UserSession, now = new Date()) {
  return !s.revokedAt && new Date(s.expiresAt) > now;
}

export function createLicensingEngine(deps: EngineDeps) {
  const now = () => deps.now?.() ?? new Date();
  const iso = () => now().toISOString();
  const later = (ms: number) => new Date(now().getTime() + ms).toISOString();
  const h = (v: string) => hmac(deps.secret, v);
  const admins = new Set((deps.adminEmails ?? []).map(normalizeEmail));
  const productById = (id: string) => deps.products.find((p) => p.id === id);
  const owners: ReadonlySet<string> = new Set((deps.ownerEmails ?? []).map(normalizeEmail));
  const rolesFor = (u: User): Role[] => {
    const email = normalizeEmail(u.email);
    return owners.has(email) ? ["customer", "admin", "owner"] : admins.has(email) ? ["customer", "admin"] : ["customer"];
  };
  const url = (path: string) => `${deps.baseUrl.replace(/\/$/, "")}${path}`;

  function log(db: LicensingDb, e: Omit<AccessLog, "id" | "at">) {
    db.accessLogs.push({ id: randomId("log"), at: iso(), ...e, meta: redact(e.meta) });
  }
  function audit(db: LicensingDb, e: Omit<AuditEntry, "id" | "at">) {
    db.audit.push({ id: randomId("aud"), at: iso(), ...e });
  }
  const productNames = (ids: string[], locale: Locale) => ids.map((id) => productById(id)?.name[locale] ?? id);

  // ---------------------------------------------------------------- verification codes
  async function startVerification(input: { email: string; purpose: ChallengePurpose; locale: Locale; userId?: string; newEmail?: string }) {
    const email = normalizeEmail(input.email);
    if (!isValidEmail(email)) return { ok: false as const, reason: "invalid_email" as const };
    const code = generateCode();
    const result = await deps.store.write((db) => {
      const policy = resolvePolicy(db);
      const since = now().getTime() - 3600 * 1000;
      const recent = db.challenges.filter((c) => c.email === email && new Date(c.createdAt).getTime() > since).length;
      if (recent >= policy.otpPerEmailPerHour) {
        log(db, { event: "rate_limited", outcome: "suspicious", userId: input.userId ?? null, reason: "verification_per_email", meta: { purpose: input.purpose } });
        return { ok: false as const, reason: "rate_limited" as const };
      }
      // Only the newest code for an address and purpose can be used.
      for (const c of db.challenges) if (c.email === email && c.purpose === input.purpose && !c.consumedAt) c.consumedAt = iso();
      const id = randomId("chl");
      db.challenges.push({
        id,
        email,
        purpose: input.purpose,
        codeHash: h(`${id}:${code}`),
        createdAt: iso(),
        expiresAt: later(policy.otpTtlMinutes * 60 * 1000),
        attempts: 0,
        userId: input.userId,
        newEmail: input.newEmail,
      });
      log(db, { event: "verification_sent", outcome: "info", userId: input.userId ?? null, meta: { purpose: input.purpose } });
      return { ok: true as const, challengeId: id, minutes: policy.otpTtlMinutes };
    });
    if (!result.ok) return result;
    const sent = await deps.mail(email, emailTemplates.accessCode(input.locale, { code, minutes: result.minutes }), { kind: "access_code" });
    if (sent && !sent.sent) {
      // The code never reached the person: withdraw it so it neither counts toward the hourly
      // limit nor leaves them waiting for an email that is not coming.
      await deps.store.write((db) => {
        db.challenges = db.challenges.filter((c) => c.id !== result.challengeId);
        log(db, { event: "verification_email_failed", outcome: "info", userId: input.userId ?? null, meta: { purpose: input.purpose } });
      });
      return { ok: false as const, reason: "email_failed" as const };
    }
    return result;
  }

  function verifyTx(db: LicensingDb, challengeId: string, code: string): { ok: true; challenge: Challenge } | VerifyFailure {
    const c = db.challenges.find((x) => x.id === challengeId);
    if (!c) return { ok: false, reason: "invalid" };
    if (c.lockedAt) return { ok: false, reason: "too_many_attempts" };
    if (c.consumedAt) return { ok: false, reason: "used" };
    if (new Date(c.expiresAt) <= now()) return { ok: false, reason: "expired" };
    const policy = resolvePolicy(db);
    const clean = code.replace(/[\s-]/g, "").replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x660)).replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x6f0));
    if (!/^\d{6}$/.test(clean) || !safeEqual(h(`${c.id}:${clean}`), c.codeHash)) {
      c.attempts += 1;
      if (c.attempts >= policy.otpMaxAttempts) {
        c.lockedAt = iso();
        log(db, { event: "verification_locked", outcome: "suspicious", userId: c.userId ?? null, meta: { purpose: c.purpose } });
        return { ok: false, reason: "too_many_attempts" };
      }
      log(db, { event: "verification_failed", outcome: "denied", userId: c.userId ?? null, meta: { purpose: c.purpose } });
      return { ok: false, reason: "invalid", attemptsLeft: policy.otpMaxAttempts - c.attempts };
    }
    c.consumedAt = iso();
    return { ok: true, challenge: c };
  }

  async function describeChallenge(challengeId: string | null | undefined) {
    if (!challengeId) return null;
    return deps.store.read((db) => {
      const c = db.challenges.find((x) => x.id === challengeId);
      if (!c || c.consumedAt || c.lockedAt || new Date(c.expiresAt) <= now()) return null;
      return { maskedEmail: maskEmail(c.email), purpose: c.purpose, expiresAt: c.expiresAt };
    });
  }

  /** Resend = a fresh challenge to the same address (old code stops working). */
  async function resendVerification(challengeId: string, locale: Locale) {
    const c = await deps.store.read((db) => db.challenges.find((x) => x.id === challengeId));
    if (!c) return { ok: false as const, reason: "invalid" as const };
    return startVerification({ email: c.email, purpose: c.purpose, locale, userId: c.userId, newEmail: c.newEmail });
  }

  // ---------------------------------------------------------------- accounts & sessions
  function claimTx(db: LicensingDb, user: User) {
    for (const l of db.licenses) {
      if (!l.userId && l.purchaseEmail === user.email) {
        l.userId = user.id;
        l.claimedAt = iso();
        log(db, { event: "license_claimed", outcome: "info", userId: user.id, productId: l.productId, licenseId: l.id });
      }
    }
    for (const o of db.orders) if (!o.userId && o.purchaseEmail === user.email) o.userId = user.id;
  }

  function addDeviceTx(db: LicensingDb, user: User, tokenHash: string, ua: string | null | undefined) {
    const info = describeDevice(ua);
    const device: Device = { id: randomId("dev"), userId: user.id, tokenHash, name: info.name, platform: info.platform, firstVerifiedAt: iso(), lastUsedAt: iso(), status: "trusted" };
    db.devices.push(device);
    log(db, { event: "device_added", outcome: "info", userId: user.id, deviceId: device.id, meta: { platform: info.platform } });
    return device;
  }

  /**
   * Creates a session. `verifiedNow` = the person just proved control of the email
   * (one-time code). Without it, only an already-trusted device may sign in.
   */
  function signInTx(db: LicensingDb, email: string, client: ClientInfo, verifiedNow: boolean, locale: Locale) {
    const policy = resolvePolicy(db);
    let user = db.users.find((u) => u.email === email);
    if (!user) {
      if (!verifiedNow) return { ok: false as const, reason: "invalid_credentials" as const };
      user = { id: randomId("usr"), email, accountStatus: "active", emailVerifiedAt: iso(), locale, createdAt: iso(), emailHistory: [] };
      db.users.push(user);
      audit(db, { actorId: user.id, action: "account_created", entity: "user", entityId: user.id });
    }
    if (user.accountStatus === "suspended" || user.accountStatus === "closed") {
      log(db, { event: "signin_failed", outcome: "denied", userId: user.id, reason: "account_suspended" });
      return { ok: false as const, reason: "account_suspended" as const };
    }
    if (verifiedNow) {
      user.emailVerifiedAt ??= iso();
      if (user.accountStatus === "pending_verification") user.accountStatus = "active";
      claimTx(db, user);
    }

    const deviceToken = client.deviceToken && client.deviceToken.length >= 32 ? client.deviceToken : randomToken();
    const tokenHash = h(deviceToken);
    let device = db.devices.find((d) => d.userId === user.id && d.tokenHash === tokenHash && d.status === "trusted");
    let deviceState: "trusted" | "pending" = "trusted";
    let alert: { name: string } | null = null;
    if (device) device.lastUsedAt = iso();
    else {
      if (!verifiedNow) return { ok: false as const, reason: "device_verification_required" as const };
      const trusted = db.devices.filter((d) => d.userId === user.id && d.status === "trusted");
      if (trusted.length < policy.defaultDeviceLimit) {
        device = addDeviceTx(db, user, tokenHash, client.userAgent);
        if (trusted.length > 0) alert = { name: device.name };
      } else {
        deviceState = "pending";
        log(db, { event: "device_pending", outcome: "info", userId: user.id, reason: "device_limit_reached" });
      }
    }

    const sessionToken = randomToken();
    const session: UserSession = {
      id: randomId("ses"),
      userId: user.id,
      tokenHash: h(sessionToken),
      deviceId: device?.id ?? null,
      deviceState,
      createdAt: iso(),
      lastSeenAt: iso(),
      expiresAt: later(policy.sessionDays * DAY),
      verifiedAt: verifiedNow ? iso() : undefined,
      pendingDeviceTokenHash: deviceState === "pending" ? tokenHash : undefined,
    };
    db.sessions.push(session);
    const live = db.sessions.filter((s) => s.userId === user.id && isSessionLive(s, now())).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    while (live.length > policy.maxActiveSessions) {
      const old = live.shift()!;
      old.revokedAt = iso();
      old.revokedReason = "session_limit";
      log(db, { event: "session_revoked", outcome: "info", userId: user.id, reason: "session_limit" });
    }
    log(db, { event: "signin", outcome: "allowed", userId: user.id, deviceId: device?.id ?? null, meta: { method: verifiedNow ? "code" : "password", deviceState } });
    return { ok: true as const, userId: user.id, sessionToken, deviceToken, deviceState, alert, email: user.email };
  }

  async function sendNewDeviceAlert(email: string, locale: Locale, name: string) {
    await deps.mail(email, emailTemplates.newDeviceAlert(locale, { deviceName: name, devicesUrl: url(`/${locale}/account/devices`) }), { kind: "new_device" });
  }

  /** Completes a code challenge: signs in, or confirms an email change. */
  async function completeVerification(input: { challengeId: string; code: string; client: ClientInfo; locale: Locale; sessionToken?: string | null }): Promise<CompleteResult> {
    const sessionHash = input.sessionToken ? h(input.sessionToken) : null;
    const r = await deps.store.write((db) => {
      const v = verifyTx(db, input.challengeId, input.code);
      if (!v.ok) return { kind: "failed" as const, reason: v.reason };
      const c = v.challenge;
      if (c.purpose === "email_change") {
        const s = sessionHash ? db.sessions.find((x) => x.tokenHash === sessionHash && isSessionLive(x, now())) : undefined;
        const user = s && db.users.find((u) => u.id === s.userId);
        if (!user || user.id !== c.userId || !c.newEmail) return { kind: "failed" as const, reason: "wrong_account" as const };
        if (db.users.some((u) => u.email === c.newEmail && u.id !== user.id)) return { kind: "failed" as const, reason: "email_taken" as const };
        const old = user.email;
        user.emailHistory.push({ email: old, changedAt: iso() });
        user.email = c.newEmail;
        s!.verifiedAt = iso();
        // Purchase emails on orders and licenses are preserved as historical records.
        audit(db, { actorId: user.id, action: "email_changed", entity: "user", entityId: user.id, details: { from: maskEmail(old), to: maskEmail(c.newEmail) } });
        log(db, { event: "email_changed", outcome: "info", userId: user.id });
        return { kind: "email_changed" as const, email: c.newEmail, old };
      }
      const res = signInTx(db, c.email, input.client, true, input.locale);
      if (!res.ok) return { kind: "failed" as const, reason: "account_suspended" as const };
      return { kind: "signed_in" as const, ...res };
    });
    if (r.kind === "email_changed") {
      await deps.mail(r.old, emailTemplates.emailChanged(input.locale, { newEmail: maskEmail(r.email) }), { kind: "email_changed" });
      return { kind: "email_changed", email: r.email };
    }
    if (r.kind === "signed_in") {
      if (r.alert) await sendNewDeviceAlert(r.email, input.locale, r.alert.name);
      return { kind: "signed_in", ok: true, userId: r.userId, sessionToken: r.sessionToken, deviceToken: r.deviceToken, deviceState: r.deviceState };
    }
    return r;
  }

  /** Returning customers on a trusted device: password only, no code. */
  async function passwordSignIn(input: { email: string; password: string; client: ClientInfo; locale: Locale }): Promise<SignInResult> {
    const email = normalizeEmail(input.email);
    const user = await deps.store.read((db) => db.users.find((u) => u.email === email));
    const recentFailures = await deps.store.read(
      (db) => db.accessLogs.filter((l) => l.event === "signin_failed" && l.userId && l.userId === user?.id && new Date(l.at).getTime() > now().getTime() - 15 * 60 * 1000).length
    );
    if (recentFailures >= 8) return { ok: false, reason: "rate_limited" };
    const ok = verifyPassword(input.password, user?.passwordHash);
    if (!user || !ok) {
      await deps.store.write((db) => log(db, { event: "signin_failed", outcome: "denied", userId: user?.id ?? null, reason: "invalid_credentials" }));
      return { ok: false, reason: "invalid_credentials" };
    }
    const r = await deps.store.write((db) => signInTx(db, email, input.client, false, input.locale));
    if (r.ok) return { ok: true, userId: r.userId, sessionToken: r.sessionToken, deviceToken: r.deviceToken, deviceState: r.deviceState };
    if (r.reason === "device_verification_required") {
      const ch = await startVerification({ email, purpose: "new_device", locale: input.locale, userId: user.id });
      return ch.ok ? { ok: false, reason: "device_verification_required", challengeId: ch.challengeId } : { ok: false, reason: "rate_limited" };
    }
    return { ok: false, reason: r.reason };
  }

  async function getSessionContext(sessionToken: string | null | undefined): Promise<SessionContext | null> {
    if (!sessionToken) return null;
    const hash = h(sessionToken);
    const ctx = await deps.store.read((db) => {
      const session = db.sessions.find((s) => s.tokenHash === hash);
      if (!session || !isSessionLive(session, now())) return null;
      const user = db.users.find((u) => u.id === session.userId);
      if (!user || user.accountStatus !== "active") return null;
      const device = session.deviceId ? db.devices.find((d) => d.id === session.deviceId) : undefined;
      if (session.deviceState === "trusted" && device?.status !== "trusted") return null;
      return { user: structuredClone(user), session: structuredClone(session), device: device && structuredClone(device) };
    });
    if (!ctx) return null;
    if (now().getTime() - new Date(ctx.session.lastSeenAt).getTime() > 5 * 60 * 1000) {
      await deps.store
        .write((db) => {
          const s = db.sessions.find((x) => x.id === ctx.session.id);
          if (s) s.lastSeenAt = iso();
          const d = ctx.device && db.devices.find((x) => x.id === ctx.device!.id);
          if (d) d.lastUsedAt = iso();
        })
        .catch(() => undefined);
    }
    return { ...ctx, roles: rolesFor(ctx.user) };
  }

  async function signOut(sessionToken: string | null | undefined) {
    if (!sessionToken) return;
    const hash = h(sessionToken);
    await deps.store.write((db) => {
      const s = db.sessions.find((x) => x.tokenHash === hash);
      if (s && !s.revokedAt) {
        s.revokedAt = iso();
        s.revokedReason = "signout";
        log(db, { event: "signout", outcome: "info", userId: s.userId });
      }
    });
  }

  function revokeSessionsTx(db: LicensingDb, userId: string, reason: string, keepSessionId?: string, onlyDeviceId?: string) {
    let n = 0;
    for (const s of db.sessions) {
      if (s.userId !== userId || s.revokedAt || s.id === keepSessionId) continue;
      if (onlyDeviceId && s.deviceId !== onlyDeviceId) continue;
      s.revokedAt = iso();
      s.revokedReason = reason;
      n++;
    }
    if (n) log(db, { event: "session_revoked", outcome: "info", userId, reason, meta: { count: n } });
    return n;
  }

  async function signOutEverywhere(ctx: SessionContext, keepCurrent: boolean) {
    await deps.store.write((db) => {
      revokeSessionsTx(db, ctx.user.id, "signout_all", keepCurrent ? ctx.session.id : undefined);
      audit(db, { actorId: ctx.user.id, action: "signout_all", entity: "session", entityId: ctx.user.id });
    });
  }

  function removeDeviceTx(db: LicensingDb, userId: string, deviceId: string, actorId: string, reason: string) {
    const d = db.devices.find((x) => x.id === deviceId && x.userId === userId && x.status === "trusted");
    if (!d) return false;
    d.status = "removed";
    revokeSessionsTx(db, userId, "device_removed", undefined, d.id);
    for (const l of db.licenses) if (l.userId === userId) l.deviceIds = l.deviceIds.filter((x) => x !== d.id);
    audit(db, { actorId, action: "device_removed", entity: "device", entityId: d.id, reason });
    log(db, { event: "device_removed", outcome: "info", userId, deviceId: d.id });
    return true;
  }

  async function removeDevice(ctx: SessionContext, deviceId: string) {
    if (ctx.session.deviceId === deviceId) return { ok: false as const, reason: "current_device" as const };
    const ok = await deps.store.write((db) => removeDeviceTx(db, ctx.user.id, deviceId, ctx.user.id, "customer"));
    return ok ? { ok: true as const } : { ok: false as const, reason: "not_found" as const };
  }

  /** New-device flow: after verifying, the customer removes an old device to authorize this one. */
  async function authorizePendingDevice(ctx: SessionContext, removeDeviceId: string | null) {
    return deps.store.write((db) => {
      const s = db.sessions.find((x) => x.id === ctx.session.id);
      const user = db.users.find((u) => u.id === ctx.user.id);
      if (!s || !user || s.deviceState !== "pending" || !s.pendingDeviceTokenHash || !isSessionLive(s, now())) return { ok: false as const, reason: "not_pending" as const };
      if (!s.verifiedAt || now().getTime() - new Date(s.verifiedAt).getTime() > 30 * 60 * 1000) return { ok: false as const, reason: "verification_expired" as const };
      const policy = resolvePolicy(db);
      const trusted = () => db.devices.filter((d) => d.userId === user.id && d.status === "trusted");
      if (trusted().length >= policy.defaultDeviceLimit) {
        if (!removeDeviceId || !removeDeviceTx(db, user.id, removeDeviceId, user.id, "replaced_by_new_device")) return { ok: false as const, reason: "choose_device" as const };
      }
      const device = addDeviceTx(db, user, s.pendingDeviceTokenHash, null);
      device.name = ctx.device?.name ?? device.name;
      s.deviceId = device.id;
      s.deviceState = "trusted";
      s.pendingDeviceTokenHash = undefined;
      audit(db, { actorId: user.id, action: "device_authorized", entity: "device", entityId: device.id });
      return { ok: true as const };
    });
  }

  async function setPassword(ctx: SessionContext, input: { current?: string; next: string }) {
    if (input.next.length < 10 || input.next.length > 200) return { ok: false as const, reason: "weak" as const };
    const user = await deps.store.read((db) => db.users.find((u) => u.id === ctx.user.id));
    if (!user) return { ok: false as const, reason: "not_found" as const };
    if (user.passwordHash) {
      if (!verifyPassword(input.current ?? "", user.passwordHash)) return { ok: false as const, reason: "wrong_password" as const };
    } else if (!ctx.session.verifiedAt || now().getTime() - new Date(ctx.session.verifiedAt).getTime() > 30 * 60 * 1000) {
      return { ok: false as const, reason: "reverify" as const };
    }
    const hash = hashPassword(input.next);
    await deps.store.write((db) => {
      const u = db.users.find((x) => x.id === ctx.user.id)!;
      u.passwordHash = hash;
      revokeSessionsTx(db, u.id, "password_changed", ctx.session.id);
      audit(db, { actorId: u.id, action: "password_set", entity: "user", entityId: u.id });
      log(db, { event: "password_set", outcome: "info", userId: u.id });
    });
    return { ok: true as const };
  }

  async function requestEmailChange(ctx: SessionContext, newEmail: string, locale: Locale) {
    const email = normalizeEmail(newEmail);
    if (!isValidEmail(email) || email === ctx.user.email) return { ok: false as const, reason: "invalid_email" as const };
    const taken = await deps.store.read((db) => db.users.some((u) => u.email === email));
    if (taken) {
      // Same screen either way so other customers' addresses are not revealed:
      // a challenge that no code can ever satisfy, and no email is sent.
      return deps.store.write((db) => {
        const id = randomId("chl");
        db.challenges.push({ id, email, purpose: "email_change", codeHash: randomToken(), createdAt: iso(), expiresAt: later(resolvePolicy(db).otpTtlMinutes * 60 * 1000), attempts: 0, userId: ctx.user.id, newEmail: email });
        return { ok: true as const, challengeId: id };
      });
    }
    const r = await startVerification({ email, purpose: "email_change", locale, userId: ctx.user.id, newEmail: email });
    return r.ok ? { ok: true as const, challengeId: r.challengeId } : r;
  }

  // ---------------------------------------------------------------- claim links
  async function getClaim(token: string | null | undefined) {
    if (!token) return { status: "invalid" as const };
    const hash = h(token);
    return deps.store.read((db) => {
      const c = db.claims.find((x) => x.tokenHash === hash);
      if (!c) return { status: "invalid" as const };
      if (new Date(c.expiresAt) <= now()) return { status: "expired" as const };
      const items = db.orderItems.filter((i) => i.orderId === c.orderId).map((i) => i.productId);
      return { status: "ok" as const, maskedEmail: maskEmail(c.purchaseEmail), productIds: items, claimId: c.id };
    });
  }

  /**
   * The claim link only STARTS verification. The code is sent to the purchase email on
   * the order (never to an address typed by whoever holds the link), so a forwarded
   * link transfers nothing.
   */
  async function startClaim(token: string, locale: Locale) {
    const hash = h(token);
    const claim = await deps.store.write((db) => {
      const c = db.claims.find((x) => x.tokenHash === hash);
      if (!c || new Date(c.expiresAt) <= now()) return null;
      c.lastUsedAt = iso();
      return { email: c.purchaseEmail };
    });
    if (!claim) return { ok: false as const, reason: "invalid" as const };
    const r = await startVerification({ email: claim.email, purpose: "claim", locale });
    return r.ok ? { ok: true as const, challengeId: r.challengeId, maskedEmail: maskEmail(claim.email) } : r;
  }

  // ---------------------------------------------------------------- orders & payments
  async function createOrder(input: { productIds: string[]; purchaseEmail: string; userId?: string | null; provider: string; sandbox: boolean; locale: Locale }) {
    return deps.store.write((db) => {
      let email = normalizeEmail(input.purchaseEmail);
      if (input.userId) {
        const u = db.users.find((x) => x.id === input.userId);
        if (u) email = u.email; // signed-in purchases always use the verified account email
      }
      if (!isValidEmail(email)) return { ok: false as const, reason: "invalid_email" as const };
      const products = input.productIds.map(productById);
      if (products.length === 0 || products.some((p) => !p || !p.price || p.status === "archived")) return { ok: false as const, reason: "not_purchasable" as const };
      const list = products as (Product & { price: NonNullable<Product["price"]> })[];
      if (list.some((p) => resolveSecurity(db, p).accessType === "CUSTOM_SERVICE")) return { ok: false as const, reason: "not_purchasable" as const };
      const currency = list[0].price.currency;
      if (list.some((p) => p.price.currency !== currency)) return { ok: false as const, reason: "currency" as const };
      const order: LOrder = {
        id: newReference("OC"),
        userId: input.userId ?? null,
        purchaseEmail: email,
        status: "pending",
        currency,
        totalMinor: list.reduce((sum, p) => sum + p.price.amountMinor, 0),
        provider: input.provider,
        sandbox: input.sandbox,
        locale: input.locale,
        createdAt: iso(),
      };
      db.orders.push(order);
      for (const p of list) db.orderItems.push({ id: randomId("itm"), orderId: order.id, productId: p.id, unitPriceMinor: p.price.amountMinor, licenseType: resolveSecurity(db, p).licenseType });
      audit(db, { actorId: input.userId ?? "guest", action: "order_created", entity: "order", entityId: order.id, details: { sandbox: input.sandbox } });
      return { ok: true as const, order: structuredClone(order) };
    });
  }

  function ownerFor(db: LicensingDb, order: LOrder) {
    if (order.userId) return order.userId;
    const u = db.users.find((x) => x.email === order.purchaseEmail && x.emailVerifiedAt && x.accountStatus === "active");
    return u?.id ?? null;
  }

  function createLicensesTx(db: LicensingDb, order: LOrder, status: "pending" | "active") {
    const owner = ownerFor(db, order);
    const created: License[] = [];
    const make = (productId: string, itemId: string, source: License["source"], parent?: string) => {
      const p = productById(productId)!;
      const s = resolveSecurity(db, p);
      const l: License = {
        id: randomId("lic"),
        userId: owner,
        productId,
        orderId: order.id,
        orderItemId: itemId,
        parentLicenseId: parent,
        purchaseEmail: order.purchaseEmail,
        status,
        licenseType: s.licenseType,
        source,
        createdAt: iso(),
        deviceIds: [],
      };
      if (status === "active") activateTx(l, s);
      db.licenses.push(l);
      created.push(l);
      return l;
    };
    for (const item of db.orderItems.filter((i) => i.orderId === order.id)) {
      const p = productById(item.productId);
      if (!p) continue;
      const parent = make(p.id, item.id, "purchase");
      for (const child of p.includes ?? []) if (productById(child)) make(child, item.id, "bundle", parent.id);
    }
    return created;
  }

  function activateTx(l: License, s: ProductSecuritySettings) {
    l.status = "active";
    l.activatedAt = iso();
    l.statusReason = undefined;
    if (s.licenseDurationDays) l.expiresAt = later(s.licenseDurationDays * DAY);
  }

  function setOrderLicensesTx(db: LicensingDb, orderId: string, status: "revoked" | "suspended", reason: string) {
    for (const l of db.licenses.filter((x) => x.orderId === orderId && x.status !== "revoked")) {
      l.status = status;
      l.statusReason = reason;
      if (status === "revoked") l.revokedAt = iso();
      else l.suspendedAt = iso();
      audit(db, { actorId: "system", action: `license_${status}`, entity: "license", entityId: l.id, reason });
    }
  }

  function issueClaimTx(db: LicensingDb, order: LOrder) {
    const policy = resolvePolicy(db);
    const token = randomToken();
    db.claims.push({ id: randomId("clm"), tokenHash: h(token), orderId: order.id, purchaseEmail: order.purchaseEmail, createdAt: iso(), expiresAt: later(policy.claimLinkDays * DAY) });
    return token;
  }

  async function sendAccessEmail(order: LOrder, bound: boolean, claimToken: string | null) {
    const names = await deps.store.read((db) => productNames(db.orderItems.filter((i) => i.orderId === order.id).map((i) => i.productId), order.locale));
    const loc = order.locale;
    const content = bound
      ? emailTemplates.productsReady(loc, { orderRef: order.id, productNames: names, url: url(`/${loc}/account/products`), sandbox: order.sandbox })
      : emailTemplates.claimProduct(loc, { orderRef: order.id, productNames: names, url: url(`/${loc}/claim?t=${claimToken}`), sandbox: order.sandbox });
    await deps.mail(order.purchaseEmail, content, { kind: bound ? "products_ready" : "claim_product" });
  }

  /**
   * Applies a VERIFIED provider event. Idempotent per (provider, eventId).
   * Invalid events (unknown order, wrong provider, wrong amount/currency) are recorded
   * and create no access.
   */
  async function handlePaymentEvent(provider: string, ev: PaymentEvent) {
    const r = await deps.store.write((db) => {
      if (db.paymentEvents.some((e) => e.provider === provider && e.eventId === ev.eventId)) return { outcome: "duplicate" as const };
      const record = <T extends string>(outcome: T, orderId = ev.orderId) => {
        db.paymentEvents.push({ provider, eventId: ev.eventId, orderId, type: ev.type, receivedAt: iso(), outcome });
        const bad = ["unknown_order", "provider_mismatch", "amount_mismatch", "order_closed"].includes(outcome);
        log(db, { event: "payment_event", outcome: bad ? "suspicious" : "info", reason: outcome, meta: { type: ev.type, provider } });
        return outcome;
      };
      const order = db.orders.find((o) => o.id === ev.orderId);
      if (!order) return { outcome: record("unknown_order") };
      if (order.provider !== provider) return { outcome: record("provider_mismatch") };
      const policy = resolvePolicy(db);
      switch (ev.type) {
        case "payment.succeeded": {
          if (ev.amount.amountMinor !== order.totalMinor || ev.amount.currency !== order.currency) return { outcome: record("amount_mismatch") };
          if (order.status === "paid") return { outcome: record("already_paid") };
          if (order.status !== "pending" && order.status !== "failed") return { outcome: record("order_closed") };
          order.status = "paid";
          order.paidAt = iso();
          order.externalPaymentReference = ev.providerReference;
          const pending = db.licenses.filter((l) => l.orderId === order.id && l.status === "pending");
          if (pending.length) {
            for (const l of pending) activateTx(l, resolveSecurity(db, productById(l.productId)!));
          } else createLicensesTx(db, order, "active");
          const owner = ownerFor(db, order);
          for (const l of db.licenses.filter((x) => x.orderId === order.id)) {
            if (!l.userId && owner) l.userId = owner;
            log(db, { event: "license_activated", outcome: "info", userId: l.userId, productId: l.productId, licenseId: l.id });
          }
          const claimToken = owner ? null : issueClaimTx(db, order);
          return { outcome: record("licenses_activated"), order: structuredClone(order), bound: !!owner, claimToken };
        }
        case "payment.pending": {
          if (order.status !== "pending") return { outcome: record("ignored") };
          if (!db.licenses.some((l) => l.orderId === order.id)) createLicensesTx(db, order, "pending");
          return { outcome: record("licenses_pending") };
        }
        case "payment.failed":
        case "payment.cancelled": {
          if (order.status === "paid") {
            if (ev.type === "payment.failed") return { outcome: record("ignored") };
            order.status = "cancelled";
            setOrderLicensesTx(db, order.id, policy.onCancel === "revoke" ? "revoked" : "suspended", "order_cancelled");
            return { outcome: record("licenses_" + policy.onCancel + "d") };
          }
          if (order.status !== "pending") return { outcome: record("ignored") };
          order.status = ev.type === "payment.failed" ? "failed" : "cancelled";
          setOrderLicensesTx(db, order.id, "revoked", "payment_not_completed");
          return { outcome: record("no_access") };
        }
        case "payment.refunded":
        case "payment.chargeback": {
          if (order.status !== "paid") return { outcome: record("ignored") };
          const isRefund = ev.type === "payment.refunded";
          order.status = isRefund ? "refunded" : "chargeback";
          const action = isRefund ? policy.onRefund : policy.onChargeback;
          setOrderLicensesTx(db, order.id, action === "revoke" ? "revoked" : "suspended", isRefund ? "refunded" : "chargeback");
          return { outcome: record("licenses_" + action + "d") };
        }
      }
    });
    if ("order" in r && r.order) await sendAccessEmail(r.order, r.bound, r.claimToken);
    return { outcome: r.outcome };
  }

  // ---------------------------------------------------------------- access
  /**
   * Authorizes a protected request and records it. Also detects (without blocking)
   * concurrent use of one license on several devices and repeated denied attempts.
   */
  async function checkAccess(ctx: SessionContext | null, productId: string, purpose: "open" | "download" = "open"): Promise<AccessDecision> {
    if (deps.store.mode === "unavailable") {
      // No database: decide read-only (fails closed for everything except free products).
      return deps.store.read((db) => canUserAccessProduct(db, deps.products, { userId: ctx?.user.id, productId, purpose, owners }, now()));
    }
    return deps.store.write((db) => {
      const decision = canUserAccessProduct(db, deps.products, { userId: ctx?.user.id, productId, sessionId: ctx?.session.id, deviceId: ctx?.session.deviceId, purpose, owners }, now());
      const base = { userId: ctx?.user.id ?? null, productId, deviceId: ctx?.session.deviceId ?? null };
      if (decision.allowed) {
        const l = decision.license && db.licenses.find((x) => x.id === decision.license!.id);
        if (l && ctx?.session.deviceId && !l.deviceIds.includes(ctx.session.deviceId)) l.deviceIds.push(ctx.session.deviceId);
        if (purpose === "open") {
          log(db, { ...base, event: "product_open", outcome: "allowed", licenseId: l?.id, reason: decision.reason });
          if (l) {
            const since = now().getTime() - 2 * 60 * 1000;
            const devices = new Set(db.accessLogs.filter((x) => x.licenseId === l.id && x.event === "product_open" && x.outcome === "allowed" && new Date(x.at).getTime() > since && x.deviceId).map((x) => x.deviceId));
            const alreadyFlagged = db.accessLogs.some((x) => x.licenseId === l.id && x.event === "concurrent_use" && new Date(x.at).getTime() > since);
            if (devices.size > 1 && !alreadyFlagged) log(db, { ...base, event: "concurrent_use", outcome: "suspicious", licenseId: l.id, meta: { devices: devices.size } });
          }
        }
        return structuredClone(decision);
      }
      log(db, { ...base, event: purpose === "open" ? "product_open" : "download", outcome: "denied", reason: decision.reason });
      if (ctx) {
        const since = now().getTime() - 10 * 60 * 1000;
        const denials = db.accessLogs.filter((x) => x.userId === ctx.user.id && x.outcome === "denied" && new Date(x.at).getTime() > since).length;
        const flagged = db.accessLogs.some((x) => x.userId === ctx.user.id && x.event === "repeated_denials" && new Date(x.at).getTime() > since);
        if (denials >= 10 && !flagged) log(db, { ...base, event: "repeated_denials", outcome: "suspicious", meta: { count: denials } });
      }
      return structuredClone(decision);
    });
  }

  async function myProducts(userId: string) {
    return deps.store.read((db) =>
      db.licenses
        .filter((l) => l.userId === userId && !deps.products.find((p) => p.id === l.productId)?.includes?.length)
        .map((l) => {
          const product = productById(l.productId)!;
          const settings = resolveSecurity(db, product);
          const order = l.orderId ? db.orders.find((o) => o.id === l.orderId) : undefined;
          return { license: { ...l, status: effectiveStatus(l, now()) }, product, settings, purchasedAt: order?.paidAt ?? l.activatedAt ?? l.createdAt };
        })
        .filter((x) => x.product)
        .sort((a, b) => b.purchasedAt.localeCompare(a.purchasedAt))
    );
  }

  async function myPurchases(userId: string) {
    return deps.store.read((db) =>
      db.orders
        .filter((o) => o.userId === userId)
        .map((o) => ({ order: structuredClone(o), productIds: db.orderItems.filter((i) => i.orderId === o.id).map((i) => i.productId) }))
        .sort((a, b) => b.order.createdAt.localeCompare(a.order.createdAt))
    );
  }

  async function myDevices(userId: string) {
    return deps.store.read((db) => ({
      devices: db.devices.filter((d) => d.userId === userId && d.status === "trusted").map(({ tokenHash: _t, ...d }) => d),
      sessions: db.sessions.filter((s) => s.userId === userId && isSessionLive(s, now())).map(({ tokenHash: _t, pendingDeviceTokenHash: _p, ...s }) => s),
      limit: resolvePolicy(db).defaultDeviceLimit,
    }));
  }

  async function mySecurityActivity(userId: string, limit = 12) {
    return deps.store.read((db) => db.accessLogs.filter((l) => l.userId === userId && l.event !== "product_open").slice(-limit).reverse());
  }

  // ---------------------------------------------------------------- downloads
  async function createDownloadLink(ctx: SessionContext, productId: string, fileId: string) {
    const d = await checkAccess(ctx, productId, "download");
    if (!d.allowed) return { ok: false as const, reason: d.reason };
    const ttl = await deps.store.read((db) => resolvePolicy(db).downloadLinkSeconds);
    const token = signPayload(deps.secret, { u: ctx.user.id, s: ctx.session.id, p: productId, f: fileId, exp: now().getTime() + ttl * 1000, n: randomToken(8) });
    return { ok: true as const, url: `/api/download/${token}` };
  }

  /** A download link only works for the same signed-in session, before it expires, and after re-checking the license. */
  async function redeemDownload(ctx: SessionContext | null, token: string) {
    const payload = verifySignedPayload<{ u: string; s: string; p: string; f: string; exp: number }>(deps.secret, token);
    if (!payload || payload.exp < now().getTime()) return { ok: false as const, reason: "link_expired" as const };
    if (!ctx || ctx.user.id !== payload.u || ctx.session.id !== payload.s) return { ok: false as const, reason: "not_your_link" as const };
    const d = await checkAccess(ctx, payload.p, "download");
    if (!d.allowed || !d.license) return { ok: false as const, reason: d.allowed ? ("no_license" as const) : d.reason };
    const license = d.license;
    await deps.store.write((db) => {
      db.downloads.push({ id: randomId("dl"), at: iso(), userId: ctx.user.id, productId: payload.p, licenseId: license.id, fileId: payload.f });
      log(db, { event: "download", outcome: "allowed", userId: ctx.user.id, productId: payload.p, licenseId: license.id, deviceId: ctx.session.deviceId, meta: { file: payload.f } });
    });
    return { ok: true as const, productId: payload.p, fileId: payload.f, license, settings: d.settings, user: ctx.user };
  }

  // ---------------------------------------------------------------- admin
  const requireAdmin = (ctx: SessionContext | null) => {
    if (!ctx || !ctx.roles.includes("admin")) throw new Error("FORBIDDEN");
    return ctx;
  };

  async function adminOverview(ctx: SessionContext | null) {
    requireAdmin(ctx);
    return deps.store.read((db) => {
      const count = (s: LicenseStatus) => db.licenses.filter((l) => effectiveStatus(l, now()) === s).length;
      return {
        licenses: { active: count("active"), pending: count("pending"), suspended: count("suspended"), revoked: count("revoked"), expired: count("expired"), unclaimed: db.licenses.filter((l) => !l.userId).length },
        customers: db.users.length,
        orders: db.orders.length,
        suspicious: db.accessLogs.filter((l) => l.outcome === "suspicious").length,
      };
    });
  }

  async function adminLicenses(ctx: SessionContext | null, filter: { q?: string; status?: LicenseStatus | "all" } = {}) {
    requireAdmin(ctx);
    const q = filter.q?.trim().toLowerCase();
    return deps.store.read((db) =>
      db.licenses
        .map((l) => {
          const user = l.userId ? db.users.find((u) => u.id === l.userId) : undefined;
          return {
            license: { ...l, status: effectiveStatus(l, now()) },
            accountEmail: user?.email ?? null,
            userId: user?.id ?? null,
            productName: productById(l.productId)?.name.en ?? l.productId,
            devices: l.userId ? db.devices.filter((d) => d.userId === l.userId && d.status === "trusted").length : 0,
          };
        })
        .filter((r) => !filter.status || filter.status === "all" || r.license.status === filter.status)
        .filter((r) => !q || [r.license.id, r.license.orderId ?? "", r.license.purchaseEmail, r.accountEmail ?? "", r.productName.toLowerCase()].some((v) => v.toLowerCase().includes(q)))
        .sort((a, b) => b.license.createdAt.localeCompare(a.license.createdAt))
        .slice(0, 200)
    );
  }

  async function adminLicenseAction(ctxIn: SessionContext | null, licenseId: string, action: "suspend" | "reactivate" | "revoke", reason: string) {
    const ctx = requireAdmin(ctxIn);
    if (reason.trim().length < 3) return { ok: false as const, reason: "reason_required" as const };
    return deps.store.write((db) => {
      const l = db.licenses.find((x) => x.id === licenseId);
      if (!l) return { ok: false as const, reason: "not_found" as const };
      const targets = [l, ...db.licenses.filter((x) => x.parentLicenseId === l.id)];
      for (const t of targets) {
        if (action === "reactivate") {
          if (t.status !== "suspended") continue;
          t.status = "active";
          t.suspendedAt = undefined;
        } else if (action === "suspend") {
          if (t.status !== "active") continue;
          t.status = "suspended";
          t.suspendedAt = iso();
        } else {
          t.status = "revoked";
          t.revokedAt = iso();
        }
        t.statusReason = reason.trim();
        audit(db, { actorId: ctx.user.id, action: `license_${action}`, entity: "license", entityId: t.id, reason: reason.trim() });
      }
      return { ok: true as const };
    });
  }

  /** Manual grant (support, gifts, recovery). Bound by email: the recipient claims it by verifying that email. */
  async function adminGrant(ctxIn: SessionContext | null, input: { email: string; productId: string; reason: string; locale: Locale }) {
    const ctx = requireAdmin(ctxIn);
    const email = normalizeEmail(input.email);
    const product = productById(input.productId);
    if (!isValidEmail(email) || !product || input.reason.trim().length < 3) return { ok: false as const, reason: "invalid" as const };
    const r = await deps.store.write((db) => {
      const s = resolveSecurity(db, product);
      const user = db.users.find((u) => u.email === email && u.emailVerifiedAt && u.accountStatus === "active");
      const l: License = { id: randomId("lic"), userId: user?.id ?? null, productId: product.id, purchaseEmail: email, status: "pending", licenseType: s.licenseType, source: "admin_grant", createdAt: iso(), deviceIds: [] };
      activateTx(l, s);
      l.statusReason = input.reason.trim();
      db.licenses.push(l);
      audit(db, { actorId: ctx.user.id, action: "license_granted", entity: "license", entityId: l.id, reason: input.reason.trim(), details: { product: product.id, to: maskEmail(email) } });
      return { bound: !!user };
    });
    const names = [product.name[input.locale]];
    await deps.mail(
      email,
      r.bound
        ? emailTemplates.productsReady(input.locale, { orderRef: "-", productNames: names, url: url(`/${input.locale}/account/products`), sandbox: false })
        : emailTemplates.claimProduct(input.locale, { orderRef: "-", productNames: names, url: url(`/${input.locale}/account`), sandbox: false }),
      { kind: "grant" }
    );
    return { ok: true as const };
  }

  async function adminUser(ctxIn: SessionContext | null, userId: string) {
    requireAdmin(ctxIn);
    return deps.store.read((db) => {
      const user = db.users.find((u) => u.id === userId);
      if (!user) return null;
      const { passwordHash: _p, ...safe } = user;
      return {
        user: { ...safe, hasPassword: !!user.passwordHash },
        licenses: db.licenses.filter((l) => l.userId === userId).map((l) => ({ ...l, status: effectiveStatus(l, now()), productName: productById(l.productId)?.name.en ?? l.productId })),
        devices: db.devices.filter((d) => d.userId === userId).map(({ tokenHash: _t, ...d }) => d),
        sessions: db.sessions.filter((s) => s.userId === userId && isSessionLive(s, now())).map(({ tokenHash: _t, pendingDeviceTokenHash: _x, ...s }) => s),
        orders: db.orders.filter((o) => o.userId === userId || o.purchaseEmail === user.email),
        activity: db.accessLogs.filter((l) => l.userId === userId).slice(-40).reverse(),
        audit: db.audit.filter((a) => a.entityId === userId || db.licenses.some((l) => l.userId === userId && l.id === a.entityId)).slice(-40).reverse(),
      };
    });
  }

  async function adminUserAction(
    ctxIn: SessionContext | null,
    userId: string,
    action: { kind: "remove_device"; deviceId: string } | { kind: "revoke_sessions" } | { kind: "set_status"; status: AccountStatus } | { kind: "resend_verification" },
    reason: string
  ) {
    const ctx = requireAdmin(ctxIn);
    if (reason.trim().length < 3) return { ok: false as const, reason: "reason_required" as const };
    if (action.kind === "resend_verification") {
      const u = await deps.store.read((db) => db.users.find((x) => x.id === userId));
      if (!u) return { ok: false as const, reason: "not_found" as const };
      await deps.store.write((db) => audit(db, { actorId: ctx.user.id, action: "recovery_code_sent", entity: "user", entityId: userId, reason }));
      const r = await startVerification({ email: u.email, purpose: "recovery", locale: u.locale, userId });
      return r.ok ? { ok: true as const } : { ok: false as const, reason: r.reason };
    }
    return deps.store.write((db) => {
      const u = db.users.find((x) => x.id === userId);
      if (!u) return { ok: false as const, reason: "not_found" as const };
      if (action.kind === "remove_device") return removeDeviceTx(db, userId, action.deviceId, ctx.user.id, reason) ? { ok: true as const } : { ok: false as const, reason: "not_found" as const };
      if (action.kind === "revoke_sessions") {
        revokeSessionsTx(db, userId, "admin_revoked");
        audit(db, { actorId: ctx.user.id, action: "sessions_revoked", entity: "session", entityId: userId, reason });
        return { ok: true as const };
      }
      u.accountStatus = action.status;
      if (action.status !== "active") revokeSessionsTx(db, userId, "account_" + action.status);
      audit(db, { actorId: ctx.user.id, action: "account_status", entity: "user", entityId: userId, reason, details: { status: action.status } });
      return { ok: true as const };
    });
  }

  async function adminResendAccess(ctxIn: SessionContext | null, orderId: string) {
    const ctx = requireAdmin(ctxIn);
    const r = await deps.store.write((db) => {
      const order = db.orders.find((o) => o.id === orderId);
      if (!order || order.status !== "paid") return null;
      const owner = ownerFor(db, order);
      audit(db, { actorId: ctx.user.id, action: "access_email_resent", entity: "order", entityId: order.id });
      return { order: structuredClone(order), bound: !!owner, token: owner ? null : issueClaimTx(db, order) };
    });
    if (!r) return { ok: false as const };
    await sendAccessEmail(r.order, r.bound, r.token);
    return { ok: true as const };
  }

  async function adminActivity(ctxIn: SessionContext | null, opts: { suspiciousOnly?: boolean; limit?: number } = {}) {
    requireAdmin(ctxIn);
    return deps.store.read((db) => {
      const users = new Map(db.users.map((u) => [u.id, u.email]));
      return db.accessLogs
        .filter((l) => !opts.suspiciousOnly || l.outcome === "suspicious")
        .slice(-(opts.limit ?? 60))
        .reverse()
        .map((l) => ({ ...l, email: l.userId ? (users.get(l.userId) ?? null) : null }));
    });
  }

  async function adminAudit(ctxIn: SessionContext | null, limit = 40) {
    requireAdmin(ctxIn);
    return deps.store.read((db) => db.audit.slice(-limit).reverse());
  }

  async function productSecurityList() {
    return deps.store.read((db) => deps.products.map((p) => ({ product: p, settings: resolveSecurity(db, p), customized: !!db.productSecurity[p.id] })));
  }

  async function productSecurity(productId: string) {
    const p = productById(productId);
    return p ? deps.store.read((db) => resolveSecurity(db, p)) : null;
  }

  async function adminUpdateProductSecurity(ctxIn: SessionContext | null, productId: string, patch: Partial<Omit<ProductSecuritySettings, "productId">>) {
    const ctx = requireAdmin(ctxIn);
    if (!productById(productId)) return { ok: false as const };
    await deps.store.write((db) => {
      db.productSecurity[productId] = { ...db.productSecurity[productId], ...patch };
      audit(db, { actorId: ctx.user.id, action: "product_security_updated", entity: "product_security", entityId: productId, details: Object.fromEntries(Object.entries(patch).map(([k, v]) => [k, v ?? null])) });
    });
    return { ok: true as const };
  }

  async function policy() {
    return deps.store.read((db) => resolvePolicy(db));
  }

  async function adminUpdatePolicy(ctxIn: SessionContext | null, patch: Partial<LicensingPolicy>) {
    const ctx = requireAdmin(ctxIn);
    await deps.store.write((db) => {
      db.policy = { ...db.policy, ...patch };
      audit(db, { actorId: ctx.user.id, action: "policy_updated", entity: "policy", entityId: "global", details: Object.fromEntries(Object.entries(patch)) });
    });
    return { ok: true as const };
  }

  return {
    startVerification,
    describeChallenge,
    resendVerification,
    completeVerification,
    passwordSignIn,
    getSessionContext,
    signOut,
    signOutEverywhere,
    removeDevice,
    authorizePendingDevice,
    setPassword,
    requestEmailChange,
    getClaim,
    startClaim,
    createOrder,
    handlePaymentEvent,
    checkAccess,
    canUserAccessProduct: (userId: string | null, productId: string, opts: { sessionId?: string; deviceId?: string | null; purpose?: "open" | "download" } = {}) =>
      deps.store.read((db) => canUserAccessProduct(db, deps.products, { userId, productId, ...opts, owners }, now())),
    myProducts,
    myPurchases,
    myDevices,
    mySecurityActivity,
    createDownloadLink,
    redeemDownload,
    adminOverview,
    adminLicenses,
    adminLicenseAction,
    adminGrant,
    adminUser,
    adminUserAction,
    adminResendAccess,
    adminActivity,
    adminAudit,
    productSecurityList,
    productSecurity,
    adminUpdateProductSecurity,
    policy,
    adminUpdatePolicy,
  };
}

export type LicensingEngine = ReturnType<typeof createLicensingEngine>;
