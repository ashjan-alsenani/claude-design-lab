"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { qCopy, type Lang, type QCopy } from "../i18n";
import { toMajor } from "../model/engine";
import { applyOp } from "../model/reducer";
import type { Op } from "../model/schema";
import { currencyDigits, type Currency, type Plan, type SectionId } from "../model/types";
import type { PublicState, QApi } from "./api-types";

export type SyncResult = { ok: true; version: number; doc?: Plan } | { ok: false; reason: "denied" | "invalid" | "unavailable" | "too_large" | "rate_limited" | "readonly" };
export type SyncFn = (ops: Op[], baseVersion: number) => Promise<SyncResult>;
export type SaveState = "idle" | "saving" | "saved" | "error";
export type Mode = "licensed" | "demo" | "helper";
export type Access = { sections: SectionId[] | "all"; canEdit: boolean; ownerName?: string };

type Ctx = {
  plan: Plan;
  today: string;
  lang: Lang;
  t: QCopy;
  mode: Mode;
  access: Access;
  can: (s: SectionId) => boolean;
  base: string;
  locale: string;
  href: (section?: string) => string;
  dispatch: (op: Op) => boolean;
  saveState: SaveState;
  retry: () => void;
  remoteNote: boolean;
  currency: Currency;
  money: (minor: number | undefined) => string;
  num: (n: number) => string;
  pct: (n: number) => string;
  date: (iso: string, style?: "short" | "long" | "weekday" | "month" | "day") => string;
  rel: (iso: string) => string;
  timeLabel: (hm: string) => string;
  newId: (prefix: string) => string;
  toast: string | null;
  say: (msg: string) => void;
  api: QApi;
  pub: PublicState | null;
  refreshPub: () => Promise<void>;
};

const QCtx = createContext<Ctx | null>(null);
export function useQ() {
  const c = useContext(QCtx);
  if (!c) throw new Error("useQ outside provider");
  return c;
}

