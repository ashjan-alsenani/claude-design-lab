import "server-only";
import { ownerProductData, productDataFor } from "@/lib/licensing/guard";
import { currentContext } from "@/lib/licensing/server";
import { sniffImage } from "@/lib/profile";
import { QUDOOM_PRODUCT_ID } from "../constants";
import { projection } from "../model/share";
import { emptyPlan, type Plan } from "../model/types";
import { qudoomStore, type HelperRow } from "./store";

export type Data = NonNullable<Awaited<ReturnType<typeof productDataFor>>>;
type Scoped = Omit<Data, "ctx">;

/** The signed-in mother's own plan (license checked on the server by the guard). */
export const ownerData = () => productDataFor(QUDOOM_PRODUCT_ID);

/**
 * A signed-in helper opening the plan she was invited to. Every call re-checks: her session, that
 * the grant is hers and still active, and that the mother still holds the product.
 */
export async function helperData(helperId: unknown): Promise<{ helper: HelperRow; data: Scoped } | null> {
  if (typeof helperId !== "string" || !/^qh_[A-Za-z0-9_-]{8,40}$/.test(helperId)) return null;
  const ctx = await currentContext();
  if (!ctx) return null;
  const helper = await qudoomStore().helper(helperId);
  if (!helper || helper.status !== "active" || helper.userId !== ctx.user.id) return null;
  const data = await ownerProductData(helper.ownerId, QUDOOM_PRODUCT_ID);
  return data ? { helper, data } : null;
}

/** For public links: the owner's product, only while she still holds it. */
export const ownerStillHolds = async (ownerId: string) => !!(await ownerProductData(ownerId, QUDOOM_PRODUCT_ID));

export async function readPlan(d: Scoped) {
  const s = await d.get<Plan>();
  return { version: s.version, plan: s.data ?? emptyPlan() };
}

/** Keeps the public links in step with the plan. Only touches owners who already shared something. */
export async function republish(ownerId: string, before: Plan, after: Plan) {
  const a = JSON.stringify(projection(before)), b = projection(after);
  if (!b || a === JSON.stringify(b)) return;
  try {
    await qudoomStore().republish(ownerId, b);
  } catch {
    // The plan is saved; the links catch up on the next save.
  }
}

// ---------- private files ----------
export const FILE_MAX_BYTES = 3 * 1024 * 1024;
export type StoredFile = { mime: string; b64: string };
export const fileKey = (id: string) => `file:${id}`;
export const isFileId = (id: unknown): id is string => typeof id === "string" && /^fl-[a-z0-9]{6,30}$/.test(id);

/** Trust the bytes, not the name or the browser's type: JPEG, PNG, WebP or PDF only (no SVG, no HTML). */
export function sniffFile(b: Uint8Array) {
  const img = sniffImage(b);
  if (img) return img;
  if (b.length > 5 && String.fromCharCode(...b.slice(0, 5)) === "%PDF-") return "application/pdf";
  return null;
}

/** The list of every file the owner has stored, so deleting her data removes them all. */
export async function trackFile(d: Scoped, id: string, add: boolean) {
  for (let i = 0; i < 4; i++) {
    const cur = await d.get<string[]>("files");
    const list = cur.data ?? [];
    const next = add ? [...new Set([...list, id])] : list.filter((x) => x !== id);
    if (await d.putIfVersion(next, cur.version, "files")) return;
  }
}
