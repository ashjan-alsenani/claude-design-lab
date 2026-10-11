import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { openProduct } from "@/lib/licensing/guard";
import { QUDOOM_PRODUCT_ID, QUDOOM_SLUG, pageKeys } from "@/products/qudoom/constants";

// The app renders in the layout (state persists across sections). This page validates the URL and,
// like every product page, checks ownership itself rather than relying on the layout.
export default async function QudoomSection({ params }: { params: Promise<{ locale: string; section?: string[] }> }) {
  const { locale, section = [] } = await params;
  if (!isLocale(locale)) notFound();
  if (section.length > 1 || (section[0] && !(pageKeys as string[]).includes(section[0]))) notFound();
  await openProduct(locale, QUDOOM_PRODUCT_ID, `/${locale}/app/${QUDOOM_SLUG}${section[0] ? `/${section[0]}` : ""}`);
  return null;
}
