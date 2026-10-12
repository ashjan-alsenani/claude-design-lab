"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CheckIcon, MagnifyingGlassIcon, PlusIcon } from "@phosphor-icons/react";
import { useQ } from "../app/state";
import { allIdeas, favorCats, ideaKinds, type AnyIdea, type IdeaKind } from "../model/all-ideas";
import type { FavorCat } from "../model/favor-ideas";
import { BabyMascot } from "../ui/Mascot";
import { FavorPhoto, Photo, ideaPhoto, kindPhoto } from "../ui/FavorPhoto";
import { IdeaSheet } from "../ui/IdeaSheet";
import { KindIcon } from "../ui/KindIcon";

/** Each favor gets its own colour variation so the drawings don't all look alike. */
const tints = ["#e8a5b5", "#a9c1dc", "#c9b8e0", "#efd28f", "#bcd3b3", "#f2a07b", "#7fb8e6", "#d9b38c", "#5fb9a0", "#d96aa4"];
const favorTint = (id: string, base: string) => { let h = 0; for (const c of id) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h) % 3 === 0 ? base : tints[Math.abs(h) % tints.length]; };
import { cx } from "../ui/kit";

/**
 * Ready ideas, all distinct: favors, gifts, decor, name signs, hospitality, photos, hospital,
 * aqiqah, keepsakes and thank-you notes. Pick a kind, then add any idea with one tap; it lands in
 * the right place (gift list, favors, hospitality, tasks, or the thank-you message).
 */
