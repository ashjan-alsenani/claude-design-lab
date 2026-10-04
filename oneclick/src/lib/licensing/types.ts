/**
 * One Click Digital Product Licensing & Access Engine: domain model.
 *
 * Core rule: THE PRODUCT BELONGS TO THE CUSTOMER ACCOUNT, NOT THE URL.
 * Ownership lives only in server-side records (licenses bound to a verified account).
 * URLs, links, cookies and browser storage never prove ownership on their own.
 *
 * Mirrors supabase/migrations/20261003000000_licensing_engine.sql.
 */
import type { LicenseType } from "@/lib/commerce/types";
import type { Money } from "@/lib/money";

export type { LicenseType };
export type Role = "customer" | "admin" | "owner";

export type AccountStatus = "pending_verification" | "active" | "suspended" | "closed";
export type LicenseStatus = "pending" | "active" | "suspended" | "revoked" | "expired";
export type LicenseSource = "purchase" | "free" | "admin_grant" | "bundle";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded" | "chargeback" | "cancelled";

/** How a product is delivered. Set per product in Admin, never in product code. */
export type AccessType = "INTERACTIVE_PRIVATE" | "SECURE_DOWNLOAD" | "HYBRID" | "PUBLIC_FREE" | "CUSTOM_SERVICE";

export type ProductSecuritySettings = {
  productId: string;
  accessType: AccessType;
  /** null = use the global default device limit. */
  deviceLimit: number | null;
  licenseType: LicenseType;
  downloadEnabled: boolean;
  /** null = unlimited downloads per license. */
  downloadLimit: number | null;
  watermark: boolean;
  /** null = lifetime access. */
  licenseDurationDays: number | null;
  /** "paused" temporarily stops opening the product for everyone (maintenance). */
  status: "active" | "paused";
};

/** Global business rules, editable in Admin. */
export type LicensingPolicy = {
  defaultDeviceLimit: number;
  maxActiveSessions: number;
  sessionDays: number;
  otpTtlMinutes: number;
  otpMaxAttempts: number;
  otpPerEmailPerHour: number;
  claimLinkDays: number;
  downloadLinkSeconds: number;
  onRefund: "revoke" | "suspend";
  onChargeback: "revoke" | "suspend";
  onCancel: "revoke" | "suspend";
};

export type User = {
  id: string;
  /** Normalized (trimmed, lower-case). */
  email: string;
  name?: string;
  accountStatus: AccountStatus;
  emailVerifiedAt?: string;
  passwordHash?: string;
  locale: "en" | "ar";
  createdAt: string;
  /** Previous addresses; every change is verified and audit-logged. */
  emailHistory: { email: string; changedAt: string }[];
};

export type LOrder = {
  id: string; // public reference, e.g. OC-7K3M9Q
  userId: string | null; // null for guest purchases until claimed
  purchaseEmail: string; // normalized; never changes after purchase
  status: PaymentStatus;
  currency: Money["currency"];
  totalMinor: number;
  provider: string;
  externalPaymentReference?: string;
  sandbox: boolean;
  locale: "en" | "ar";
  createdAt: string;
  paidAt?: string;
};

export type LOrderItem = { id: string; orderId: string; productId: string; unitPriceMinor: number; licenseType: LicenseType };

export type License = {
  id: string;
  userId: string | null; // null = pending account claim (guest purchase)
  productId: string;
  orderId?: string;
  orderItemId?: string;
  /** Set on licenses created from a bundle license. */
  parentLicenseId?: string;
  purchaseEmail: string;
  status: LicenseStatus;
  licenseType: LicenseType;
  source: LicenseSource;
  createdAt: string;
  activatedAt?: string;
  suspendedAt?: string;
  revokedAt?: string;
  expiresAt?: string;
  claimedAt?: string;
  statusReason?: string;
  /** Devices this license was opened on (for per-product device limits). */
  deviceIds: string[];
};

export type Device = {
  id: string;
  userId: string;
  /** HMAC of the random device cookie value. The raw value only lives in an HttpOnly cookie. */
  tokenHash: string;
  name: string; // e.g. "Chrome on iPhone"
  platform: "ios" | "android" | "mac" | "windows" | "linux" | "other";
  firstVerifiedAt: string;
  lastUsedAt: string;
  status: "trusted" | "removed";
};

