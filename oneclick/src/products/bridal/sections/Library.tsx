"use client";

import { useState } from "react";
import { FileTextIcon, HeartIcon, ImagesIcon, LinkSimpleIcon, LockSimpleIcon, PlusIcon, UploadSimpleIcon } from "@phosphor-icons/react";
import { useBridal } from "../app/state";
import type { DocCat, DocRecord, MoodCat, MoodItem } from "../model/types";
import { ArtTile, moodMotif } from "../ui/Art";
import { EntitySheet, type FieldSpec } from "../ui/EntitySheet";
import { Badge, Button, Chips, EmptyState, SectionHeader, cx } from "../ui/kit";

/** Private, Pinterest-style moodboard. */
export function Moodboard() {
  const { t, ws, dispatch, newId } = useBridal();
  const M = t.mood;
  const [cat, setCat] = useState<MoodCat | "all" | "fav">("all");
  const [edit, setEdit] = useState<Partial<MoodItem> | null>(null);
  const cats = (Object.keys(M.cats) as MoodCat[]).filter((c) => ws.mood.some((m) => m.cat === c));
  const shown = ws.mood.filter((m) => (cat === "all" ? true : cat === "fav" ? m.fav : m.cat === cat));
  const fields: FieldSpec[] = [
    { key: "image", label: t.common.photo, kind: "image" },
    { key: "cat", label: t.common.category, kind: "select", required: true, options: (Object.keys(M.cats) as MoodCat[]).map((c) => ({ value: c, label: M.cats[c] })) },
    { key: "link", label: M.link, kind: "url", hint: "https://" },
    { key: "note", label: t.common.notes, kind: "textarea" },
    { key: "fav", label: M.favorite, kind: "check" },
  ];
  return (
    <div className="space-y-6">
      <SectionHeader
        title={M.title}
        sub={M.sub}
        action={
          <Button onClick={() => setEdit({ cat: "dress", tone: ws.mood.length % 8 })}>
            <PlusIcon size={15} />
            {M.add}
          </Button>
        }
      />
      {ws.mood.length > 0 && (
        <Chips
          label={t.common.category}
          value={cat}
          onChange={(v) => setCat(v as typeof cat)}
          options={[{ value: "all", label: t.common.all }, { value: "fav", label: `♡ ${M.favorites}` }, ...cats.map((c) => ({ value: c, label: M.cats[c] }))] as { value: MoodCat | "all"; label: string }[]}
        />
      )}
      {ws.mood.length === 0 ? (
        <EmptyState icon={<ImagesIcon size={24} weight="regular" />} title={M.empty} action={<Button onClick={() => setEdit({ cat: "dress", tone: 0 })}>{M.add}</Button>} />
      ) : (
        <ul className="columns-2 gap-4 md:columns-3 xl:columns-4">
          {shown.map((m, i) => (
            <li key={m.id} className="mb-4 break-inside-avoid">
              <div className="group relative overflow-hidden rounded-[18px] border border-bj-line bg-bj-paper">
                <button type="button" onClick={() => setEdit(m)} className="block w-full text-start">
                  {m.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.image} alt={m.note ?? M.cats[m.cat]} className="w-full object-cover" />
                  ) : (
                    <ArtTile motif={moodMotif[m.cat]} tone={m.tone ?? i} className={cx("w-full", i % 3 === 0 ? "aspect-[3/4]" : i % 3 === 1 ? "aspect-square" : "aspect-[4/5]")} />
                  )}
                  <div className="px-3.5 py-3">
                    <Badge tone="rose">{M.cats[m.cat]}</Badge>
                    {m.note && <p className="mt-2 text-[13.5px] leading-snug text-bj-ink">{m.note}</p>}
                    {m.link && (
                      <p className="mt-1.5 flex items-center gap-1 truncate text-[12px] text-bj-muted" dir="ltr">
                        <LinkSimpleIcon size={13} />
                        {m.link.replace(/^https?:\/\//, "")}
                      </p>
                    )}
                  </div>
                </button>
                <button
                  type="button"
                  aria-pressed={!!m.fav}
                  aria-label={M.favorite}
                  onClick={() => dispatch({ t: "put", c: "mood", item: { ...m, fav: !m.fav } })}
                  className="absolute end-2.5 top-2.5 grid size-9 place-items-center rounded-full bg-bj-paper/90 text-bj-rose shadow-sm backdrop-blur"
                >
                  <HeartIcon size={17} weight={m.fav ? "fill" : "light"} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <EntitySheet
        open={!!edit}
        onClose={() => setEdit(null)}
        title={edit?.id ? M.cats[edit.cat ?? "dress"] : M.add}
        fields={fields}
        initial={(edit ?? {}) as Record<string, string | number | boolean | undefined>}
        onSave={(item) => dispatch({ t: "put", c: "mood", item: { ...item, tone: edit?.tone ?? 0, id: edit?.id ?? newId("m") } })}
        onDelete={edit?.id ? () => dispatch({ t: "del", c: "mood", id: edit.id! }) : undefined}
      />
    </div>
  );
}

/** Document vault (details now; private file storage connects at launch). */
export function Documents() {
  const { t, ws, dispatch, newId, date } = useBridal();
  const Dc = t.docs;
  const [cat, setCat] = useState<DocCat | "all">("all");
  const [edit, setEdit] = useState<Partial<DocRecord> | null>(null);
  const cats = (Object.keys(Dc.cats) as DocCat[]).filter((c) => ws.docs.some((d) => d.cat === c));
  const shown = cat === "all" ? ws.docs : ws.docs.filter((d) => d.cat === cat);
  const fields: FieldSpec[] = [
    { key: "name", label: t.common.name, kind: "text", required: true },
    { key: "cat", label: t.common.category, kind: "select", required: true, half: true, options: (Object.keys(Dc.cats) as DocCat[]).map((c) => ({ value: c, label: Dc.cats[c] })) },
    { key: "date", label: t.common.date, kind: "date", half: true },
    { key: "holder", label: Dc.holder, kind: "text" },
    { key: "notes", label: t.common.notes, kind: "textarea" },
  ];
  return (
    <div className="space-y-6">
      <SectionHeader
        title={Dc.title}
        sub={Dc.sub}
        action={
          <Button onClick={() => setEdit({ cat: "contract" })}>
            <PlusIcon size={15} />
            {Dc.add}
          </Button>
        }
      />
      <p className="flex items-center gap-2 text-[13px] text-bj-muted">
        <LockSimpleIcon size={15} className="text-bj-sage" />
        {Dc.privacy}
      </p>
      {cats.length > 1 && <Chips label={t.common.category} value={cat} onChange={setCat} options={[{ value: "all", label: t.common.all }, ...cats.map((c) => ({ value: c, label: Dc.cats[c] }))]} />}
      {ws.docs.length === 0 ? (
        <EmptyState icon={<FileTextIcon size={24} weight="regular" />} title={Dc.empty} action={<Button onClick={() => setEdit({ cat: "contract" })}>{Dc.add}</Button>} />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((d) => (
            <li key={d.id}>
              <button type="button" onClick={() => setEdit(d)} className="flex w-full items-start gap-3 rounded-[18px] border border-bj-line bg-bj-paper p-4 text-start hover:border-bj-taupe/40">
                <ArtTile motif="doc" tone={3} className="size-12 shrink-0 rounded-[12px]" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] text-bj-ink">{d.name}</span>
                  <span className="text-[12.5px] text-bj-muted">
                    {Dc.cats[d.cat]}
                    {d.date ? ` · ${date(d.date)}` : ""}
                  </span>
                  {(d.holder || d.notes) && <span className="mt-1 block truncate text-[12.5px] text-bj-ink-soft">{d.holder ? `${Dc.holder}: ${d.holder}` : d.notes}</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <EntitySheet
        open={!!edit}
        onClose={() => setEdit(null)}
        title={edit?.id ? (edit.name ?? Dc.add) : Dc.add}
        fields={fields}
        initial={(edit ?? {}) as Record<string, string | undefined>}
        onSave={(item) => dispatch({ t: "put", c: "docs", item: { ...item, id: edit?.id ?? newId("d") } })}
        onDelete={edit?.id ? () => dispatch({ t: "del", c: "docs", id: edit.id! }) : undefined}
      />
      <div className="flex items-start gap-3 rounded-[16px] border border-dashed border-bj-beige px-4 py-3.5 text-[13px] text-bj-muted">
        <UploadSimpleIcon size={18} className="mt-0.5 shrink-0" />
        <span>
          <span className="font-medium text-bj-ink-soft">{Dc.upload}: </span>
          {Dc.uploadSoon}
        </span>
      </div>
    </div>
  );
}
