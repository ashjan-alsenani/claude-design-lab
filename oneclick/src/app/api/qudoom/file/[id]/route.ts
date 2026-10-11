import { fileKey, helperData, isFileId, ownerData, readPlan, sniffFile, type StoredFile } from "@/products/qudoom/server/access";
import { planForHelper } from "@/products/qudoom/model/share";

/**
 * Read one private file. Who: the mother who owns it, or a helper she invited (?h=grant) when the
 * file belongs to a section shared with her. Everyone else gets 404. Never cached publicly; served
 * with a sandboxing CSP and a fixed type taken from the bytes, so it can't run as a page.
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const base = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer" };
  const none = () => new Response(null, { status: 404, headers: base });
  if (!isFileId(id)) return none();
  const h = new URL(req.url).searchParams.get("h");
  let d;
  if (h) {
    const helper = await helperData(h);
    if (!helper) return none();
    const { plan } = await readPlan(helper.data);
    if (!planForHelper(plan, helper.helper.sections).files.some((f) => f.id === id)) return none();
    d = helper.data;
  } else d = await ownerData();
  if (!d) return none();
  const stored = (await d.get<StoredFile>(fileKey(id))).data;
  if (!stored) return none();
  const bytes = Buffer.from(stored.b64, "base64");
  const mime = sniffFile(bytes);
  if (!mime) return none();
  return new Response(new Uint8Array(bytes), {
    headers: {
      ...base,
      // File ids never change content, so the browser may keep its own private copy for a day.
      "Cache-Control": "private, max-age=86400",
      "Content-Type": mime,
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "Content-Disposition": mime === "application/pdf" ? "attachment" : "inline",
    },
  });
}
