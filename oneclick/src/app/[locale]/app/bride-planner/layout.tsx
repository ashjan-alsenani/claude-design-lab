import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { currentContext, licensing } from "@/lib/licensing/server";
import { productData } from "@/lib/licensing/product-data";
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
  const ctx = await currentContext();
  const decision = await licensing().engine.checkAccess(ctx, BRIDAL_PRODUCT_ID, "open");
  if (!decision.allowed) {
    if (decision.reason === "not_signed_in" || decision.reason === "session_invalid") redirect(`/${locale}/account?next=${encodeURIComponent(`/${locale}/app/bride-planner`)}`);
    return <AccessDenied locale={locale} reason={decision.reason} productSlug="bride-planner" />;
  }
  const stored = await productData().get<Workspace>(ctx!.user.id, BRIDAL_PRODUCT_ID);
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
