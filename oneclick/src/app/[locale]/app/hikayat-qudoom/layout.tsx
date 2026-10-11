import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { openProduct, productDataFor } from "@/lib/licensing/guard";
import { AccessDenied } from "@/components/account/AccessDenied";
import { QudoomApp } from "@/products/qudoom/app/QudoomApp";
import { QUDOOM_PRODUCT_ID, QUDOOM_SLUG } from "@/products/qudoom/constants";
import { todayIn } from "@/products/qudoom/model/engine";
import { emptyPlan, type Plan } from "@/products/qudoom/model/types";

/**
 * PROTECTED PRODUCT: «حكاية قدوم» (/{locale}/app/hikayat-qudoom/...).
 * Authorized on the server by the licensing engine before any data is loaded. The URL proves
 * nothing: a shared link shows the friendly "not in your account" page.
 */
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "ar" ? "حكاية قدوم" : "Hikayat Qudoom", robots: { index: false, follow: false } };
}

export default async function QudoomLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const access = await openProduct(locale, QUDOOM_PRODUCT_ID, `/${locale}/app/${QUDOOM_SLUG}`);
  if (!access.allowed) return <AccessDenied locale={locale} reason={access.decision.reason} productSlug={QUDOOM_SLUG} />;
  const data = await productDataFor(QUDOOM_PRODUCT_ID);
  if (!data) return <AccessDenied locale={locale} reason="session_invalid" productSlug={QUDOOM_SLUG} />;
  const stored = await data.get<Plan>();
  const plan = stored.data ?? emptyPlan();
  return (
    <>
      <QudoomApp
        initial={plan}
        version={stored.version}
        today={todayIn(plan.profile?.timeZone ?? "Asia/Muscat")}
        lang={locale}
        locale={locale}
        base={`/${locale}/app/${QUDOOM_SLUG}`}
        mode="licensed"
        exitHref={`/${locale}/account/products`}
      />
      {children}
    </>
  );
}
