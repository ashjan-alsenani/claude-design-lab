"use client";

import { useState } from "react";
import { ArrowSquareOutIcon, CheckIcon, InstagramLogoIcon, MagnifyingGlassIcon, MapPinIcon, PlusIcon, StorefrontIcon, TagIcon, type Icon } from "@phosphor-icons/react";
import { useQ } from "../app/state";
import { favorCats, ideaKinds, type AnyIdea } from "../model/all-ideas";
import { whereLinks, type WhereLink } from "../model/where";
import { ideaPhoto, Photo } from "./FavorPhoto";
import { FavorArt } from "./Illustrations";
import { KindIcon } from "./KindIcon";
import { Sheet, inputCls } from "./kit";

const linkIcons: Record<WhereLink["id"], Icon> = { maps: MapPinIcon, instagram: InstagramLogoIcon, shopping: TagIcon, noon: StorefrontIcon, amazon: StorefrontIcon, web: MagnifyingGlassIcon };

/**
 * One idea, opened: a sample photo of how it could look, the add button, and «وين ألاقيها»: search
 * links local to her country and city (no shop is recommended or paid to appear).
 */
export function IdeaSheet({ idea, text, done, onAdd, onClose }: { idea: AnyIdea | null; text: string; done: boolean; onAdd: () => void; onClose: () => void }) {
  const { lang, plan, dispatch, access, t } = useQ();
  const ar = lang === "ar";
  const p = plan.profile!;
  const [city, setCity] = useState(p.city ?? "");
  if (!idea) return <Sheet open={false} onClose={onClose} title="">{null}</Sheet>;
  const meta = ideaKinds.find((k) => k.kind === idea.kind)!;
  const cat = idea.cat ? favorCats.find((c) => c.id === idea.cat) : undefined;
  const src = ideaPhoto(idea);
  const links = whereLinks({ text, kind: idea.kind, country: p.country, city: p.city, lang });
  const note = ar ? idea.arNote : idea.enNote;
  return (
    <Sheet open onClose={onClose} title={ar ? meta.ar : meta.en} wide>
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-[22px] bg-[var(--qd-tint-2)]">
          {src ? (
            <div className="grid place-items-center py-4"><Photo src={src} alt={text} className="size-56 rounded-[22px] shadow-[0_18px_40px_-24px_rgba(90,85,112,.6)]" /></div>
          ) : idea.kind === "favor" && idea.cat ? (
            <div className="grid aspect-[4/3] place-items-center"><FavorArt cat={idea.cat} color={cat?.color ?? meta.color} className="size-40" /></div>
          ) : (
            <div className="grid aspect-[4/3] place-items-center"><KindIcon kind={idea.kind} color={meta.color} size={56} className="size-28" /></div>
          )}
          {src && <span className="absolute bottom-2 start-2 rounded-full bg-white/85 px-2.5 py-1 text-[11.5px] font-semibold text-[var(--qd-ink-soft)]">{ar ? "صورة تقريبية بالذكاء الاصطناعي" : "Approximate AI photo"}</span>}
        </div>
        <div>
          <p className="text-[1.2rem] font-extrabold leading-snug">{text}</p>
          {(note || cat || idea.price) && <p className="mt-1 text-[13.5px] text-[var(--qd-muted)]">{[note, cat && (ar ? cat.ar : cat.en), idea.price && t.ideasT.price[idea.price]].filter(Boolean).join(" · ")}</p>}
        </div>
        {access.canEdit && (
          <button type="button" disabled={done} onClick={onAdd} className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--qd-primary)] text-[15px] font-bold text-white disabled:bg-[var(--qd-sage-soft)] disabled:text-[var(--qd-sage)]">
            {done ? <CheckIcon size={18} weight="bold" /> : <PlusIcon size={18} weight="bold" />} {done ? t.ideasT.added : ar ? "أضيفيها لخطتي" : "Add to my plan"}
          </button>
        )}
        {links.length > 0 && (
          <section className="space-y-2.5" aria-labelledby="qd-where">
            <h3 id="qd-where" className="text-[1.05rem] font-extrabold">{ar ? "وين ألاقيها؟" : "Where can I find it?"}</h3>
            {access.canEdit && !p.city && (
              <div className="flex items-end gap-2 rounded-[18px] bg-[var(--qd-tint-2)] p-3">
                <label className="flex-1 text-[13px] font-medium text-[var(--qd-ink-soft)]">
                  {ar ? "مدينتك (عشان تطلع لك المحلات القريبة)" : "Your city (for nearby shops)"}
                  <input className={`${inputCls} mt-1`} value={city} maxLength={60} onChange={(e) => setCity(e.target.value)} placeholder={ar ? "مثال: مسقط" : "e.g. Muscat"} />
                </label>
                <button type="button" disabled={!city.trim()} onClick={() => dispatch({ t: "profile", patch: { city: city.trim() } })} className="h-12 rounded-full bg-[var(--qd-primary)] px-4 text-[14px] font-bold text-white disabled:opacity-50">{ar ? "حفظ" : "Save"}</button>
              </div>
            )}
            <ul className="grid gap-2 sm:grid-cols-2">
              {links.map((l) => {
                const I = linkIcons[l.id];
                return (
                  <li key={l.id}>
                    <a href={l.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-[16px] bg-[var(--qd-paper)] p-3 ring-1 ring-[var(--qd-line)] hover:ring-[var(--qd-primary)]">
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--qd-tint)] text-[var(--qd-primary)]"><I size={18} weight="duotone" /></span>
                      <span className="min-w-0 flex-1 text-[14px] font-semibold">{l.label[lang]}</span>
                      <ArrowSquareOutIcon size={16} className="shrink-0 text-[var(--qd-muted)]" />
                    </a>
                  </li>
                );
              })}
            </ul>
            <p className="text-[12px] text-[var(--qd-muted)]">{ar ? "روابط بحث عامة حسب بلدك ومدينتك. ما نرشح محل معيّن ولا ناخذ عمولة." : "General searches for your country and city. We don't recommend any shop or take commissions."}</p>
          </section>
        )}
      </div>
    </Sheet>
  );
}
