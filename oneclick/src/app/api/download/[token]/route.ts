import { products } from "@/content/products";
import { currentContext, licensing } from "@/lib/licensing/server";
import { personalizedSamplePdf } from "@/lib/licensing/files";

/**
 * Secure download. The token is short-lived, signed, bound to the signed-in session,
 * and the license is checked again before any byte is sent. Every download is logged.
 * Production: stream from a PRIVATE storage bucket (or redirect to a 60-second signed
 * storage URL) after this check. Files are never in /public.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const ctx = await currentContext();
  const r = await licensing().engine.redeemDownload(ctx, token);
  const headers = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex" };
  if (!r.ok) return new Response("This download link is not valid for your account. Open My Products to get a new one.", { status: 403, headers });
  const product = products.find((p) => p.id === r.productId)!;
  const pdf = personalizedSamplePdf({ product, email: r.user.email, orderRef: r.license.orderId ?? "-", licenseId: r.license.id, watermark: r.settings.watermark, issuedAt: new Date().toISOString() });
  return new Response(new Uint8Array(pdf), {
    headers: { ...headers, "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${product.slug}-${r.fileId}.pdf"` },
  });
}
