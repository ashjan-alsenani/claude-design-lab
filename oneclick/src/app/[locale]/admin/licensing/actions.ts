"use server";

import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { isLocale, type Locale } from "@/i18n/config";
import { currentContext, licensing } from "@/lib/licensing/server";

/**
 * Admin licensing actions. Each one: re-checks the admin role on the server (engine
 * throws FORBIDDEN otherwise), requires a written reason for destructive changes plus an
 * explicit confirmation checkbox, and is written to the audit log by the engine.
 */
const s = (fd: FormData, k: string) => {
  const v = fd.get(k);
  return typeof v === "string" ? v.trim().slice(0, 500) : "";
};

async function admin(fd: FormData) {
  const l = s(fd, "locale");
  const locale: Locale = isLocale(l) ? l : "en";
  const ctx = await currentContext();
  if (!ctx?.roles.includes("admin")) notFound();
  return { ctx, locale, back: (q: string) => `${s(fd, "back").startsWith(`/${locale}/admin/`) ? s(fd, "back").split("?")[0] : `/${locale}/admin/licensing`}?${q}` };
}

export async function licenseAction(fd: FormData) {
  const { ctx, back } = await admin(fd);
  const action = z.enum(["suspend", "reactivate", "revoke"]).safeParse(s(fd, "action"));
  if (!action.success || fd.get("confirm") !== "on") redirect(back("e=confirm"));
  const r = await licensing().engine.adminLicenseAction(ctx, s(fd, "licenseId"), action.data, s(fd, "reason"));
  redirect(back(r.ok ? "ok=license" : `e=${r.reason}`));
}

export async function grantAction(fd: FormData) {
  const { ctx, locale, back } = await admin(fd);
  const r = await licensing().engine.adminGrant(ctx, { email: s(fd, "email"), productId: s(fd, "productId"), reason: s(fd, "reason"), locale });
  redirect(back(r.ok ? "ok=granted" : "e=invalid"));
}

export async function userAction(fd: FormData) {
  const { ctx, back } = await admin(fd);
  const kind = s(fd, "kind");
  if (kind !== "resend_verification" && fd.get("confirm") !== "on") redirect(back("e=confirm"));
  const action =
    kind === "remove_device"
      ? ({ kind, deviceId: s(fd, "deviceId") } as const)
      : kind === "revoke_sessions"
        ? ({ kind } as const)
        : kind === "resend_verification"
          ? ({ kind } as const)
          : ({ kind: "set_status", status: z.enum(["active", "suspended"]).parse(s(fd, "status")) } as const);
  const r = await licensing().engine.adminUserAction(ctx, s(fd, "userId"), action, s(fd, "reason") || (kind === "resend_verification" ? "support recovery" : ""));
  redirect(back(r.ok ? "ok=user" : `e=${r.reason}`));
}

export async function resendAccessAction(fd: FormData) {
  const { ctx, back } = await admin(fd);
  const r = await licensing().engine.adminResendAccess(ctx, s(fd, "orderId"));
  redirect(back(r.ok ? "ok=resent" : "e=not_paid"));
}

const optionalInt = (min: number, max: number) =>
  z.preprocess((v) => (v === "" || v === null || v === undefined ? null : Number(v)), z.number().int().min(min).max(max).nullable());

const productSchema = z.object({
  accessType: z.enum(["INTERACTIVE_PRIVATE", "SECURE_DOWNLOAD", "HYBRID", "PUBLIC_FREE", "CUSTOM_SERVICE"]),
  deviceLimit: optionalInt(1, 20),
  licenseType: z.enum(["personal", "commercial", "team"]),
  downloadEnabled: z.boolean(),
  downloadLimit: optionalInt(1, 1000),
  watermark: z.boolean(),
  licenseDurationDays: optionalInt(1, 3650),
  status: z.enum(["active", "paused"]),
});

export async function productSecurityAction(fd: FormData) {
  const { ctx, back } = await admin(fd);
  const parsed = productSchema.safeParse({
    accessType: s(fd, "accessType"),
    deviceLimit: s(fd, "deviceLimit"),
    licenseType: s(fd, "licenseType"),
    downloadEnabled: fd.get("downloadEnabled") === "on",
    downloadLimit: s(fd, "downloadLimit"),
    watermark: fd.get("watermark") === "on",
    licenseDurationDays: s(fd, "licenseDurationDays"),
    status: s(fd, "status"),
  });
  if (!parsed.success) redirect(back("tab=products&e=invalid"));
  await licensing().engine.adminUpdateProductSecurity(ctx, s(fd, "productId"), parsed.data);
  redirect(back(`tab=products&ok=saved#${s(fd, "productId")}`));
}

const policySchema = z.object({
  defaultDeviceLimit: z.coerce.number().int().min(1).max(20),
  maxActiveSessions: z.coerce.number().int().min(1).max(50),
  sessionDays: z.coerce.number().int().min(1).max(365),
  otpTtlMinutes: z.coerce.number().int().min(3).max(30),
  otpMaxAttempts: z.coerce.number().int().min(3).max(10),
  otpPerEmailPerHour: z.coerce.number().int().min(3).max(20),
  claimLinkDays: z.coerce.number().int().min(1).max(90),
  downloadLinkSeconds: z.coerce.number().int().min(30).max(3600),
  onRefund: z.enum(["revoke", "suspend"]),
  onChargeback: z.enum(["revoke", "suspend"]),
  onCancel: z.enum(["revoke", "suspend"]),
});

export async function policyAction(fd: FormData) {
  const { ctx, back } = await admin(fd);
  const parsed = policySchema.safeParse(Object.fromEntries(Object.keys(policySchema.shape).map((k) => [k, s(fd, k)])));
  if (!parsed.success) redirect(back("tab=policy&e=invalid"));
  await licensing().engine.adminUpdatePolicy(ctx, parsed.data);
  redirect(back("tab=policy&ok=saved"));
}
