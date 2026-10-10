import "server-only";

/**
 * Owner alerts that do not depend on the site's own email service, so a broken email setup can
 * still be reported. OPS_ALERT_URL is an ntfy topic URL (https://ntfy.sh/<private-topic>, free;
 * the owner subscribes in the ntfy phone app). Alerts carry only what failed and why: never a
 * recipient, a code, a message body or a secret. Repeats of the same alert are held back for
 * ALERT_QUIET_MS per server instance so one outage sends a few pushes, not hundreds.
 */
export const ALERT_QUIET_MS = 30 * 60 * 1000;
const lastSent = new Map<string, number>();

export async function opsAlert(key: string, title: string, message: string): Promise<boolean> {
  const url = process.env.OPS_ALERT_URL;
  if (!url || !url.startsWith("https://")) return false;
  const now = Date.now();
  const prev = lastSent.get(key);
  if (prev !== undefined && now - prev < ALERT_QUIET_MS) return false;
  lastSent.set(key, now);
  try {
    const res = await fetch(url, {
      method: "POST",
      // ntfy reads Title/Priority/Tags from headers; header values must stay ASCII.
      headers: { Title: title.replace(/[^\x20-\x7E]/g, ""), Priority: "high", Tags: "warning", "Content-Type": "text/plain; charset=utf-8" },
      body: message,
      signal: AbortSignal.timeout(5_000),
    });
    if (!res.ok) console.error(`ops-alert: alert service responded ${res.status}`);
    return res.ok;
  } catch {
    console.error("ops-alert: alert service unreachable");
    return false;
  }
}

/** Test hook: forget throttling state. */
export function resetOpsAlertThrottle() {
  lastSent.clear();
}
