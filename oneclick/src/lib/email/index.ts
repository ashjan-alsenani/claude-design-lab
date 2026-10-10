import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { isDemoMode, isEmailConfigured, missingEmailConfig } from "@/lib/env";
import { opsAlert } from "@/lib/ops/alert";
import type { EmailContent } from "./templates";

export type SendResult = { sent: true; id: string } | { sent: false; reason: "not_connected" | "error" };

/**
 * Email adapter: Resend (https://resend.com) when EMAIL_PROVIDER=resend, RESEND_API_KEY and
 * EMAIL_FROM are set. Without a provider, demo mode writes to the development mailbox and
 * production sends nothing. Every production failure is logged and pushed to the owner through
 * opsAlert (a channel that does not need this email service). Logs and alerts name only the
 * message kind, the HTTP status and Resend's error name/message or the missing setting names:
 * never the recipient, the body (which can hold sign-in codes) or a key.
 */
export async function sendEmail(to: string, content: EmailContent, meta: { kind?: string } = {}): Promise<SendResult> {
  if (!isEmailConfigured()) {
    if (isDemoMode()) {
      await writeOutbox(to, content, meta.kind ?? "general");
      return { sent: true, id: "dev-mailbox" };
    }
    const missing = missingEmailConfig().join(", ");
    console.error(`email: not sent (${kind(meta)}): email is not configured, missing ${missing}`);
    await opsAlert("email:not_configured", "One Click: emails are not being sent", `Email is not configured on the live site (missing: ${missing}). Sign-in codes cannot be delivered.\nالإيميل غير مضبوط في الموقع (ناقص: ${missing})، ورموز الدخول ما توصل.`);
    return { sent: false, reason: "not_connected" };
  }
  try {
    const res = await fetch(`${(process.env.RESEND_API_URL || "https://api.resend.com").replace(/\/+$/, "")}/emails`, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to: [to],
        subject: content.subject,
        html: content.html,
        text: content.text,
        ...(process.env.EMAIL_REPLY_TO ? { reply_to: process.env.EMAIL_REPLY_TO } : {}),
        tags: [{ name: "kind", value: (meta.kind ?? "general").replace(/[^A-Za-z0-9_-]/g, "_") }],
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      // Resend's error name and message describe configuration problems (sender, key, domain), never
      // the message content, so they are safe to log and make failures diagnosable.
      const err = (await res.json().catch(() => ({}))) as { name?: string; message?: string };
      const detail = `Resend responded ${res.status} ${err.name ?? ""}: ${(err.message ?? "").slice(0, 200)}`;
      console.error(`email: not sent (${kind(meta)}): ${detail}`);
      await opsAlert(`email:resend_${res.status}`, "One Click: email sending failed", `${detail}\nKind: ${kind(meta)}\nفشل إرسال الإيميل من الموقع.`);
      return { sent: false, reason: "error" };
    }
    const body = (await res.json().catch(() => ({}))) as { id?: string };
    return { sent: true, id: body.id ?? "" };
  } catch (e) {
    const why = e instanceof Error ? e.name : "unknown";
    console.error(`email: not sent (${kind(meta)}): Resend request failed (${why})`);
    await opsAlert("email:unreachable", "One Click: email service unreachable", `Could not reach Resend (${why}). Kind: ${kind(meta)}\nتعذّر الوصول لخدمة الإيميل.`);
    return { sent: false, reason: "error" };
  }
}

const kind = (meta: { kind?: string }) => (meta.kind ?? "general").replace(/[^A-Za-z0-9_-]/g, "_");

export { emailTemplates } from "./templates";

export type OutboxMessage = { id: string; at: string; to: string; kind: string; subject: string; text: string; html: string };
const OUTBOX = path.join(process.cwd(), ".data", "outbox.jsonl");

/**
 * DEVELOPMENT MAILBOX (demo mode only): stands in for a real inbox so the full
 * purchase -> email -> verification flow can be tested locally. Git-ignored, never
 * used in production. Nothing is printed to the server log. Messages are appended one per line,
 * so emails sent at the same moment from different server workers never overwrite each other.
 */
async function writeOutbox(to: string, content: EmailContent, kind: string) {
  const msg: OutboxMessage = { id: Math.random().toString(36).slice(2), at: new Date().toISOString(), to, kind, ...content };
  await fs.mkdir(path.dirname(OUTBOX), { recursive: true });
  await fs.appendFile(OUTBOX, JSON.stringify(msg) + "\n");
}

export async function readOutbox(): Promise<OutboxMessage[]> {
  if (!isDemoMode()) return [];
  try {
    const lines = (await fs.readFile(OUTBOX, "utf8")).split("\n").filter(Boolean);
    return lines.slice(-500).map((l) => JSON.parse(l) as OutboxMessage);
  } catch {
    return [];
  }
}
