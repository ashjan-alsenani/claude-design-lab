import type { Product } from "@/content/types";
import type { AccessType, LicensingDb, LicensingPolicy, ProductSecuritySettings } from "./types";

/** Defaults for the global business rules. Admin overrides are stored in the database. */
export const defaultPolicy: LicensingPolicy = {
  defaultDeviceLimit: 2,
  maxActiveSessions: 5,
  sessionDays: 30,
  otpTtlMinutes: 10,
  otpMaxAttempts: 5,
  otpPerEmailPerHour: 5,
  claimLinkDays: 14,
  downloadLinkSeconds: 120,
  onRefund: "revoke",
  onChargeback: "suspend",
  onCancel: "revoke",
};

export function resolvePolicy(db: Readonly<LicensingDb>): LicensingPolicy {
  return { ...defaultPolicy, ...db.policy };
}

/**
 * Products whose default delivery is HYBRID (interactive app + personalized printable).
 * Everything else derives its access type from the product kind. All of it can be
 * changed per product in Admin without touching code.
 */
const hybridByDefault = new Set(["prd_bride", "prd_planner"]);

export function defaultAccessType(p: Product): AccessType {
  if (p.price === null) return "PUBLIC_FREE";
  if (p.kind === "custom-service") return "CUSTOM_SERVICE";
  if (p.kind === "download") return "SECURE_DOWNLOAD";
  if (hybridByDefault.has(p.id)) return "HYBRID";
  return "INTERACTIVE_PRIVATE";
}

export function defaultSecurity(p: Product): ProductSecuritySettings {
  const accessType = defaultAccessType(p);
  return {
    productId: p.id,
    accessType,
    deviceLimit: null,
    licenseType: "personal",
    downloadEnabled: accessType === "SECURE_DOWNLOAD" || accessType === "HYBRID",
    downloadLimit: null,
    watermark: true,
    licenseDurationDays: p.access === "limited" ? 365 : null,
    status: "active",
  };
}

export function resolveSecurity(db: Readonly<LicensingDb>, p: Product): ProductSecuritySettings {
  return { ...defaultSecurity(p), ...db.productSecurity[p.id], productId: p.id };
}

export const opensInteractive = (t: AccessType) => t === "INTERACTIVE_PRIVATE" || t === "HYBRID";
export const offersDownloads = (s: ProductSecuritySettings) => s.downloadEnabled && (s.accessType === "SECURE_DOWNLOAD" || s.accessType === "HYBRID");
