import Link from "next/link";
import { FlaskIcon } from "@phosphor-icons/react/dist/ssr";
import type { Locale } from "@/i18n/config";
import { licensingCopy } from "@/i18n/licensing";
import { licensingMode } from "@/lib/licensing/server";

/** Shown only in the local sandbox; renders nothing when real accounts are connected. */
export function SandboxBanner({ locale }: { locale: Locale }) {
  if (licensingMode() !== "sandbox") return null;
  const t = licensingCopy[locale];
  return (
    <p role="note" className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-[var(--radius-md)] border-2 border-dashed border-warning/60 bg-accent-soft px-4 py-3 text-sm text-ink-soft">
      <FlaskIcon size={18} weight="duotone" className="shrink-0 text-warning" />
      <span className="font-semibold text-ink">{t.sandbox}</span>
      <Link href={`/${locale}/dev/mailbox`} className="font-medium text-primary underline underline-offset-4">
        {t.mailboxLink}
      </Link>
    </p>
  );
}
