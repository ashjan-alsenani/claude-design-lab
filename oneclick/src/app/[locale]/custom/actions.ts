"use server";

import { headers } from "next/headers";
import { customRequestSchema, formDataToObject, zodFieldErrors, type FieldErrors } from "@/lib/forms/schemas";
import { getLeadStore } from "@/lib/data/leads";
import { newReference } from "@/lib/commerce/types";
import { clientKey, rateLimit } from "@/lib/security/rate-limit";
import { isDemoMode } from "@/lib/env";
import { emailTemplates, sendEmail } from "@/lib/email";
import { localeUrl } from "@/lib/seo";

export type CustomRequestState =
  | { status: "idle" }
  | { status: "invalid"; errors: FieldErrors }
  | { status: "rate_limited" }
  | { status: "error" }
  | { status: "ok"; reference: string; mode: "local-demo" | "database" };

export async function submitCustomRequest(_prev: CustomRequestState, formData: FormData): Promise<CustomRequestState> {
  const h = await headers();
  const limit = rateLimit(`custom:${clientKey(h)}`, isDemoMode() ? 100 : 5, 10 * 60 * 1000);
  if (!limit.ok) return { status: "rate_limited" };

  const parsed = customRequestSchema.safeParse(formDataToObject(formData, ["languages"]));
  if (!parsed.success) {
    const errors = zodFieldErrors(parsed.error);
    // Honeypot hit: pretend success without storing anything.
    if (errors.website) return { status: "ok", reference: "OC-REQ-RECEIVED", mode: "local-demo" };
    return { status: "invalid", errors };
  }
  const { website: _hp, privacy: _p, ...data } = parsed.data;
  void _hp;
  void _p;

  const store = getLeadStore();
  if (store.mode === "unavailable") return { status: "error" };

  const reference = newReference("REQ");
  try {
    await store.save({ kind: "custom_request", reference, createdAt: new Date().toISOString(), status: "new", data });
  } catch (e) {
    console.error("[custom_request] save failed", (e as Error).message);
    return { status: "error" };
  }

  // Notifications (not connected yet: these no-op safely and are logged in dev).
  await Promise.allSettled([
    sendEmail(data.email, emailTemplates.customRequestConfirmation(data.locale, { name: data.name, reference })),
    process.env.OWNER_NOTIFICATION_EMAIL
      ? sendEmail(
          process.env.OWNER_NOTIFICATION_EMAIL,
          emailTemplates.ownerNotification({
            kind: "custom solution request",
            reference,
            summary: `${data.solutionType} · budget ${data.budget} · ${data.name}`,
            adminUrl: localeUrl("en", "/admin/requests"),
          })
        )
      : Promise.resolve(),
  ]);

  return { status: "ok", reference, mode: store.mode };
}
