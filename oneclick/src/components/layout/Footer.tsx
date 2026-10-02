import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { brand, businessSettings } from "@/content/site";
import { legalPages } from "@/content/legal";
import { tr } from "@/i18n/config";
import { NewsletterForm } from "./NewsletterForm";
import { CookieSettingsButton } from "./ConsentBanner";

export function Footer({ locale, d }: { locale: Locale; d: Dictionary }) {
  const L = (p: string) => `/${locale}${p}`;
  const cols = [
    {
      title: d.footer.shop,
      links: [
        { href: L("/products"), label: d.common.allProducts },
        { href: L("/collections/wedding-events"), label: locale === "ar" ? "الأعراس والمناسبات" : "Wedding & Events" },
        { href: L("/collections/shopping-home"), label: locale === "ar" ? "التسوق والبيت" : "Shopping & Home" },
        { href: L("/custom"), label: d.nav.custom },
      ],
    },
    {
      title: d.footer.company,
      links: [
        { href: L("/about"), label: d.nav.about },
        { href: L("/guides"), label: d.nav.guides },
        { href: L("/contact"), label: d.contact.title },
      ],
    },
    {
      title: d.footer.support,
      links: [
        { href: L("/help"), label: d.help.title },
        { href: L("/account"), label: d.nav.account },
        { href: L("/favorites"), label: d.nav.favorites },
      ],
    },
  ];

  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr]">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-ink-soft leading-relaxed">{d.footer.tagline}</p>
            <p className="mt-3 text-sm font-medium text-primary">{tr(brand.slogan, locale)}</p>
            <div className="mt-8">
              <NewsletterForm d={{ newsletter: d.newsletter, form: d.form }} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {cols.map((c) => (
              <div key={c.title}>
                <h2 className="text-sm font-semibold text-ink">{c.title}</h2>
                <ul className="mt-4 space-y-3">
                  {c.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-sm text-muted hover:text-ink">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <h2 className="text-sm font-semibold text-ink">{d.footer.legal}</h2>
              <ul className="mt-4 space-y-3">
                {legalPages.map((p) => (
                  <li key={p.slug}>
                    <Link href={L(`/legal/${p.slug}`)} className="text-sm text-muted hover:text-ink">
                      {tr(p.title, locale)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-14 flex flex-col gap-4 border-t border-line pt-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} One Click Digital Hub. {d.footer.rights}
            {businessSettings.showLegalIdentity && businessSettings.legalName && (
              <span className="ms-2">
                {businessSettings.legalName}
                {businessSettings.commercialRegistration && ` · CR ${businessSettings.commercialRegistration}`}
              </span>
            )}
          </p>
          <CookieSettingsButton label={d.footer.cookies} />
        </div>
      </div>
    </footer>
  );
}
