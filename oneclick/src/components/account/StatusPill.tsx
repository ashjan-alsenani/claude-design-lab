const tones = {
  good: "bg-[color-mix(in_oklab,var(--oc-success)_16%,transparent)] text-success",
  warn: "bg-accent-soft text-warning",
  bad: "bg-[color-mix(in_oklab,var(--oc-error)_12%,transparent)] text-error",
  muted: "bg-bg-sunken text-muted",
} as const;

export function StatusPill({ tone, children }: { tone: keyof typeof tones; children: React.ReactNode }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

export const licenseTone = (s: string): keyof typeof tones => (s === "active" ? "good" : s === "pending" || s === "suspended" ? "warn" : s === "revoked" ? "bad" : "muted");
