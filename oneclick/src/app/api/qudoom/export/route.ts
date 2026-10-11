import { ownerData, readPlan } from "@/products/qudoom/server/access";

/**
 * Download «حكاية قدوم» data as JSON. Who: only the signed-in mother with the product (guard).
 * Contains her plan and the list of her photos (names and dates); the photos themselves stay
 * viewable in the app.
 */
export async function GET() {
  const d = await ownerData();
  const base = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex", "X-Content-Type-Options": "nosniff" };
  if (!d) return new Response(null, { status: 404, headers: base });
  const { plan } = await readPlan(d);
  const body = JSON.stringify({ product: "hikayat-qudoom", exportedAt: new Date().toISOString(), plan }, null, 2);
  return new Response(body, { headers: { ...base, "Content-Type": "application/json; charset=utf-8", "Content-Disposition": 'attachment; filename="hikayat-qudoom.json"' } });
}
