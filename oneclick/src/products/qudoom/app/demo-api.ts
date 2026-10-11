import { addDays } from "../model/engine";
import { demoReservations } from "../model/demo";
import type { FileMeta } from "../model/types";
import type { PublicState, QApi } from "./api-types";

/**
 * The demo's stand-in for the server. Photos stay in this tab as object URLs; links, helpers and
 * deletions are refused with "demo" so nothing is ever published, sent or stored.
 */
export function demoApi(today: string, lang: "ar" | "en"): QApi {
  const urls = new Map<string, string>();
  const requests: PublicState["requests"] = [
    {
      id: "rq-demo-1",
      name: lang === "ar" ? "خالة نورة" : "Aunt Noura",
      people: 3,
      date: addDays(today, 3),
      time: "17:00",
      note: lang === "ar" ? "زيارة قصيرة إن شاء الله" : "Just a short visit",
      status: "pending",
      createdAt: new Date().toISOString(),
      holdUntil: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    },
  ];
  const state = (): PublicState => ({ links: [], gifts: demoReservations(lang), requests: requests.map((r) => ({ ...r })), helpers: [], reserveDays: 7 });
  return {
    async upload(file, name, board) {
      const id = `fl-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
      urls.set(id, URL.createObjectURL(file));
      const meta: FileMeta = { id, name: name.slice(0, 120), mime: file.type || "image/jpeg", size: file.size, createdAt: new Date().toISOString(), board };
      return { ok: true, meta };
    },
    fileUrl: (id) => urls.get(id) ?? "",
    async deleteFile(id) {
      const u = urls.get(id);
      if (u) URL.revokeObjectURL(u);
      urls.delete(id);
      return { ok: true };
    },
    async publicState() {
      return { ok: true, state: state() };
    },
    async link() {
      return { ok: false, reason: "demo" };
    },
    async setReserveDays() {
      return { ok: false, reason: "demo" };
    },
    async decideVisit(id, decision) {
      const r = requests.find((x) => x.id === id);
      if (!r || r.status !== "pending") return { ok: false, reason: "not_found" };
      r.status = decision === "approve" ? "approved" : "declined";
      return { ok: true };
    },
    async inviteHelper() {
      return { ok: false, reason: "demo" };
    },
    async updateHelper() {
      return { ok: false, reason: "demo" };
    },
    async deleteAll() {
      return { ok: false, reason: "demo" };
    },
  };
}
