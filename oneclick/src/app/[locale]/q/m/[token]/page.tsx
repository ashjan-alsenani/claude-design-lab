import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { ManageCard, Unavailable } from "@/products/qudoom/public/PublicViews";
import { managePage } from "@/products/qudoom/server/public";

export const metadata = { title: "Hikayat Qudoom" };

/** A guest's own reservation or visit request, reached only through the private link she was shown. */
export default async function ManagePage({ params }: { params: Promise<{ locale: string; token: string }> }) {
  const { locale, token } = await params;
  if (!isLocale(locale)) notFound();
  const view = await managePage(token, locale).catch(() => null);
  if (!view) return <Unavailable lang={locale} />;
  return <ManageCard lang={locale} token={token} view={view} />;
}
