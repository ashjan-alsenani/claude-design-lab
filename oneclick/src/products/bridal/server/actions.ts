"use server";

import { z } from "zod";
import { currentContext, licensing } from "@/lib/licensing/server";
import { productData } from "@/lib/licensing/product-data";
import { rateLimit } from "@/lib/security/rate-limit";
import { applyOp } from "../model/reducer";
import { MAX_DOC_BYTES, opSchema } from "../model/schema";
import { emptyWorkspace, type Workspace } from "../model/types";
import type { SyncResult } from "../app/state";
import { BRIDAL_PRODUCT_ID } from "../constants";


/**
 * Saves the bride's changes. Every call re-checks, on the server: signed-in session,
 * verified account, active license for this product, trusted device. The browser never
 * decides ownership; it only sends validated operations for its own account.
 */
export async function bridalSync(rawOps: unknown, baseVersion: unknown): Promise<SyncResult> {
  const ctx = await currentContext();
  if (!ctx) return { ok: false, reason: "denied" };
  const { engine } = licensing();
  const decision = await engine.canUserAccessProduct(ctx.user.id, BRIDAL_PRODUCT_ID, { sessionId: ctx.session.id, deviceId: ctx.session.deviceId, purpose: "open" });
  if (!decision.allowed) return { ok: false, reason: "denied" };
  if (!rateLimit(`bridal:${ctx.user.id}`, 900, 10 * 60 * 1000).ok) return { ok: false, reason: "rate_limited" };

  const ops = z.array(opSchema).min(1).max(200).safeParse(rawOps);
  if (!ops.success) return { ok: false, reason: "invalid" };
  const store = productData();
  let stored;
  try {
    stored = await store.get<Workspace>(ctx.user.id, BRIDAL_PRODUCT_ID);
  } catch {
    return { ok: false, reason: "unavailable" };
  }
  let doc = stored.data ?? emptyWorkspace();
  try {
    for (const op of ops.data) doc = applyOp(doc, op);
  } catch {
    return { ok: false, reason: "invalid" };
  }
  doc.updatedAt = new Date().toISOString();
  if (JSON.stringify(doc).length > MAX_DOC_BYTES) return { ok: false, reason: "too_large" };
  const version = stored.version + 1;
  try {
    await store.put(ctx.user.id, BRIDAL_PRODUCT_ID, doc, version);
  } catch {
    return { ok: false, reason: "unavailable" };
  }
  // If another device changed the plan meanwhile, send the merged copy back.
  return { ok: true, version, doc: stored.version !== baseVersion ? doc : undefined };
}
