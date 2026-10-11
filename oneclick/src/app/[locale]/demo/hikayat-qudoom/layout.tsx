import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { QudoomApp } from "@/products/qudoom/app/QudoomApp";
import { demoPlan } from "@/products/qudoom/model/demo";
import { todayIn } from "@/products/qudoom/model/engine";

/**
 * PUBLIC DEMO of «حكاية قدوم» with a fictional mother («أم سلمى»). Isolated from real data: nothing is
 * sent to the server, no links are created, photos stay in the tab, and a refresh (or "Reset")
 * brings the sample back. The real product is /app/hikayat-qudoom and requires the product.
 */
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "ar" ? "حكاية قدوم · عرض تجريبي" : "Hikayat Qudoom · Demo", robots: { index: false, follow: true } };
}

export default async function QudoomDemoLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const today = todayIn("Asia/Muscat");
  return (
    <>
      <QudoomApp initial={demoPlan(today, locale)} version={0} today={today} lang={locale} locale={locale} base={`/${locale}/demo/hikayat-qudoom`} mode="demo" exitHref={`/${locale}/products/hikayat-qudoom`} buyHref={`/${locale}/products/hikayat-qudoom`} />
      {children}
    </>
  );
}
