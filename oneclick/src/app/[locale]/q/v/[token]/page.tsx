import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { qCopy } from "@/products/qudoom/i18n";
import { Unavailable, VisitBooker } from "@/products/qudoom/public/PublicViews";
import { visitPage } from "@/products/qudoom/server/public";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return { title: isLocale(locale) ? qCopy[locale].nav.visits : "Hikayat Qudoom" };
}

export default async function VisitBookingPage({ params, searchParams }: { params: Promise<{ locale: string; token: string }>; searchParams: Promise<{ preview?: string }> }) {
  const { locale, token } = await params;
  if (!isLocale(locale)) notFound();
  const data = await visitPage(token).catch(() => null);
  if (!data) return <Unavailable lang={locale} />;
  return <VisitBooker lang={locale} token={token} head={data.head} paused={data.paused} maxPeople={data.maxPeople} days={data.days} preview={(await searchParams).preview === "1"} />;
}
