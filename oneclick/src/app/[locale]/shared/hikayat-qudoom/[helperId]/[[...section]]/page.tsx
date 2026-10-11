import { notFound } from "next/navigation";
import { pageKeys } from "@/products/qudoom/constants";

// The helper view renders in the layout, which checks the grant on every request; this validates the URL.
export default async function QudoomHelperSection({ params }: { params: Promise<{ section?: string[] }> }) {
  const { section = [] } = await params;
  if (section.length > 1 || (section[0] && !(pageKeys as string[]).includes(section[0]))) notFound();
  return null;
}
