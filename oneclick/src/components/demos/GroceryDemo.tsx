"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { BasketIcon, PlusIcon, StarIcon } from "@phosphor-icons/react/dist/ssr";
import { CheckRow, ProductShell, StatTile, useList } from "@/framework";
import { num, type Locale } from "@/i18n/config";
import { formatMoney } from "@/lib/money";
import { useDemoTracker } from "./useDemoTracker";

type Section = "produce" | "dairy" | "bakery" | "home";
type Item = { id: string; name: { en: string; ar: string }; section: Section; price: number; done: boolean; fav?: boolean };

const sectionNames: Record<Section, { en: string; ar: string }> = {
  produce: { en: "Fruit & veg", ar: "خضار وفواكه" },
  dairy: { en: "Dairy", ar: "ألبان" },
  bakery: { en: "Bakery", ar: "مخبوزات" },
  home: { en: "Household", ar: "منظفات وبيت" },
};

// SAMPLE DATA: illustrative items and prices in OMR.
const initial: Item[] = [
  { id: "1", name: { en: "Tomatoes 1kg", ar: "طماط ١ كيلو" }, section: "produce", price: 0.45, done: true, fav: true },
  { id: "2", name: { en: "Bananas", ar: "موز" }, section: "produce", price: 0.6, done: false },
  { id: "3", name: { en: "Laban 2L", ar: "لبن ٢ لتر" }, section: "dairy", price: 1.1, done: false, fav: true },
  { id: "4", name: { en: "Eggs (30)", ar: "بيض (٣٠)" }, section: "dairy", price: 1.65, done: false, fav: true },
  { id: "5", name: { en: "Arabic bread", ar: "خبز عربي" }, section: "bakery", price: 0.3, done: true },
  { id: "6", name: { en: "Dish soap", ar: "صابون صحون" }, section: "home", price: 0.85, done: false },
];

const t = {
  title: { en: "Weekly shop", ar: "مقاضي الأسبوع" },
  estimated: { en: "Estimated", ar: "تقديري" },
  remaining: { en: "Left to buy", ar: "باقي" },
  inCart: { en: "In cart", ar: "في السلة" },
  add: { en: "Add an item", ar: "أضف غرض" },
  addBtn: { en: "Add", ar: "أضف" },
  quick: { en: "Your regulars", ar: "أغراضك المعتادة" },
  items: { en: "items", ar: "أغراض" },
};

export function GroceryDemo({ locale, hue }: { locale: Locale; hue: string }) {
  const { items, update, add } = useList<Item>(initial);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const reduce = useReducedMotion();
  const touched = useDemoTracker("grocery");

  const totals = useMemo(() => {
    const sum = (xs: Item[]) => xs.reduce((a, x) => a + x.price, 0);
    return { all: sum(items), left: sum(items.filter((i) => !i.done)), cart: items.filter((i) => i.done).length };
  }, [items]);

  const grouped = (Object.keys(sectionNames) as Section[])
    .map((s) => ({ s, list: items.filter((i) => i.section === s) }))
    .filter((g) => g.list.length);

  const omr = (v: number) => formatMoney({ amountMinor: Math.round(v * 1000), currency: "OMR" }, locale);

  function addItem(name: string) {
    const n = name.trim();
    if (!n) return;
    touched();
    add({ id: crypto.randomUUID(), name: { en: n, ar: n }, section: "home", price: 0.5, done: false });
    setDraft("");
    inputRef.current?.focus();
  }

  return (
    <ProductShell title={t.title[locale]} hue={hue} icon={<BasketIcon size={18} weight="bold" />} badge={locale === "ar" ? "تجريبي" : "Demo"}>
      <div className="grid grid-cols-3 gap-2">
        <StatTile label={t.estimated[locale]} value={omr(totals.all)} />
        <StatTile label={t.remaining[locale]} value={omr(totals.left)} color={hue} />
        <StatTile label={t.inCart[locale]} value={<span dir="ltr">{`${num(totals.cart, locale)}/${num(items.length, locale)}`}</span>} />
      </div>

      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          addItem(draft);
        }}
      >
        <label htmlFor="grocery-add" className="sr-only">
          {t.add[locale]}
        </label>
        <input
          id="grocery-add"
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={t.add[locale]}
          maxLength={40}
          className="h-11 min-w-0 flex-1 rounded-full border border-line-strong bg-bg px-4 text-ink placeholder:text-muted focus:border-[var(--oc-primary)] focus:outline-none"
        />
        <button type="submit" className="grid size-11 place-items-center rounded-full text-white active:scale-95" style={{ background: hue }} aria-label={t.addBtn[locale]}>
          <PlusIcon size={18} weight="bold" />
        </button>
      </form>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted">{t.quick[locale]}</span>
        {[
          { en: "Milk", ar: "حليب" },
          { en: "Rice 5kg", ar: "عيش ٥ كيلو" },
          { en: "Dates", ar: "تمر" },
        ].map((q) => (
          <button
            key={q.en}
            type="button"
            onClick={() => addItem(q[locale])}
            className="inline-flex items-center gap-1 rounded-full border border-line px-3 py-1 text-xs text-ink-soft hover:border-line-strong active:scale-95"
          >
            <StarIcon size={12} weight="fill" color="var(--oc-accent)" />
            {q[locale]}
          </button>
        ))}
      </div>

      <div className="mt-4 max-h-[300px] space-y-3 overflow-y-auto pe-1">
        {grouped.map(({ s, list }) => (
          <section key={s} aria-label={sectionNames[s][locale]}>
            <h4 className="px-2 text-xs font-semibold text-muted">
              {sectionNames[s][locale]} <span className="font-normal">· {num(list.length, locale)}</span>
            </h4>
            <ul>
              <AnimatePresence initial={false}>
                {list.map((i) => (
                  <motion.li
                    key={i.id}
                    layout={!reduce}
                    initial={reduce ? false : { opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <CheckRow
                      checked={i.done}
                      color={hue}
                      onToggle={() => {
                        touched();
                        update(i.id, { done: !i.done });
                      }}
                      meta={omr(i.price)}
                    >
                      {i.name[locale]}
                    </CheckRow>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </section>
        ))}
      </div>
    </ProductShell>
  );
}
