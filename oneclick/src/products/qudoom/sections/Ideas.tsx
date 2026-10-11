"use client";

import { useState } from "react";
import {
  BabyCarriageIcon, BathtubIcon, BedIcon, BookOpenIcon, CameraIcon, CheckIcon, CoffeeIcon, CookieIcon, CoffeeBeanIcon, DropIcon, FireIcon, FlowerIcon, FrameCornersIcon, GiftIcon,
  HeartIcon, MoonStarsIcon, MusicNotesIcon, PenNibIcon, PlantIcon, PlusIcon, SparkleIcon, StarIcon, TShirtIcon, BabyIcon, CakeIcon, FlowerLotusIcon, PintGlassIcon, ShoppingBagIcon, type Icon,
} from "@phosphor-icons/react";
import { useQ } from "../app/state";
import { ideas, type Idea, type IdeaCat, type IdeaIcon } from "../model/ideas";
import { favorBases, favorCats, favorIdeas, favorStyles, type FavorBase, type FavorCat } from "../model/favor-ideas";
import { BabyMascot } from "../ui/Mascot";
import { cx } from "../ui/kit";

const icons: Record<IdeaIcon, Icon> = {
  shirt: TShirtIcon, bed: BedIcon, bath: BathtubIcon, book: BookOpenIcon, camera: CameraIcon, stroller: BabyCarriageIcon, blanket: BabyIcon, toy: StarIcon, music: MusicNotesIcon,
  frame: FrameCornersIcon, bottle: PintGlassIcon, moon: MoonStarsIcon, cookie: CookieIcon, candle: FireIcon, plant: PlantIcon, drop: DropIcon, candy: CakeIcon, coffee: CoffeeBeanIcon,
  flower: FlowerIcon, soap: SparkleIcon, bag: ShoppingBagIcon, star: StarIcon, heart: HeartIcon, sparkle: SparkleIcon, gift: GiftIcon, spa: FlowerLotusIcon, cup: CoffeeIcon, pen: PenNibIcon,
};

