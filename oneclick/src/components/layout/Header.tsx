"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { HeartIcon, ListIcon, MoonIcon, SunIcon, UserIcon, XIcon } from "@phosphor-icons/react/dist/ssr";
import { Logo } from "@/components/brand/Logo";
import { otherLocale, localeMeta, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { buttonClass } from "@/components/ui/Button";

export function Header({ locale, d }: { locale: Locale; d: Pick<Dictionary, "nav" | "a11y"> }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const alt = otherLocale(locale);
  const switchHref = pathname.replace(new RegExp(`^/${locale}(?=/|$)`), `/${alt}`) || `/${alt}`;

  const links = [
    { href: `/${locale}/products`, label: d.nav.products },
    { href: `/${locale}/custom`, label: d.nav.custom },
    { href: `/${locale}/guides`, label: d.nav.guides },
    { href: `/${locale}/about`, label: d.nav.about },
    { href: `/${locale}/help`, label: d.nav.help },
  ];

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/80 backdrop-blur-xl supports-[not(backdrop-filter:blur(1px))]:bg-bg">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link href={`/${locale}`} className="shrink-0 rounded-lg" aria-label="One Click Digital Hub home">
          <Logo />
        </Link>

        <nav aria-label={d.a11y.primaryNav} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={isActive(l.href) ? "page" : undefined}
                  className="rounded-full px-3.5 py-2 text-[0.94rem] text-ink-soft transition-colors hover:bg-bg-sunken hover:text-ink aria-[current=page]:text-ink aria-[current=page]:font-medium"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ms-auto flex items-center gap-1">
          <Link
            href={switchHref}
            hrefLang={alt}
            lang={alt}
            aria-label={d.a11y.switchLanguage}
            className="rounded-full px-3 py-2 text-sm font-medium text-ink-soft hover:bg-bg-sunken hover:text-ink"
          >
            {alt === "ar" ? "عربي" : "EN"}
          </Link>
          <ThemeToggle label={d.a11y.toggleTheme} />
          <Link
            href={`/${locale}/favorites`}
            aria-label={d.nav.favorites}
            className="hidden size-10 items-center justify-center rounded-full text-ink-soft hover:bg-bg-sunken hover:text-ink sm:inline-flex"
          >
            <HeartIcon size={20} />
          </Link>
          <span className="hidden sm:block">
            <Link href={`/${locale}/account`} className={buttonClass("secondary", "sm", "ms-1")}>
              <UserIcon size={16} />
              {d.nav.account}
            </Link>
          </span>
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-full text-ink hover:bg-bg-sunken lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? d.a11y.closeMenu : d.a11y.menu}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <XIcon size={22} /> : <ListIcon size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav"
            initial={reduce ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto border-t border-line bg-bg px-4 pb-10 pt-4 lg:hidden"
          >
            <nav aria-label={d.a11y.primaryNav}>
              <ul className="flex flex-col">
                {[...links, { href: `/${locale}/favorites`, label: d.nav.favorites }, { href: `/${locale}/account`, label: d.nav.account }].map(
                  (l, i) => (
                    <motion.li
                      key={l.href}
                      initial={reduce ? false : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.03 * i, duration: 0.25 }}
                    >
                      <Link
                        href={l.href}
                        aria-current={isActive(l.href) ? "page" : undefined}
                        className="flex min-h-14 items-center border-b border-line text-xl font-medium text-ink aria-[current=page]:text-primary"
                      >
                        {l.label}
                      </Link>
                    </motion.li>
                  )
                )}
              </ul>
            </nav>
            <Link href={`/${locale}/products`} className={buttonClass("primary", "lg", "mt-8 w-full")}>
              {d.nav.explore}
            </Link>
            <p className="mt-6 text-sm text-muted" lang={alt}>
              <Link href={switchHref} hrefLang={alt} className="underline underline-offset-4">
                {localeMeta[alt].label}
              </Link>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function ThemeToggle({ label }: { label: string }) {
  const toggle = () => {
    const root = document.documentElement;
    const current =
      root.dataset.theme ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("oc-theme", next);
    } catch {}
  };
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      className="inline-flex size-10 items-center justify-center rounded-full text-ink-soft hover:bg-bg-sunken hover:text-ink"
    >
      <SunIcon size={20} className="hidden dark-icon" />
      <MoonIcon size={20} className="light-icon" />
    </button>
  );
}
