"use client";

import { useState } from "react";
import {
  BabyCarriageIcon, BathtubIcon, BedIcon, BookOpenIcon, CameraIcon, CheckIcon, CoffeeIcon, CookieIcon, CoffeeBeanIcon, DropIcon, FireIcon, FlowerIcon, FrameCornersIcon, GiftIcon,
  HeartIcon, MoonStarsIcon, MusicNotesIcon, PenNibIcon, PlantIcon, PlusIcon, SparkleIcon, StarIcon, TShirtIcon, BabyIcon, CakeIcon, FlowerLotusIcon, PintGlassIcon, ShoppingBagIcon, type Icon,
} from "@phosphor-icons/react";
import { useQ } from "../app/state";
import { ideas, type Idea, type IdeaCat, type IdeaIcon } from "../model/ideas";
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
  const list = ideas.filter((x) => x.cat === cat);
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
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
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
      <p className="text-[12.5px] text-[var(--qd-muted)]">{it.note}</p>
    </div>
  );
}
