import { notFound } from "next/navigation";
import { pageKeys } from "@/products/qudoom/constants";

// The app renders in the layout (state persists across sections); this only validates the URL.
export default async function QudoomDemoSection({ params }: { params: Promise<{ section?: string[] }> }) {
  const { section = [] } = await params;
  if (section.length > 1 || (section[0] && !(pageKeys as string[]).includes(section[0]))) notFound();
  return null;
}
