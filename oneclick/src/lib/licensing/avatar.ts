import "server-only";
import { AVATAR_MAX_BYTES, sniffImage } from "@/lib/profile";
import { productData } from "./product-data";

/**
 * Profile photos live in the per-customer data store under a reserved key, so production
 * needs no extra table (Supabase `oc_product_data`, server-only). Only the account owner
 * and admins can read them, through /api/avatar.
 */
const KEY = "_profile_avatar";
type StoredAvatar = { mime: string; b64: string };

export async function saveAvatarPhoto(userId: string, file: File) {
  if (file.size === 0 || file.size > AVATAR_MAX_BYTES) return { ok: false as const, reason: "size" as const };
  const bytes = new Uint8Array(await file.arrayBuffer());
  // Trust the bytes, not the file name or the browser-supplied type. SVG and anything else is refused.
  const mime = sniffImage(bytes);
  if (!mime) return { ok: false as const, reason: "type" as const };
  const current = await productData().get<StoredAvatar>(userId, KEY);
  await productData().put<StoredAvatar>(userId, KEY, { mime, b64: Buffer.from(bytes).toString("base64") }, current.version + 1);
  return { ok: true as const };
}

export async function readAvatarPhoto(userId: string) {
  const { data } = await productData().get<StoredAvatar>(userId, KEY);
  if (!data) return null;
  const bytes = Buffer.from(data.b64, "base64");
  // Re-check on the way out too, in case anything was written by another path.
  const mime = sniffImage(bytes);
  return mime ? { mime, bytes } : null;
}

export async function deleteAvatarPhoto(userId: string) {
  const current = await productData().get<StoredAvatar>(userId, KEY);
  if (current.data) await productData().put<StoredAvatar | null>(userId, KEY, null, current.version + 1);
}
