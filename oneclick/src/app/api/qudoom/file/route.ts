import { randomBytes } from "node:crypto";
import { rateLimit } from "@/lib/security/rate-limit";
import { FILE_MAX_BYTES, fileKey, helperData, ownerData, sniffFile, trackFile, type StoredFile } from "@/products/qudoom/server/access";
import type { FileMeta } from "@/products/qudoom/model/types";

/**
 * Upload a private photo or PDF to «حكاية قدوم». Who: the mother (license checked by the guard),
 * or a helper she invited with edit rights (?h=grant, re-checked). The bytes are checked (JPEG,
 * PNG, WebP or PDF, max 3 MB) and kept in the owner's private store; they are only ever served
 * back through /api/qudoom/file/[id] to the same people. No public URL exists.
 */
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "private, no-store" } });
const boards = ["nursery", "memories", "receipts", "gifts", "favors", "items"] as const;

export async function POST(req: Request) {
  const h = new URL(req.url).searchParams.get("h");
  const helper = h ? await helperData(h) : null;
  const d = h ? (helper?.helper.canEdit ? helper.data : null) : await ownerData();
  if (!d) return json({ reason: "denied" }, 403);
  if (!rateLimit(`qudoom-upload:${d.userId}`, 120, 60 * 60 * 1000).ok) return json({ reason: "rate_limited" }, 429);
  if (Number(req.headers.get("content-length") ?? 0) > FILE_MAX_BYTES + 64 * 1024) return json({ reason: "too_large" }, 413);
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return json({ reason: "invalid" }, 400);
  }
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return json({ reason: "invalid" }, 400);
  if (file.size > FILE_MAX_BYTES) return json({ reason: "too_large" }, 413);
  const bytes = new Uint8Array(await file.arrayBuffer());
  const mime = sniffFile(bytes);
  if (!mime) return json({ reason: "type" }, 415);
  const board = String(form.get("board") ?? "");
  const id = `fl-${Date.now().toString(36)}${randomBytes(5).toString("hex")}`;
  const meta: FileMeta = {
    id,
    name: String(form.get("name") ?? "file").replace(/[\u0000-\u001f<>]/g, "").slice(0, 120) || "file",
    mime,
    size: bytes.length,
    createdAt: new Date().toISOString(),
    ...((boards as readonly string[]).includes(board) ? { board: board as FileMeta["board"] } : {}),
  };
  try {
    await d.put<StoredFile>({ mime, b64: Buffer.from(bytes).toString("base64") }, 1, fileKey(id));
    await trackFile(d, id, true);
  } catch {
    return json({ reason: "unavailable" }, 503);
  }
  return json({ meta });
}
