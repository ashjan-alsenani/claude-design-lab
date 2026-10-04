import Link from "next/link";
import type { ReactNode } from "react";
import { DeviceMobileIcon, HeadsetIcon, HeartIcon, ReceiptIcon, ShieldCheckIcon, SignOutIcon, SquaresFourIcon, UserCircleIcon } from "@phosphor-icons/react/dist/ssr";
import type { Locale } from "@/i18n/config";
import { licensingCopy } from "@/i18n/licensing";
import { signOutAction } from "@/app/[locale]/account/actions";
import type { Avatar } from "@/lib/profile";
import { SandboxBanner } from "./SandboxBanner";
import { UserAvatar } from "./UserAvatar";

export type AccountSection = "products" | "purchases" | "devices" | "profile" | "security";

/** Customer area layout: My Products, My Purchases, My Devices, Security & settings. */
type ShellUser = { id: string; email: string; name?: string; avatar?: Avatar };

export function AccountShell({ locale, current, sandbox, user, children }: { locale: Locale; current: AccountSection; sandbox: boolean; user: ShellUser; children: ReactNode }) {
  const t = licensingCopy[locale];
  const nav = [
    { key: "products", icon: SquaresFourIcon, label: t.nav.products, href: `/${locale}/account/products` },
    { key: "purchases", icon: ReceiptIcon, label: t.nav.purchases, href: `/${locale}/account/purchases` },
    { key: "devices", icon: DeviceMobileIcon, label: t.nav.devices, href: `/${locale}/account/devices` },
    { key: "profile", icon: UserCircleIcon, label: t.nav.profile, href: `/${locale}/account/profile` },
    { key: "security", icon: ShieldCheckIcon, label: t.nav.security, href: `/${locale}/account/security` },
    { key: "favorites", icon: HeartIcon, label: t.nav.favorites, href: `/${locale}/favorites` },
    { key: "support", icon: HeadsetIcon, label: t.nav.support, href: `/${locale}/contact?topic=order` },
  ];
  return (
    <div className="mx-auto max-w-7xl px-4 pb-6 pt-8 sm:px-6 lg:px-8">
      {sandbox && <SandboxBanner locale={locale} />}
      <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
        <nav aria-label={t.nav.account} className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <Link href={`/${locale}/account/profile`} className="mb-4 flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 hover:bg-bg-sunken">
            <UserAvatar user={user} size={44} />
            <span className="min-w-0">
              {user.name && <span className="block truncate font-semibold text-ink">{user.name}</span>}
              <span className="block truncate text-sm text-muted" dir="ltr">
                {user.email}
              </span>
            </span>
          </Link>
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