/** Ready gift and favor ideas: tap once to add a gift to the list or a favor to the favors plan. */
export function IdeasPage() {
  const { t, lang, plan, dispatch, newId, access, say } = useQ();
  const it = t.ideasT;
  const [cat, setCat] = useState<IdeaCat>("baby");
  const list = ideas.filter((x) => x.cat === cat && x.cat !== "favor");
  const name = (x: Idea) => (lang === "ar" ? x.ar : x.en);
  const has = (x: Idea) => (x.cat === "favor" ? plan.favors.some((f) => f.type === name(x)) : plan.gifts.some((g) => g.name === name(x)));
  const add = (x: Idea) => {
    if (has(x)) return;
    const note = lang === "ar" ? x.arNote : x.enNote;
    const ok =
      x.cat === "favor"
        ? dispatch({ t: "put", c: "favors", item: { id: newId("fv"), type: name(x), notes: note, qtyBase: 0, qtyExtra: 0, unitMinor: 0, feesMinor: 0, depositMinor: 0, status: "idea", qtyReceived: 0, qtyGiven: 0 } })
        : dispatch({ t: "put", c: "gifts", item: { id: newId("gf"), name: name(x), spec: note, qtyNeeded: 1, priority: x.cat === "mother" ? "optional" : "essential" } });
    if (ok) say(it.addedToast);
  };
  const tabs: { k: IdeaCat; l: string }[] = [
    { k: "baby", l: it.baby },
    { k: "favor", l: it.favor },
    { k: "mother", l: it.mother },
  ];
  return (
    <div className="space-y-5">
      <header className="flex items-center gap-3">
        <BabyMascot size={60} theme={plan.profile?.theme} mood="celebrate" />
        <div>
          <h1 className="text-[1.6rem] font-extrabold leading-tight">{it.title}</h1>
          <p className="text-[14px] text-[var(--qd-muted)]">{it.sub}</p>
        </div>
      </header>
      <div role="tablist" aria-label={it.title} className="qd-scroll-x -mx-4 flex gap-2 overflow-x-auto px-4">
        {tabs.map((x) => (
          <button key={x.k} type="button" role="tab" aria-selected={cat === x.k} onClick={() => setCat(x.k)} className={cx("h-10 shrink-0 rounded-full px-4 text-[14px] font-semibold transition-colors", cat === x.k ? "bg-[var(--qd-ink)] text-white" : "bg-white/90 text-[var(--qd-ink-soft)] shadow-[0_4px_14px_-10px_rgb(30_27_58/.4)]")}>
            {x.l}
          </button>
        ))}
      </div>
      {cat === "favor" ? <FavorBrowser /> : (
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {list.map((x) => {
          const I = icons[x.icon];
          const done = has(x);
          return (
            <li key={x.id} className="qd-card flex flex-col rounded-[24px] p-3.5">
              <span className="grid size-14 place-items-center rounded-[18px]" style={{ background: `color-mix(in oklab, ${x.color} 20%, #fff)`, color: `color-mix(in oklab, ${x.color} 80%, #1e1b3a)` }}>
                <I size={28} weight="fill" />
              </span>
              <p className="mt-2.5 text-[15px] font-bold leading-snug">{name(x)}</p>
              <p className="mt-0.5 flex-1 text-[12.5px] leading-snug text-[var(--qd-muted)]">{lang === "ar" ? x.arNote : x.enNote}</p>
              <p className="mt-1.5 text-[12px] font-semibold text-[var(--qd-ink-soft)]">{"●".repeat(x.price)}<span className="opacity-30">{"●".repeat(3 - x.price)}</span> {it.price[x.price]}</p>
              {access.canEdit && (
                <button type="button" disabled={done} onClick={() => add(x)} className={cx("mt-3 inline-flex h-9 w-fit items-center gap-1 rounded-full px-3.5 text-[13px] font-bold transition-colors", done ? "bg-[var(--qd-sage-soft)] text-[var(--qd-sage)]" : "bg-[var(--qd-primary)] text-white active:scale-[0.97]")}>
                  {done ? <CheckIcon size={14} weight="bold" /> : <PlusIcon size={14} weight="bold" />}
                  {done ? it.added : x.cat === "favor" ? it.addFavor : it.addGift}
                </button>
              )}
            </li>
          );
        })}
      </ul>
      )}
      <p className="text-[12.5px] text-[var(--qd-muted)]">{it.note}</p>
    </div>
  );
}

