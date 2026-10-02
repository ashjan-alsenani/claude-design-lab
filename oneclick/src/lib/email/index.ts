import "server-only";
import { isEmailConfigured } from "@/lib/env";
import type { EmailContent } from "./templates";

export type SendResult = { sent: true; id: string } | { sent: false; reason: "not_connected" | "error" };

/**
 * Email adapter. STATUS: NOT CONNECTED (provider to be approved, see COSTS.md).
 * Until connected, emails are not sent; in development the subject line is logged
 * (never the body, which may contain personal data).
 */
export async function sendEmail(to: string, content: EmailContent): Promise<SendResult> {
  if (!isEmailConfigured()) {
    if (process.env.NODE_ENV === "development") console.info(`[email:not-connected] would send "${content.subject}"`);
    return { sent: false, reason: "not_connected" };
  }
  // Provider implementation goes here (e.g. Resend/Postmark/SES adapter).
  void to;
  return { sent: false, reason: "not_connected" };
}

export { emailTemplates } from "./templates";
