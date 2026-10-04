import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { isDemoMode, isEmailConfigured } from "@/lib/env";
import type { EmailContent } from "./templates";

export type SendResult = { sent: true; id: string } | { sent: false; reason: "not_connected" | "error" };

/**
 * Email adapter: Resend (https://resend.com) when EMAIL_PROVIDER=resend, RESEND_API_KEY and
 * EMAIL_FROM are set. Without a provider, demo mode writes to the development mailbox and
 * production sends nothing. Failures are reported by status only; message bodies (which can hold
 * sign-in codes and personal data) are never logged.
 */
export async function sendEmail(to: string, content: EmailContent, meta: { kind?: string } = {}): Promise<SendResult> {
  if (!isEmailConfigured()) {
    if (isDemoMode()) {
      await writeOutbox(to, content, meta.kind ?? "general");
      return { sent: true, id: "dev-mailbox" };
    }
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
      console.error(`email: Resend responded ${res.status} (${meta.kind ?? "general"}) ${err.name ?? ""}: ${(err.message ?? "").slice(0, 200)}`);
      return { sent: false, reason: "error" };
    }
    const body = (await res.json().catch(() => ({}))) as { id?: string };
    return { sent: true, id: body.id ?? "" };
  } catch {
    console.error(`email: Resend request failed (${meta.kind ?? "general"})`);
    return { sent: false, reason: "error" };
  }
}

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
