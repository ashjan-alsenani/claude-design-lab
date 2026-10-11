import type { FileMeta, SectionId } from "../model/types";

/**
 * What the app needs from the server beyond saving the plan. The licensed app gets real server
 * actions (every one re-checks the license on the server); the demo gets in-memory stand-ins that
 * never send, publish or store anything.
 */
export type ShareKind = "gifts" | "visits";
export type LinkInfo = { kind: ShareKind; active: boolean; url?: string; expiresAt?: string; createdAt?: string };
export type GiftCounts = { reserved: number; purchased: number; names: string[] };
export type VisitRequest = { id: string; name: string; people: number; date: string; time: string; note?: string; status: "pending" | "approved" | "declined" | "expired" | "cancelled"; createdAt: string; holdUntil: string };
export type HelperInfo = { id: string; email: string; sections: SectionId[]; canEdit: boolean; status: "invited" | "active" | "revoked"; inviteUrl?: string; createdAt: string };
export type PublicState = { links: LinkInfo[]; gifts: Record<string, GiftCounts>; requests: VisitRequest[]; helpers: HelperInfo[]; reserveDays: number };

export type Fail = { ok: false; reason: "denied" | "invalid" | "unavailable" | "rate_limited" | "too_large" | "type" | "demo" | "not_found" | "full" };
export type Res<T = object> = ({ ok: true } & T) | Fail;

export type QApi = {
  upload(file: Blob, name: string, board?: FileMeta["board"]): Promise<Res<{ meta: FileMeta }>>;
  fileUrl(id: string): string;
  deleteFile(id: string): Promise<Res>;
  publicState(): Promise<Res<{ state: PublicState }>>;
  link(kind: ShareKind, action: "create" | "disable" | "regenerate", opts?: { expiresAt?: string; reserveDays?: number }): Promise<Res<{ link: LinkInfo }>>;
  setReserveDays(days: number): Promise<Res>;
  decideVisit(requestId: string, decision: "approve" | "decline"): Promise<Res>;
  inviteHelper(email: string, sections: SectionId[], canEdit: boolean): Promise<Res<{ helper: HelperInfo }>>;
  updateHelper(id: string, patch: { sections?: SectionId[]; canEdit?: boolean; revoke?: true }): Promise<Res>;
  deleteAll(): Promise<Res>;
  exportUrl?: string;
};
