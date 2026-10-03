"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { bridalCopy, type BridalCopy, type Lang } from "../i18n";
import { milestones, resolveTasks } from "../model/engine";
import { applyOp } from "../model/reducer";
import type { Op } from "../model/schema";
import type { Task, Workspace } from "../model/types";

export type SyncResult = { ok: true; version: number; doc?: Workspace } | { ok: false; reason: "denied" | "invalid" | "unavailable" | "too_large" | "rate_limited" };
export type SyncFn = (ops: Op[], baseVersion: number) => Promise<SyncResult>;
type SaveState = "idle" | "saving" | "saved" | "error";

type Ctx = {
  ws: Workspace;
  tasks: Task[];
  today: string;
  lang: Lang;
  t: BridalCopy;
  mode: "licensed" | "demo";
  base: string;
  locale: string;
  href: (section?: string) => string;
  dispatch: (op: Op) => boolean;
  saveState: SaveState;
  retry: () => void;
  money: (n: number, opts?: { cents?: boolean }) => string;
  num: (n: number) => string;
  /** 0..100 -> "42%" / "٤٢٪" */
  pct: (n: number) => string;
  date: (iso: string, style?: "short" | "long" | "weekday" | "month") => string;
  rel: (iso: string) => string;
  newId: (prefix: string) => string;
  celebration: string | null;
  dismissCelebration: () => void;
};

const BridalContext = createContext<Ctx | null>(null);

export function useBridal() {
  const c = useContext(BridalContext);
  if (!c) throw new Error("useBridal outside provider");
  return c;
}

export function BridalProvider(props: { initial: Workspace; version: number; today: string; lang: Lang; locale: string; base: string; mode: "licensed" | "demo"; sync?: SyncFn; children: ReactNode }) {
  const { lang, today, sync, mode } = props;
  const [ws, setWsState] = useState(props.initial);
  const wsRef = useRef(props.initial);
  const setWs = useCallback((next: Workspace) => {
    wsRef.current = next;
    setWsState(next);
  }, []);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [celebration, setCelebration] = useState<string | null>(null);
  const queue = useRef<Op[]>([]);
  const version = useRef(props.version);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inflight = useRef(false);
  const t = bridalCopy[lang];

  const flush = useCallback(async () => {
    if (!sync || inflight.current || queue.current.length === 0) return;
    const ops = queue.current;
    queue.current = [];
    inflight.current = true;
    setSaveState("saving");
    try {
      const r = await sync(ops, version.current);
      if (!r.ok) throw new Error(r.reason);
      version.current = r.version;
      if (r.doc && queue.current.length === 0) setWs(r.doc);
      setSaveState(queue.current.length ? "saving" : "saved");
    } catch {
      queue.current = [...ops, ...queue.current];
      setSaveState("error");
    } finally {
      inflight.current = false;
      if (queue.current.length && saveState !== "error") timer.current = setTimeout(flush, 600);
    }
  }, [sync, saveState, setWs]);

  const dispatch = useCallback(
    (op: Op) => {
      let next: Workspace;
      try {
        next = applyOp(wsRef.current, op);
      } catch {
        return false; // invalid input: the form shows a calm message, nothing is saved
      }
      setWs(next);
      if (sync) {
        queue.current.push(op);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(flush, 350);
        setSaveState("saving");
      }
      return true;
    },
    [sync, flush, setWs]
  );

  // Never lose a change: try to send pending edits when the tab is hidden.
  useEffect(() => {
    const onHide = () => void flush();
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, [flush]);

  const tasks = useMemo(() => resolveTasks(ws, lang), [ws, lang]);

  // Elegant celebration for newly reached milestones (once each).
  useEffect(() => {
    if (!ws.profile) return;
    const fresh = milestones(ws, tasks, lang).find((m) => !ws.seenMilestones.includes(m.id));
    if (fresh) {
      setCelebration(fresh.label);
      dispatch({ t: "seen", id: fresh.id });
    }
  }, [ws, tasks, lang, dispatch]);

  const value = useMemo<Ctx>(() => {
    const loc = lang === "ar" ? "ar-OM" : "en-GB";
    const nf = new Intl.NumberFormat(loc);
    const currency = ws.profile?.currency ?? "OMR";
    const money = (n: number, opts?: { cents?: boolean }) =>
      new Intl.NumberFormat(loc, { style: "currency", currency, currencyDisplay: lang === "ar" ? "name" : "code", maximumFractionDigits: opts?.cents ? 2 : 0, minimumFractionDigits: 0 })
        .format(n)
        .replace("عُماني", "ع.")
        .replace(/ /g, " ");
    const fmt = {
      short: new Intl.DateTimeFormat(loc, { day: "numeric", month: "short", timeZone: "UTC" }),
      long: new Intl.DateTimeFormat(loc, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }),
      weekday: new Intl.DateTimeFormat(loc, { weekday: "long", day: "numeric", month: "short", timeZone: "UTC" }),
      month: new Intl.DateTimeFormat(loc, { month: "long", year: "numeric", timeZone: "UTC" }),
    };
    const date = (iso: string, style: keyof typeof fmt = "short") => fmt[style].format(new Date(`${iso}T00:00:00Z`));
    const rel = (iso: string) => {
      const d = Math.round((Date.parse(`${iso}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000);
      if (d === 0) return t.common.today;
      if (d === 1) return t.common.tomorrow;
      if (d > 1 && d <= 13) return t.common.inDays(nf.format(d));
      if (d < 0 && d >= -13) return t.common.daysAgo(nf.format(-d));
      return date(iso);
    };
    return {
      ws,
      tasks,
      today,
      lang,
      t,
      mode,
      base: props.base,
      locale: props.locale,
      href: (s?: string) => (s ? `${props.base}/${s}` : props.base),
      dispatch,
      saveState,
      retry: () => {
        setSaveState("saving");
        void flush();
      },
      money,
      num: (n: number) => nf.format(n),
      pct: (n: number) => new Intl.NumberFormat(loc, { style: "percent", maximumFractionDigits: 0 }).format(n / 100),
      date,
      rel,
      newId: (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      celebration,
      dismissCelebration: () => setCelebration(null),
    };
  }, [ws, tasks, today, lang, t, mode, props.base, props.locale, dispatch, saveState, flush, celebration]);

  return <BridalContext.Provider value={value}>{props.children}</BridalContext.Provider>;
}
