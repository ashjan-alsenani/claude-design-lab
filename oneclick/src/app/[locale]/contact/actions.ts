"use server";

import { headers } from "next/headers";
import { contactSchema, formDataToObject, zodFieldErrors, type FieldErrors } from "@/lib/forms/schemas";
import { getLeadStore, ownerNotifyAddress } from "@/lib/data/leads";
import { localeUrl } from "@/lib/seo";
import { newReference } from "@/lib/commerce/types";
import { clientKey, rateLimit } from "@/lib/security/rate-limit";
import { isDemoMode } from "@/lib/env";
import { emailTemplates, sendEmail } from "@/lib/email";

export type ContactState =
  | { status: "idle" }
  | { status: "invalid"; errors: FieldErrors }
  | { status: "rate_limited" }
  | { status: "error" }
  | { status: "ok"; reference: string };

export async function submitContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const h = await headers();
  if (!rateLimit(`contact:${clientKey(h)}`, isDemoMode() ? 100 : 5, 10 * 60 * 1000).ok) return { status: "rate_limited" };
  const parsed = contactSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    const errors = zodFieldErrors(parsed.error);
    if (errors.website) return { status: "ok", reference: "SUP-RECEIVED" };
    return { status: "invalid", errors };
  }
  const { website: _hp, privacy: _p, ...data } = parsed.data;
  void _hp;
  void _p;
  const store = getLeadStore();
  if (store.mode === "unavailable") return { status: "error" };
  const reference = newReference("SUP");
  try {
    await store.save({ kind: "support_request", reference, createdAt: new Date().toISOString(), status: "open", data });
  } catch (e) {
    console.error("[support_request] save failed", (e as Error).message);
    return { status: "error" };
  }
  const owner = ownerNotifyAddress();
  await Promise.allSettled([
    sendEmail(data.email, emailTemplates.supportConfirmation(data.locale, { reference })),
    owner
      ? sendEmail(
          owner,
          emailTemplates.ownerNotification({ kind: `support message (${data.topic})`, reference, summary: `${data.name}: ${data.message.slice(0, 140)}`, adminUrl: localeUrl("en", "/admin/inbox") }),
          { kind: "owner_notification" }
        )
      : Promise.resolve(),
  ]);
  return { status: "ok", reference };
}