export function IdeasPage() {
  const { t, lang, plan, dispatch, newId, access, say, num } = useQ();
  const reduce = useReducedMotion();
  const it = t.ideasT;
  const [kind, setKind] = useState<IdeaKind>("favor");
  const [q, setQ] = useState("");
  const [fc, setFc] = useState<FavorCat | "all">("all");
  const [price, setPrice] = useState<0 | 1 | 2 | 3>(0);
  const [shown, setShown] = useState(20);
  const [open, setOpen] = useState<AnyIdea | null>(null);
  const ar = lang === "ar";
  const text = (x: AnyIdea) => (ar ? x.ar : x.en).replace("{gift}", ar ? "الهدية" : "the gift").replace("{name}", ar ? "يا غالية" : "Dear");

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const found = allIdeas.filter((x) => x.kind === kind && (kind !== "favor" || fc === "all" || x.cat === fc) && (!price || x.price === price) && (!needle || `${x.ar} ${x.en}`.toLowerCase().includes(needle)));
    if (kind !== "favor" || fc !== "all") return found;
    // All favors: take turns between categories so the first page shows a bit of everything.
    const seen: Record<string, number> = {};
    const order = found.map((x) => ({ x, n: (seen[x.cat ?? ""] = (seen[x.cat ?? ""] ?? -1) + 1), c: favorCats.findIndex((c) => c.id === x.cat) }));
    return order.sort((a, b) => a.n - b.n || a.c - b.c).map((o) => o.x);
  }, [kind, fc, price, q]);

  const has = (x: AnyIdea) => {
    const n = text(x);
    if (x.kind === "favor") return plan.favors.some((f) => f.type === n.slice(0, 80));
    if (x.kind === "gift" || x.kind === "mother") return plan.gifts.some((g) => g.name === n.slice(0, 120));
    if (x.kind === "hosp") return plan.hospitality.some((h) => h.name === n.slice(0, 80));
    if (x.kind === "thanks") return plan.thankTemplate === (ar ? x.ar : x.en);
    return plan.tasks.some((k) => k.title === n.slice(0, 160));
  };
  const add = (x: AnyIdea) => {
    if (has(x)) return;
    const n = text(x);
    let ok = false;
    if (x.kind === "favor") ok = dispatch({ t: "put", c: "favors", item: { id: newId("fv"), type: n.slice(0, 80), qtyBase: 0, qtyExtra: 0, unitMinor: 0, feesMinor: 0, depositMinor: 0, status: "idea", qtyReceived: 0, qtyGiven: 0 } });
    else if (x.kind === "gift" || x.kind === "mother") ok = dispatch({ t: "put", c: "gifts", item: { id: newId("gf"), name: n.slice(0, 120), qtyNeeded: 1, priority: x.kind === "mother" ? "optional" : "essential", ...(x.arNote ? { spec: (ar ? x.arNote : x.enNote ?? "").slice(0, 200) } : {}) } });
    else if (x.kind === "hosp") ok = dispatch({ t: "put", c: "hospitality", item: { id: newId("hs"), name: n.slice(0, 80), kind: "custom", unit: "piece", perGuest: 1, servingsPerUnit: 1, reservePct: 10, source: { manual: 20 } } });
    else if (x.kind === "thanks") ok = dispatch({ t: "thankTemplate", text: ar ? x.ar : x.en });
    else ok = dispatch({ t: "put", c: "tasks", item: { id: newId("tk"), title: n.slice(0, 160), area: "reception", status: "todo" } });
    if (ok) say(it.addedToast);
  };
  const pick = (k: IdeaKind) => (setKind(k), setShown(20), setQ(""), setFc("all"), setPrice(0));
  const meta = ideaKinds.find((k) => k.kind === kind)!;

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-3">
        <BabyMascot size={58} theme={plan.profile?.theme} mood="celebrate" />
        <div>
          <h1 className="text-[1.6rem] font-extrabold leading-tight">{it.title}</h1>
          <p className="text-[14px] text-[var(--qd-muted)]">{it.totalCount(num(allIdeas.length))}</p>
        </div>
      </header>

      {/* Kinds as friendly tiles */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {ideaKinds.map((k) => {
          const on = k.kind === kind;
          return (
            <motion.button key={k.kind} type="button" whileTap={reduce ? undefined : { scale: 0.95 }} aria-pressed={on} onClick={() => pick(k.kind)} className={cx("flex flex-col items-center gap-1 rounded-[20px] border-2 px-1 py-2.5 text-center transition-colors", on ? "border-[var(--qd-primary)] bg-[var(--qd-paper)]" : "border-transparent bg-[var(--qd-paper)]/70")}>
              {kindPhoto(k.kind) ? <Photo src={kindPhoto(k.kind)!} className="size-14 rounded-[16px]" /> : <KindIcon kind={k.kind} color={k.color} className="size-10" />}
              <span className="text-[12.5px] font-bold leading-tight">{ar ? k.ar : k.en}</span>
              <span className="text-[11px] text-[var(--qd-muted)]">{num(allIdeas.filter((x) => x.kind === k.kind).length)}</span>
            </motion.button>
          );
        })}
      </div>

      <div className="relative">
        <MagnifyingGlassIcon size={18} className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-[var(--qd-muted)]" />
        <input type="search" value={q} onChange={(e) => (setQ(e.target.value), setShown(20))} placeholder={it.search} aria-label={it.search} className="h-12 w-full rounded-full border border-[var(--qd-line)] bg-[var(--qd-paper)] ps-11 pe-5 text-[15px] outline-none focus:border-[var(--qd-primary)]" />
      </div>

      {kind === "favor" && (
        <div className="space-y-2">
          <div className="qd-scroll-x -mx-4 flex gap-2 overflow-x-auto px-4">
            {[{ id: "all" as const, ar: it.allCats, en: it.allCats, color: "#d9cfc4" }, ...favorCats].map((c) => (
              <button key={c.id} type="button" aria-pressed={fc === c.id} onClick={() => (setFc(c.id), setShown(20))} className={cx("flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold", fc === c.id ? "bg-[var(--qd-primary)] text-white" : "bg-[var(--qd-paper)] text-[var(--qd-ink-soft)]")}>
                <span className="size-2 rounded-full" style={{ background: c.color }} />
                {ar ? c.ar : c.en}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {([0, 1, 2, 3] as const).map((p) => (
              <button key={p} type="button" aria-pressed={price === p} onClick={() => (setPrice(p), setShown(20))} className={cx("h-8 rounded-full px-3 text-[12.5px] font-semibold", price === p ? "bg-[var(--qd-ink)] text-white" : "bg-[var(--qd-paper)] text-[var(--qd-ink-soft)]")}>
                {p === 0 ? it.anyPrice : it.price[p]}
              </button>
            ))}
          </div>
        </div>
      )}

      {list.length === 0 ? (
        <p className="py-8 text-center text-[15px] text-[var(--qd-muted)]">{it.none}</p>
      ) : (
        <ul className="grid gap-2.5 sm:grid-cols-2">
          <AnimatePresence initial={false}>
            {list.slice(0, shown).map((x, i) => {
              const done = has(x);
              const note = ar ? x.arNote : x.enNote;
              const cat = x.cat ? favorCats.find((c) => c.id === x.cat) : undefined;
              return (
                <motion.li key={x.id} initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: Math.min(i, 10) * 0.025 } }} className="qd-card flex min-w-0 items-center gap-3 rounded-[20px] p-3.5">
                  {ideaPhoto(x) ? (
                    <Photo src={ideaPhoto(x)!} className="size-16 shrink-0 rounded-[16px]" />
                  ) : x.kind === "favor" && x.cat ? (
                    <FavorPhoto cat={x.cat} color={favorTint(x.id, cat?.color ?? meta.color)} className="size-16 shrink-0" />
                  ) : (
                    <KindIcon kind={x.kind} color={meta.color} size={20} className="size-10" />
                  )}
                  <button type="button" onClick={() => setOpen(x)} className="min-w-0 flex-1 text-start">
                    <span className={cx("block font-bold leading-snug", x.kind === "thanks" ? "text-[14px]" : "text-[15px]")}>{text(x)}</span>
                    {(note || x.price || cat) && <span className="mt-0.5 block truncate text-[12px] text-[var(--qd-muted)]">{[note, cat && (ar ? cat.ar : cat.en), x.price && it.price[x.price]].filter(Boolean).join(" · ")}</span>}
                    {x.kind !== "thanks" && <span className="mt-1 block text-[12px] font-semibold text-[var(--qd-primary)]">{ar ? "شوفي الشكل ووين تلاقينها" : "See it & where to buy"}</span>}
                  </button>
                  {access.canEdit && (
                    <motion.button whileTap={reduce ? undefined : { scale: 0.85 }} type="button" disabled={done} onClick={() => add(x)} aria-label={done ? it.added : `${t.common.add}: ${text(x)}`} title={done ? it.added : t.common.add} className={cx("grid size-10 shrink-0 place-items-center rounded-full transition-colors", done ? "bg-[var(--qd-sage-soft)] text-[var(--qd-sage)]" : "bg-[var(--qd-primary)] text-white")}>
                      {done ? <CheckIcon size={18} weight="bold" /> : <PlusIcon size={18} weight="bold" />}
                    </motion.button>
                  )}
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
      {list.length > shown && (
        <button type="button" onClick={() => setShown((n) => n + 20)} className="mx-auto block h-11 rounded-full border border-[var(--qd-line)] bg-[var(--qd-paper)] px-6 text-[14px] font-semibold">
          {it.more} ({num(list.length - shown)})
        </button>
      )}
      <p className="text-[12.5px] text-[var(--qd-muted)]">{it.note}</p>
      <IdeaSheet idea={open} text={open ? text(open) : ""} done={open ? has(open) : false} onAdd={() => open && add(open)} onClose={() => setOpen(null)} />
    </div>
  );
}
