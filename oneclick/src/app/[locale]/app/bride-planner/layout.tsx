import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { openProduct, productDataFor } from "@/lib/licensing/guard";
import { AccessDenied } from "@/components/account/AccessDenied";
import { BridalApp } from "@/products/bridal/app/BridalApp";
import { bridalSync } from "@/products/bridal/server/actions";
import { BRIDAL_PRODUCT_ID } from "@/products/bridal/constants";
import { gulfToday } from "@/products/bridal/server/today";
import { emptyWorkspace, type Workspace } from "@/products/bridal/model/types";

/**
 * PROTECTED PRODUCT: Bridal Journey (/{locale}/app/bride-planner/...).
 * Authorized on the server by the licensing engine before any data is loaded. The URL
 * proves nothing: a shared link shows the friendly "not in your account" page.
 */
export const metadata: Metadata = { title: "Bridal Journey", robots: { index: false, follow: false } };

export default async function BridalLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const access = await openProduct(locale, BRIDAL_PRODUCT_ID, `/${locale}/app/bride-planner`);
  if (!access.allowed) return <AccessDenied locale={locale} reason={access.decision.reason} productSlug="bride-planner" />;
  const data = await productDataFor(BRIDAL_PRODUCT_ID);
  if (!data) return <AccessDenied locale={locale} reason="session_invalid" productSlug="bride-planner" />;
  const stored = await data.get<Workspace>();
  return (
    <>
      <BridalApp
        initial={stored.data ?? emptyWorkspace()}
        version={stored.version}
        today={gulfToday()}
        lang={locale}
        locale={locale}
        base={`/${locale}/app/bride-planner`}
        mode="licensed"
        sync={bridalSync}
        exitHref={`/${locale}/account/products`}
        accountHref={`/${locale}/account/products`}
      />
      {children}
    </>
  );
}
