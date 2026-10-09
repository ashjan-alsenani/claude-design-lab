import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { BridalApp } from "@/products/bridal/app/BridalApp";
import { demoWorkspace } from "@/products/bridal/model/demo";
import { gulfToday } from "@/products/bridal/server/today";

/**
 * PUBLIC DEMO of Bridal Journey with a fictional sample wedding (Layan). Nothing is saved:
 * changes live only in this browser tab and disappear on refresh. The real product (saved,
 * private, per account) is /app/bride-planner and requires a license.
 */
export const metadata: Metadata = { title: "Bride of a Lifetime · Demo", robots: { index: false, follow: true } };

export default async function BridalDemoLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const today = gulfToday();
  return (
    <>
      <BridalApp
        initial={demoWorkspace(today, locale)}
        version={0}
        today={today}
        lang={locale}
        locale={locale}
        base={`/${locale}/demo/bride-planner`}
        mode="demo"
        exitHref={`/${locale}/products/bride-planner`}
        buyHref={`/${locale}/checkout/bride-planner`}
        accountHref={`/${locale}/account`}
      />
      {children}
    </>
  );
}
