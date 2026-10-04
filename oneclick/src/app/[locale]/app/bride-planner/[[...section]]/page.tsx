import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { openProduct } from "@/lib/licensing/guard";
import { BRIDAL_PRODUCT_ID, sectionKeys } from "@/products/bridal/constants";

// The app renders in the layout (state persists across sections). This page validates the URL and,
// like every product page, checks ownership itself rather than relying on the layout.
export default async function BridalSection({ params }: { params: Promise<{ locale: string; section?: string[] }> }) {
  const { locale, section = [] } = await params;
  if (!isLocale(locale)) notFound();
  if (section.length > 1 || (section[0] && !(sectionKeys as readonly string[]).includes(section[0]))) notFound();
  await openProduct(locale, BRIDAL_PRODUCT_ID, `/${locale}/app/bride-planner${section[0] ? `/${section[0]}` : ""}`);
  return null;
}
