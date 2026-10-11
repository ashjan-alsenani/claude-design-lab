import type { FileMeta } from "../model/types";
import type { QApi } from "./api-types";
import { qudoomDecideVisit, qudoomDeleteAll, qudoomDeleteFile, qudoomInviteHelper, qudoomLink, qudoomPublicState, qudoomReserveDays, qudoomUpdateHelper } from "../server/actions";

/**
 * The real app's server calls. Each one is a server action or route that re-checks the license
 * (or, for a helper, her grant) on the server; the browser decides nothing.
 */
export function liveApi(locale: string, helperId?: string): QApi {
  const h = helperId ? `?h=${encodeURIComponent(helperId)}` : "";
  const helperOnly = async () => ({ ok: false as const, reason: "denied" as const });
  return {
    async upload(file, name, board) {
      const fd = new FormData();
      fd.append("file", file, name);
      fd.append("name", name.slice(0, 120));
      if (board) fd.append("board", board);
      try {
        const res = await fetch(`/api/qudoom/file${h}`, { method: "POST", body: fd });
        const body = (await res.json().catch(() => null)) as { meta?: FileMeta; reason?: string } | null;
        if (res.ok && body?.meta) return { ok: true, meta: body.meta };
        return { ok: false, reason: body?.reason === "type" ? "type" : body?.reason === "too_large" ? "too_large" : res.status === 403 ? "denied" : "unavailable" };
      } catch {
        return { ok: false, reason: "unavailable" };
      }
    },
    fileUrl: (id) => `/api/qudoom/file/${encodeURIComponent(id)}${h}`,
    deleteFile: (id) => qudoomDeleteFile(id, helperId),
    // Helpers never see the sharing panel, links, reservations' names or other helpers.
    publicState: helperId ? async () => ({ ok: false, reason: "denied" }) : () => qudoomPublicState(locale),
    link: helperId ? helperOnly : (kind, action, opts) => qudoomLink(kind, action, opts ?? {}, locale),
    setReserveDays: helperId ? helperOnly : (days) => qudoomReserveDays(days),
    decideVisit: helperId ? helperOnly : (id, decision) => qudoomDecideVisit(id, decision),
    inviteHelper: helperId ? helperOnly : (email, sections, canEdit) => qudoomInviteHelper(email, sections, canEdit, locale),
    updateHelper: helperId ? helperOnly : (id, patch) => qudoomUpdateHelper(id, patch),
    deleteAll: helperId ? helperOnly : () => qudoomDeleteAll(),
    exportUrl: helperId ? undefined : "/api/qudoom/export",
  };
}
