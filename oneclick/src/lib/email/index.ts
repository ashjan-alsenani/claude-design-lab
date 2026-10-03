import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { isDemoMode, isEmailConfigured } from "@/lib/env";
import type { EmailContent } from "./templates";

export type SendResult = { sent: true; id: string } | { sent: false; reason: "not_connected" | "error" };

/**
 * Email adapter. STATUS: NOT CONNECTED (provider to be approved, see COSTS.md).
 * Until connected, emails are not sent; in development the subject line is logged
 * (never the body, which may contain personal data).
 */
export async function sendEmail(to: string, content: EmailContent, meta: { kind?: string } = {}): Promise<SendResult> {
  if (!isEmailConfigured()) {
    if (isDemoMode()) {
      await writeOutbox(to, content, meta.kind ?? "general");
      return { sent: true, id: "dev-mailbox" };
    }
    return { sent: false, reason: "not_connected" };
  }
  // Provider implementation goes here (e.g. Resend/Postmark/SES adapter).
  void to;
  return { sent: false, reason: "not_connected" };
}

export { emailTemplates } from "./templates";

export type OutboxMessage = { id: string; at: string; to: string; kind: string; subject: string; text: string; html: string };
const OUTBOX = path.join(process.cwd(), ".data", "outbox.json");
let outboxQueue: Promise<unknown> = Promise.resolve();

/**
 * DEVELOPMENT MAILBOX (demo mode only): stands in for a real inbox so the full
 * purchase -> email -> verification flow can be tested locally. Git-ignored, never
 * used in production. Nothing is printed to the server log.
 */
async function writeOutbox(to: string, content: EmailContent, kind: string) {
  const run = outboxQueue.then(async () => {
    const all = await readOutbox();
    all.push({ id: Math.random().toString(36).slice(2), at: new Date().toISOString(), to, kind, ...content });
    await fs.mkdir(path.dirname(OUTBOX), { recursive: true });
    await fs.writeFile(OUTBOX, JSON.stringify(all.slice(-200)));
  });
  outboxQueue = run.catch(() => undefined);
  return run;
}

export async function readOutbox(): Promise<OutboxMessage[]> {
  if (!isDemoMode()) return [];
  try {
    return JSON.parse(await fs.readFile(OUTBOX, "utf8"));
  } catch {
    return [];
  }
}