export function QProvider(props: { initial: Plan; version: number; today: string; lang: Lang; locale: string; base: string; mode: Mode; access?: Access; sync?: SyncFn; api: QApi; children: ReactNode }) {
  const { lang, today, sync, mode, api } = props;
  const access = useMemo(() => props.access ?? { sections: "all" as const, canEdit: true }, [props.access]);
  const [plan, setPlanState] = useState(props.initial);
  const planRef = useRef(props.initial);
  const setPlan = useCallback((next: Plan) => {
    planRef.current = next;
    setPlanState(next);
  }, []);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [remoteNote, setRemoteNote] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [pub, setPub] = useState<PublicState | null>(null);
  const queue = useRef<Op[]>([]);
  const version = useRef(props.version);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inflight = useRef(false);
  const failures = useRef(0);
  const t = qCopy[lang];

  const flush = useCallback(async () => {
    if (!sync || inflight.current || queue.current.length === 0) return;
    const ops = queue.current;
    queue.current = [];
    inflight.current = true;
    setSaveState("saving");
    try {
      const r = await sync(ops, version.current);
      if (!r.ok) throw new Error(r.reason);
      failures.current = 0;
      version.current = r.version;
      if (r.doc) {
        // Someone else (another device or a helper) saved meanwhile: show the merged copy,
        // re-applying anything typed while this save was in flight.
        let merged = r.doc;
        for (const op of queue.current) {
          try {
            merged = applyOp(merged, op);
          } catch {}
        }
        setPlan(merged);
        setRemoteNote(true);
      }
      setSaveState(queue.current.length ? "saving" : "saved");
    } catch {
      // Keep the edits and try again with a growing pause; the mother can also press "try again".
      queue.current = [...ops, ...queue.current];
      failures.current += 1;
      setSaveState("error");
      if (failures.current < 6) timer.current = setTimeout(() => void flushRef.current(), Math.min(30_000, 1500 * 2 ** failures.current));
    } finally {
      inflight.current = false;
      if (queue.current.length && failures.current === 0) timer.current = setTimeout(() => void flushRef.current(), 400);
    }
  }, [sync, setPlan]);
  const flushRef = useRef(flush);
  useEffect(() => {
    flushRef.current = flush;
  }, [flush]);

  const dispatch = useCallback(
    (op: Op) => {
      if (!access.canEdit) return false;
      let next: Plan;
      try {
        next = applyOp(planRef.current, op);
      } catch {
        return false; // invalid input: the form keeps what was typed and shows a calm message
      }
      setPlan(next);
      if (sync) {
        queue.current.push(op);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => void flushRef.current(), 350);
        setSaveState("saving");
      }
      return true;
    },
    [sync, setPlan, access.canEdit]
  );

  // Try to send pending edits when the tab is hidden or the network comes back; warn before leaving with unsaved edits.
  useEffect(() => {
    const onHide = () => void flushRef.current();
    const onOnline = () => {
      failures.current = 0;
      void flushRef.current();
    };
    const onLeave = (e: BeforeUnloadEvent) => {
      if (queue.current.length || inflight.current) e.preventDefault();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("online", onOnline);
    window.addEventListener("beforeunload", onLeave);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("beforeunload", onLeave);
    };
  }, []);

  const refreshPub = useCallback(async () => {
    const r = await api.publicState();
    if (r.ok) setPub(r.state);
  }, [api]);
  useEffect(() => {
    void refreshPub();
  }, [refreshPub]);

  const say = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast((m) => (m === msg ? null : m)), 2600);
  }, []);

  const value = useMemo<Ctx>(() => {
    const loc = lang === "ar" ? "ar-OM" : "en-GB";
    const nf = new Intl.NumberFormat(loc);
    const currency = plan.profile?.currency ?? "OMR";
    const d = currencyDigits[currency];
    const mf = new Intl.NumberFormat(loc, { style: "currency", currency, currencyDisplay: lang === "ar" ? "symbol" : "code", minimumFractionDigits: 0, maximumFractionDigits: d });
    const money = (minor: number | undefined) => (minor === undefined ? "—" : mf.format(toMajor(minor, currency)).replace(/ /g, " "));
    const fmt = {
      short: new Intl.DateTimeFormat(loc, { day: "numeric", month: "short", timeZone: "UTC" }),
      long: new Intl.DateTimeFormat(loc, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }),
      weekday: new Intl.DateTimeFormat(loc, { weekday: "long", day: "numeric", month: "short", timeZone: "UTC" }),
      month: new Intl.DateTimeFormat(loc, { month: "long", year: "numeric", timeZone: "UTC" }),
      day: new Intl.DateTimeFormat(loc, { weekday: "short", timeZone: "UTC" }),
    };
    // Dates are calendar dates: formatted in UTC so they never shift by the viewer's time zone.
    const date = (iso: string, style: keyof typeof fmt = "short") => fmt[style].format(new Date(`${iso}T00:00:00Z`));
    const rel = (iso: string) => {
      const n = Math.round((Date.parse(`${iso}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000);
      if (n === 0) return t.common.today;
      if (n === 1) return t.common.tomorrow;
      if (n > 1 && n <= 13) return t.common.inDays(nf.format(n));
      if (n < 0 && n >= -13) return t.common.daysAgo(nf.format(-n));
      return date(iso);
    };
    const tf = new Intl.DateTimeFormat(loc, { hour: "numeric", minute: "2-digit", timeZone: "UTC" });
    const timeLabel = (hm: string) => tf.format(new Date(`2000-01-01T${hm}:00Z`));
    const can = (s: SectionId) => (plan.profile?.sections?.[s] ?? true) && (access.sections === "all" || access.sections.includes(s));
    return {
      plan, today, lang, t, mode, access, can, base: props.base, locale: props.locale,
      href: (s?: string) => (s ? `${props.base}/${s}` : props.base),
      dispatch, saveState, remoteNote, currency, money,
      retry: () => {
        failures.current = 0;
        setSaveState("saving");
        void flushRef.current();
      },
      num: (n: number) => nf.format(n),
      pct: (n: number) => new Intl.NumberFormat(loc, { style: "percent", maximumFractionDigits: 0 }).format(n / 100),
      date, rel, timeLabel,
      newId: (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
      toast, say, api, pub, refreshPub,
    };
  }, [plan, today, lang, t, mode, access, props.base, props.locale, dispatch, saveState, remoteNote, toast, say, api, pub, refreshPub]);

  return <QCtx.Provider value={value}>{props.children}</QCtx.Provider>;
}
