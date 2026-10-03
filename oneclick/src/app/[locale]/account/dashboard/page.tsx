import { redirect } from "next/navigation";

// The customer dashboard now lives at My Products.
export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${locale}/account/products`);
}
