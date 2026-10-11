import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { qCopy } from "@/products/qudoom/i18n";
import { GiftListView, Unavailable } from "@/products/qudoom/public/PublicViews";
import { giftPage } from "@/products/qudoom/server/public";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return { title: isLocale(locale) ? qCopy[locale].registry.title : "Hikayat Qudoom" };
}

export default async function GiftListPage({ params, searchParams }: { params: Promise<{ locale: string; token: string }>; searchParams: Promise<{ preview?: string }> }) {
  const { locale, token } = await params;
  if (!isLocale(locale)) notFound();
  const data = await giftPage(token).catch(() => null);
  if (!data) return <Unavailable lang={locale} />;
  return <GiftListView lang={locale} token={token} head={data.head} gifts={data.gifts} reserveDays={data.reserveDays} preview={(await searchParams).preview === "1"} />;
}