export type UserSession = {
  id: string;
  userId: string;
  tokenHash: string;
  deviceId: string | null;
  /** "pending" = signed in but this device is not authorized yet (device limit reached). */
  deviceState: "trusted" | "pending";
  createdAt: string;
  lastSeenAt: string;
  expiresAt: string;
  /** When email ownership was last proven in this session (for sensitive changes). */
  verifiedAt?: string;
  revokedAt?: string;
  revokedReason?: string;
  /** Device cookie hash waiting for authorization (set while deviceState is "pending"). */
  pendingDeviceTokenHash?: string;
};

export type ChallengePurpose = "signin" | "claim" | "new_device" | "email_change" | "recovery";

export type Challenge = {
  id: string;
  email: string;
  purpose: ChallengePurpose;
  /** HMAC(secret, id:code). The code itself is never stored or logged. */
  codeHash: string;
  createdAt: string;
  expiresAt: string;
  attempts: number;
  consumedAt?: string;
  lockedAt?: string;
  userId?: string;
  newEmail?: string;
};

export type ClaimLink = {
  id: string;
  tokenHash: string;
  orderId: string;
  purchaseEmail: string;
  createdAt: string;
  expiresAt: string;
  lastUsedAt?: string;
};

export type AccessEvent =
  | "product_open"
  | "download"
  | "signin"
  | "signin_failed"
  | "signout"
  | "verification_sent"
  | "verification_email_failed"
  | "verification_failed"
  | "verification_locked"
  | "device_added"
  | "device_removed"
  | "device_pending"
  | "session_revoked"
  | "license_claimed"
  | "license_activated"
  | "payment_event"
  | "concurrent_use"
  | "repeated_denials"
  | "rate_limited"
  | "email_changed"
  | "password_set";

export type AccessLog = {
  id: string;
  at: string;
  event: AccessEvent;
  outcome: "allowed" | "denied" | "info" | "suspicious";
  userId?: string | null;
  productId?: string;
  licenseId?: string;
  deviceId?: string | null;
  reason?: string;
  meta?: Record<string, string | number | boolean | null>;
};

export type AuditEntry = {
  id: string;
  at: string;
  actorId: string; // user id, or "system"
  action: string;
  entity: "license" | "device" | "session" | "user" | "order" | "product_security" | "policy";
  entityId: string;
  reason?: string;
  details?: Record<string, string | number | boolean | null>;
};

export type PaymentEventRecord = { provider: string; eventId: string; orderId: string; type: string; receivedAt: string; outcome: string };

export type DownloadRecord = { id: string; at: string; userId: string; productId: string; licenseId: string; fileId: string };

export type LicensingDb = {
  version: 1;
  users: User[];
  orders: LOrder[];
  orderItems: LOrderItem[];
  licenses: License[];
  devices: Device[];
  sessions: UserSession[];
  challenges: Challenge[];
  claims: ClaimLink[];
  paymentEvents: PaymentEventRecord[];
  accessLogs: AccessLog[];
  audit: AuditEntry[];
  downloads: DownloadRecord[];
  productSecurity: Record<string, Partial<Omit<ProductSecuritySettings, "productId">>>;
  policy: Partial<LicensingPolicy>;
};

export function emptyDb(): LicensingDb {
  return {
    version: 1,
    users: [],
    orders: [],
    orderItems: [],
    licenses: [],
    devices: [],
    sessions: [],
    challenges: [],
    claims: [],
    paymentEvents: [],
    accessLogs: [],
    audit: [],
    downloads: [],
    productSecurity: {},
    policy: {},
  };
}

/** Why access was denied. Mapped to friendly, non-revealing copy in the UI. */
export type DenyReason =
  | "not_signed_in"
  | "session_invalid"
  | "account_unverified"
  | "account_suspended"
  | "product_not_found"
  | "product_paused"
  | "custom_service"
  | "open_not_supported"
  | "no_license"
  | "license_pending"
  | "license_suspended"
  | "license_revoked"
  | "license_expired"
  | "device_not_authorized"
  | "device_limit"
  | "download_not_available"
  | "download_limit";

export type AccessDecision =
  | { allowed: true; reason: "licensed" | "public_free" | "owner"; license?: License; settings: ProductSecuritySettings }
  | { allowed: false; reason: DenyReason; settings?: ProductSecuritySettings };