/** About a thousand favor ideas: 256 favors × 4 ways to present them. Search, filter, pick a style, add. */
function FavorBrowser() {
  const { t, lang, plan, dispatch, newId, access, say, num } = useQ();
  const it = t.ideasT;
  const [q, setQ] = useState("");
  const [fc, setFc] = useState<FavorCat | "all">("all");
  const [price, setPrice] = useState<0 | 1 | 2 | 3>(0);
  const [shown, setShown] = useState(24);
  const [style, setStyle] = useState<Record<string, string>>({});
  const text = (b: FavorBase) => (lang === "ar" ? b.ar : b.en);
  const needle = q.trim().toLowerCase();
  const list = favorBases.filter((b) => (fc === "all" || b.cat === fc) && (!price || b.price === price) && (!needle || `${b.ar} ${b.en}`.toLowerCase().includes(needle)));
  const nameOf = (b: FavorBase, sid: string) => {
    const st = favorStyles.find((x) => x.id === sid)!;
    return `${text(b)} ${lang === "ar" ? st.ar : st.en}`;
  };
  const add = (b: FavorBase) => {
    const sid = style[b.id] ?? favorStyles[0].id;
    const name = nameOf(b, sid).slice(0, 80);
    if (plan.favors.some((f) => f.type === name)) return;
    if (dispatch({ t: "put", c: "favors", item: { id: newId("fv"), type: name, qtyBase: 0, qtyExtra: 0, unitMinor: 0, feesMinor: 0, depositMinor: 0, status: "idea", qtyReceived: 0, qtyGiven: 0 } })) say(it.addedToast);
  };
  const catOf = (c: FavorCat) => favorCats.find((x) => x.id === c)!;
  return (
    <div className="space-y-4">
      <p className="text-[14px] font-semibold text-[var(--qd-primary)]">{it.count(num(favorIdeas.length))}</p>
      <input type="search" value={q} onChange={(e) => (setQ(e.target.value), setShown(24))} placeholder={it.search} aria-label={it.search} className="h-12 w-full rounded-full border border-[var(--qd-line)] bg-[var(--qd-paper)] px-5 text-[15px] outline-none focus:border-[var(--qd-primary)]" />
      <div className="qd-scroll-x -mx-4 flex gap-2 overflow-x-auto px-4">
        {[{ id: "all" as const, ar: it.allCats, en: it.allCats, color: "#d9cfc4" }, ...favorCats].map((c) => (
          <button key={c.id} type="button" aria-pressed={fc === c.id} onClick={() => (setFc(c.id), setShown(24))} className={cx("flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-[13.5px] font-semibold", fc === c.id ? "bg-[var(--qd-primary)] text-white" : "bg-[var(--qd-paper)] text-[var(--qd-ink-soft)]")}>
            <span className="size-2.5 rounded-full" style={{ background: c.color }} />
            {lang === "ar" ? c.ar : c.en}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        {([0, 1, 2, 3] as const).map((p) => (
          <button key={p} type="button" aria-pressed={price === p} onClick={() => (setPrice(p), setShown(24))} className={cx("h-9 rounded-full px-3.5 text-[13px] font-semibold", price === p ? "bg-[var(--qd-ink)] text-white" : "bg-[var(--qd-paper)] text-[var(--qd-ink-soft)]")}>
            {p === 0 ? it.anyPrice : it.price[p]}
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <p className="py-8 text-center text-[15px] text-[var(--qd-muted)]">{it.none}</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {list.slice(0, shown).map((b) => {
            const sid = style[b.id] ?? favorStyles[0].id;
            const done = plan.favors.some((f) => f.type === nameOf(b, sid).slice(0, 80));
            const c = catOf(b.cat);
            return (
              <li key={b.id} className="qd-card min-w-0 rounded-[22px] p-4">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-11 shrink-0 place-items-center rounded-[14px]" style={{ background: `color-mix(in oklab, ${c.color} 45%, var(--qd-paper))`, color: `color-mix(in oklab, ${c.color} 35%, #3b3346)` }}>
                    <GiftIcon size={22} weight="fill" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[15.5px] font-bold leading-snug">{text(b)}</p>
                    <p className="mt-0.5 text-[12px] text-[var(--qd-muted)]">{lang === "ar" ? c.ar : c.en} · {it.price[b.price]}</p>
                  </div>
                </div>
                <p className="mt-3 text-[12px] font-semibold text-[var(--qd-ink-soft)]">{it.way}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {favorStyles.map((st) => (
                    <button key={st.id} type="button" aria-pressed={sid === st.id} onClick={() => setStyle((m) => ({ ...m, [b.id]: st.id }))} className={cx("rounded-full border px-3 py-1.5 text-[12px]", sid === st.id ? "border-[var(--qd-primary)] bg-[var(--qd-tint)] font-semibold text-[var(--qd-primary-deep)]" : "border-[var(--qd-line)] bg-[var(--qd-paper)] text-[var(--qd-ink-soft)]")}>
                      {lang === "ar" ? st.ar : st.en}
                    </button>
                  ))}
                </div>
                {access.canEdit && (
                  <button type="button" disabled={done} onClick={() => add(b)} className={cx("mt-3 inline-flex h-9 items-center gap-1 rounded-full px-3.5 text-[13px] font-bold", done ? "bg-[var(--qd-sage-soft)] text-[var(--qd-sage)]" : "bg-[var(--qd-primary)] text-white")}>
                    {done ? <CheckIcon size={14} weight="bold" /> : <PlusIcon size={14} weight="bold" />}
                    {done ? it.added : it.addFavor}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {list.length > shown && (
        <button type="button" onClick={() => setShown((n) => n + 24)} className="mx-auto block h-11 rounded-full border border-[var(--qd-line)] bg-[var(--qd-paper)] px-6 text-[14px] font-semibold">
          {it.more} ({num(list.length - shown)})
        </button>
      )}
    </div>
  );
}
