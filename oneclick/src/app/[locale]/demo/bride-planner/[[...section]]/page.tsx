import { notFound } from "next/navigation";
import { sectionKeys } from "@/products/bridal/constants";

// The app renders in the layout (state persists across sections); this only validates the URL.
export default async function BridalSection({ params }: { params: Promise<{ section?: string[] }> }) {
  const { section = [] } = await params;
  if (section.length > 1 || (section[0] && !(sectionKeys as readonly string[]).includes(section[0]))) notFound();
  return null;
}
