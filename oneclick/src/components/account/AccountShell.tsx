import Link from "next/link";
import type { ReactNode } from "react";
import { DeviceMobileIcon, HeadsetIcon, HeartIcon, ReceiptIcon, ShieldCheckIcon, SignOutIcon, SquaresFourIcon } from "@phosphor-icons/react/dist/ssr";
import type { Locale } from "@/i18n/config";
import { licensingCopy } from "@/i18n/licensing";
import { signOutAction } from "@/app/[locale]/account/actions";
import { SandboxBanner } from "./SandboxBanner";

export type AccountSection = "products" | "purchases" | "devices" | "security";

/** Customer area layout: My Products, My Purchases, My Devices, Security & settings. */
export function AccountShell({ locale, current, sandbox, email, children }: { locale: Locale; current: AccountSection; sandbox: boolean; email: string; children: ReactNode }) {
  const t = licensingCopy[locale];
  const nav = [
    { key: "products", icon: SquaresFourIcon, label: t.nav.products, href: `/${locale}/account/products` },
    { key: "purchases", icon: ReceiptIcon, label: t.nav.purchases, href: `/${locale}/account/purchases` },
    { key: "devices", icon: DeviceMobileIcon, label: t.nav.devices, href: `/${locale}/account/devices` },
    { key: "security", icon: ShieldCheckIcon, label: t.nav.security, href: `/${locale}/account/security` },
    { key: "favorites", icon: HeartIcon, label: t.nav.favorites, href: `/${locale}/favorites` },
    { key: "support", icon: HeadsetIcon, label: t.nav.support, href: `/${locale}/contact?topic=order` },
  ];
  return (
    <div className="mx-auto max-w-7xl px-4 pb-6 pt-8 sm:px-6 lg:px-8">
      {sandbox && <SandboxBanner locale={locale} />}
      <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
        <nav aria-label={t.nav.account} className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <p className="mb-3 hidden truncate px-3 text-sm text-muted lg:block" dir="ltr">
            {email}
          </p>
          <ul className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:px-0">
            {nav.map((n) => (
              <li key={n.key}>
                <Link
                  href={n.href}
                  aria-current={n.key === current ? "page" : undefined}
                  className="flex items-center gap-3 whitespace-nowrap rounded-[var(--radius-md)] px-3 py-2.5 text-sm text-ink-soft hover:bg-bg-sunken aria-[current=page]:bg-surface aria-[current=page]:font-semibold aria-[current=page]:text-ink aria-[current=page]:shadow-soft"
                >
                  <n.icon size={18} weight={n.key === current ? "fill" : "regular"} />
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <form action={signOutAction}>
                <input type="hidden" name="locale" value={locale} />
                <button className="flex w-full items-center gap-3 whitespace-nowrap rounded-[var(--radius-md)] px-3 py-2.5 text-sm text-ink-soft hover:bg-bg-sunken">
                  <SignOutIcon size={18} className="flip-rtl" />
                  {t.nav.signOut}
                </button>
              </form>
            </li>
          </ul>
        </nav>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
