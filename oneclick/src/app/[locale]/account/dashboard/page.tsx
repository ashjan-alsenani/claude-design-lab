import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowRightIcon, DownloadSimpleIcon, GearSixIcon, HeadsetIcon, HeartIcon, ReceiptIcon, SquaresFourIcon } from "@phosphor-icons/react/dist/ssr";
import { isLocale, tr } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getSession } from "@/lib/auth/session";
import { catalog } from "@/lib/data/catalog";
import { canAccess, type Entitlement } from "@/lib/commerce/types";
import { hueSoft, hueVar } from "@/lib/hues";
import { pageMetadata } from "@/lib/seo";
import { ProductIcon } from "@/components/product/ProductIcon";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return pageMetadata({ locale, path: "/account/dashboard", title: getDictionary(locale).account.dashboard, noindex: true });
}

// SAMPLE entitlements for the demo session only.
const demoEntitlements: Entitlement[] = [
  { id: "ent_1", userId: "demo-user", productId: "prd_bride", source: "admin_grant", license: "personal", startsAt: "2026-09-01T00:00:00Z" },
  { id: "ent_2", userId: "demo-user", productId: "prd_reset", source: "free", license: "personal", startsAt: "2026-09-10T00:00:00Z" },
];

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const session = await getSession();
  if (!session) redirect(`/${locale}/account`);
  const d = getDictionary(locale);
  const a = d.account;
  const all = await catalog.listProducts();
  const owned = all.filter((p) => canAccess(session.demo ? demoEntitlements : [], session.userId, p.id));

  const nav = [
    { icon: SquaresFourIcon, label: a.products, href: "#products", current: true },
    { icon: DownloadSimpleIcon, label: a.downloads, href: "#downloads" },
    { icon: ReceiptIcon, label: a.orders, href: "#orders" },
    { icon: HeartIcon, label: a.favorites, href: `/${locale}/favorites` },
    { icon: HeadsetIcon, label: a.support, href: `/${locale}/contact?topic=order` },
    { icon: GearSixIcon, label: a.settings, href: "#settings" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
      {session.demo && (
        <p role="note" className="mb-6 rounded-[var(--radius-md)] border border-dashed border-warning/60 bg-accent-soft px-4 py-3 text-sm text-ink-soft">
          {a.demoBanner}
        </p>
      )}
      <div className="grid gap-8 lg:grid-cols-[230px_1fr]">
        <nav aria-label={a.dashboard} className="lg:sticky lg:top-24 lg:self-start">
          <ul className="-mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0">
            {nav.map((n) => (
              <li key={n.label}>
                <a
                  href={n.href}
                  aria-current={n.current ? "page" : undefined}
                  className="flex items-center gap-3 whitespace-nowrap rounded-[var(--radius-md)] px-3 py-2.5 text-sm text-ink-soft hover:bg-bg-sunken aria-[current=page]:bg-surface aria-[current=page]:font-medium aria-[current=page]:text-ink aria-[current=page]:shadow-soft"
                >
                  <n.icon size={18} />
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-12">
          <header>
            <h1 className="text-3xl font-semibold tracking-tight text-ink">
              {locale === "ar" ? `أهلًا ${session.name}` : `Hello, ${session.name}`}
            </h1>
            <p className="mt-1 text-ink-soft">{a.sub}</p>
          </header>

          <section id="products" aria-labelledby="h-products">
            <h2 id="h-products" className="text-lg font-semibold text-ink">
              {a.products}
            </h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {owned.map((p) => (
                <li key={p.id} className="flex items-center gap-4 rounded-[var(--radius-lg)] border border-line bg-surface p-4">
                  <span className="grid size-14 shrink-0 place-items-center rounded-[16px]" style={{ background: hueSoft(p.hue, 18), color: hueVar(p.hue) }}>
                    <ProductIcon hue={p.hue} size={26} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">{tr(p.name, locale)}</p>
                    <p className="text-sm text-muted">{d.access[p.access]}</p>
                  </div>
                  <Link href={`/${locale}/products/${p.slug}#demo`} className="inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-medium text-on-primary">
                    {a.open}
                    <ArrowRightIcon size={14} className="flip-rtl" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section id="downloads" aria-labelledby="h-dl">
            <h2 id="h-dl" className="text-lg font-semibold text-ink">
              {a.downloads}
            </h2>
            <p className="mt-3 rounded-[var(--radius-md)] border border-dashed border-line-strong p-5 text-sm text-muted">
              {locale === "ar"
                ? "الملفات تُسلَّم عبر روابط تحميل موقّعة ومؤقتة بعد التحقق من صلاحيتك. لا توجد ملفات في هذا الحساب التجريبي."
                : "Files are delivered through short-lived signed links after your access is verified. No files in this demo account."}
            </p>
          </section>

          <section id="orders" aria-labelledby="h-orders">
            <h2 id="h-orders" className="text-lg font-semibold text-ink">
              {a.orders}
            </h2>
            <p className="mt-3 text-sm text-muted">{a.noOrders}</p>
          </section>

          <section id="settings" aria-labelledby="h-settings">
            <h2 id="h-settings" className="text-lg font-semibold text-ink">
              {a.settings}
            </h2>
            <ul className="mt-3 divide-y divide-line rounded-[var(--radius-lg)] border border-line bg-surface text-sm">
              {(locale === "ar"
                ? ["الاسم والبريد", "اللغة", "رسائل التسويق (موافقة)", "تصدير بياناتي", "حذف الحساب"]
                : ["Name & email", "Language", "Marketing emails (consent)", "Export my data", "Delete account"]
              ).map((s) => (
                <li key={s} className="flex items-center justify-between px-4 py-3.5 text-ink-soft">
                  {s}
                  <span className="text-xs text-muted">{locale === "ar" ? "عند الإطلاق" : "At launch"}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
