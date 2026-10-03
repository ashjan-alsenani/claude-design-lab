"use client";

import { useEffect, useId, useState } from "react";
import { ImageSquareIcon, TrashIcon } from "@phosphor-icons/react";
import { useBridal } from "../app/state";
import { Button, Field, Sheet, TextArea, inputCls, useConfirm } from "./kit";

/**
 * One reusable create/edit sheet for every list in the app (vendors, guests, expenses,
 * appointments, items, documents…). Fields are described as data.
 */
export type FieldSpec = {
  key: string;
  label: string;
  kind: "text" | "number" | "date" | "time" | "select" | "textarea" | "check" | "image" | "tel" | "url";
  options?: { value: string; label: string }[];
  required?: boolean;
  hint?: string;
  half?: boolean;
  list?: string[]; // suggestions
};

type Draft = Record<string, string | number | boolean | undefined>;

export function EntitySheet({
  open,
  onClose,
  title,
  fields,
  initial,
  onSave,
  onDelete,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  fields: FieldSpec[];
  initial: Draft;
  onSave: (item: Draft) => boolean;
  onDelete?: () => void;
}) {
  const { t } = useBridal();
  const [draft, setDraft] = useState<Draft>(initial);
  const [error, setError] = useState<string | null>(null);
  const confirm = useConfirm();
  const uid = useId();
  useEffect(() => {
    if (open) {
      setDraft(initial);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const set = (k: string, v: Draft[string]) => setDraft((d) => ({ ...d, [k]: v }));

  const save = () => {
    const out: Draft = {};
    for (const f of fields) {
      const v = draft[f.key];
      if (f.required && (v === undefined || v === "")) {
        setError(`${f.label}?`);
        return;
      }
      if (v === "" || v === undefined) continue;
      out[f.key] = f.kind === "number" ? Number(v) : typeof v === "string" ? v.trim() : v;
    }
    for (const [k, v] of Object.entries(draft)) if (!fields.some((f) => f.key === k) && v !== undefined) out[k] = v;
    if (onSave(out)) onClose();
    else setError(t.common.saveError);
  };

  return (
    <>
      <Sheet
        open={open}
        onClose={onClose}
        title={title}
        footer={
          <>
            {onDelete && (
              <Button variant="danger" size="md" onClick={() => confirm.ask(t.common.confirmDelete, () => (onDelete(), onClose()))}>
                <TrashIcon size={17} weight="regular" />
                {t.common.delete}
              </Button>
            )}
            <span className="flex-1" />
            <Button variant="ghost" onClick={onClose}>
              {t.common.cancel}
            </Button>
            <Button onClick={save}>{t.common.save}</Button>
          </>
        }
      >
        <form
          className="grid grid-cols-2 gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          {fields.map((f) => {
            const id = `${uid}-${f.key}`;
            const v = draft[f.key];
            const span = f.half ? "col-span-1" : "col-span-2";
            if (f.kind === "check")
              return (
                <label key={f.key} className={`${span} flex items-center gap-3 rounded-[14px] border border-bj-line px-3.5 py-3 text-[15px]`}>
                  <input type="checkbox" checked={!!v} onChange={(e) => set(f.key, e.target.checked)} className="size-5 accent-[#1f9e57]" />
                  {f.label}
                </label>
              );
            if (f.kind === "image")
              return (
                <div key={f.key} className="col-span-2">
                  <ImageInput label={f.label} value={typeof v === "string" ? v : undefined} onChange={(x) => set(f.key, x)} />
                </div>
              );
            return (
              <div key={f.key} className={span}>
                <Field label={f.label} hint={f.hint} htmlFor={id}>
                  {f.kind === "select" ? (
                    <select id={id} value={(v as string) ?? ""} onChange={(e) => set(f.key, e.target.value || undefined)} className={inputCls}>
                      {!f.required && <option value="">—</option>}
                      {f.options!.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  ) : f.kind === "textarea" ? (
                    <TextArea id={id} value={(v as string) ?? ""} onChange={(e) => set(f.key, e.target.value)} maxLength={1000} />
                  ) : (
                    <>
                      <input
                        id={id}
                        type={f.kind === "number" ? "number" : f.kind === "tel" ? "tel" : f.kind === "url" ? "url" : f.kind}
                        inputMode={f.kind === "number" ? "decimal" : undefined}
                        min={f.kind === "number" ? 0 : undefined}
                        step={f.kind === "number" ? "any" : undefined}
                        dir={["tel", "url", "number", "date", "time"].includes(f.kind) ? "ltr" : undefined}
                        list={f.list ? `${id}-list` : undefined}
                        value={v === undefined ? "" : String(v)}
                        onChange={(e) => set(f.key, e.target.value)}
                        required={f.required}
                        className={`${inputCls} ${["tel", "url", "number", "date", "time"].includes(f.kind) ? "text-start" : ""}`}
                      />
                      {f.list && (
                        <datalist id={`${id}-list`}>
                          {f.list.map((x) => (
                            <option key={x} value={x} />
                          ))}
                        </datalist>
                      )}
                    </>
                  )}
                </Field>
              </div>
            );
          })}
          {error && (
            <p role="alert" className="col-span-2 rounded-[12px] bg-bj-alert-soft px-3.5 py-2.5 text-sm text-bj-alert">
              {error}
            </p>
          )}
          <button type="submit" hidden />
        </form>
      </Sheet>
      {confirm.node(t.common.delete, t.common.cancel)}
    </>
  );
}

/** Photo from the device (resized in the browser, never uploaded elsewhere) or an https link. */
export function ImageInput({ label, value, onChange }: { label: string; value?: string; onChange: (v: string | undefined) => void }) {
  const { t } = useBridal();
  const id = useId();
  const onFile = async (file: File) => {
    const url = await resize(file, 520);
    if (url) onChange(url);
  };
  return (
    <div className="flex items-center gap-3">
      <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-[14px] border border-bj-line bg-bj-cream">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="size-full object-cover" />
        ) : (
          <ImageSquareIcon size={26} weight="regular" className="text-bj-taupe" />
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <label htmlFor={id} className="inline-flex h-9 cursor-pointer items-center rounded-full border border-bj-line bg-bj-paper px-4 text-[13px] hover:border-bj-taupe/50">
          {value ? label : t.common.addPhoto}
        </label>
        <input id={id} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
        {value && (
          <Button size="sm" variant="ghost" onClick={() => onChange(undefined)}>
            {t.common.removePhoto}
          </Button>
        )}
      </div>
    </div>
  );
}

async function resize(file: File, max: number): Promise<string | null> {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas");
    c.width = Math.round(bmp.width * scale);
    c.height = Math.round(bmp.height * scale);
    c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
    for (const q of [0.78, 0.65, 0.5, 0.38]) {
      const url = c.toDataURL("image/jpeg", q);
      if (url.length < 88_000) return url;
    }
    return null;
  } catch {
    return null;
  }
}
