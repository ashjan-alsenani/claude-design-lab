"use client";

import { useEffect, useId, useRef, useState } from "react";
import { FileImageIcon, FilePdfIcon, TrashIcon, UploadSimpleIcon } from "@phosphor-icons/react";
import { useQ } from "../app/state";
import { parseMoney, toMajor } from "../model/engine";
import type { FileMeta } from "../model/types";
import { Button, Field, Sheet, TextArea, inputCls, useConfirm } from "./kit";

/**
 * One create/edit sheet for every list in the app. Fields are described as data. Money is typed in
 * major units and stored as exact integers of minor units; errors appear next to the field; the
 * draft survives a failed save (nothing typed is lost); the save button is disabled while saving so
 * a double tap can't add the record twice.
 */
export type FieldSpec = {
  key: string;
  label: string;
  kind: "text" | "number" | "date" | "time" | "select" | "textarea" | "check" | "file" | "tel" | "url" | "money" | "email";
  options?: { value: string; label: string }[];
  required?: boolean;
  hint?: string;
  half?: boolean;
  list?: string[];
  min?: number;
  max?: number;
  board?: FileMeta["board"];
  accept?: string;
  hidden?: (d: Draft) => boolean;
};
export type Draft = Record<string, unknown>;

export function EntitySheet({ open, onClose, title, fields, initial, onSave, onDelete, extra }: { open: boolean; onClose: () => void; title: string; fields: FieldSpec[]; initial: Draft; onSave: (item: Draft) => boolean; onDelete?: () => void; extra?: React.ReactNode }) {
  const { t, currency, access } = useQ();
  const [draft, setDraft] = useState<Draft>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const confirm = useConfirm();
  const uid = useId();
  useEffect(() => {
    if (!open) return;
    const d: Draft = { ...initial };
    for (const f of fields) if (f.kind === "money" && typeof d[f.key] === "number") d[f.key] = String(toMajor(d[f.key] as number, currency));
    setDraft(d);
    setErrors({});
    setFormError(null);
    setBusy(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  const set = (k: string, v: unknown) => {
    setDraft((d) => ({ ...d, [k]: v }));
    setErrors((e) => (e[k] ? { ...e, [k]: "" } : e));
  };

  const save = () => {
    if (busy) return;
    const out: Draft = {};
    const errs: Record<string, string> = {};
    for (const f of fields) {
      if (f.hidden?.(draft)) continue;
      let v = draft[f.key];
      if (typeof v === "string") v = v.trim();
      if (f.kind === "check") {
        out[f.key] = !!v;
        continue;
      }
      if (v === "" || v === undefined || v === null) {
        if (f.required) errs[f.key] = t.common.required;
        continue;
      }
      if (f.kind === "money") {
        const m = parseMoney(String(v), currency);
        if (m === undefined) errs[f.key] = t.common.invalidMoney;
        else out[f.key] = m;
        continue;
      }
      if (f.kind === "number") {
        const n = Number(String(v).replace(/[٠-٩]/g, (x) => String("٠١٢٣٤٥٦٧٨٩".indexOf(x))));
        if (!Number.isFinite(n) || (f.min !== undefined && n < f.min) || (f.max !== undefined && n > f.max)) errs[f.key] = t.common.saveError;
        else out[f.key] = n;
        continue;
      }
      out[f.key] = v;
    }
    for (const [k, v] of Object.entries(draft)) if (!fields.some((f) => f.key === k) && v !== undefined) out[k] = v;
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;
    setBusy(true);
    const ok = onSave(out);
    setBusy(false);
    if (ok) onClose();
    else setFormError(t.common.saveError);
  };

  const readOnly = !access.canEdit;
  return (
    <>
      <Sheet
        open={open}
        onClose={onClose}
        title={title}
        footer={
          readOnly ? undefined : (
            <>
              {onDelete && (
                <Button variant="danger" onClick={() => confirm.ask(t.common.confirmDelete, () => (onDelete(), onClose()))}>
                  <TrashIcon size={17} />
                  {t.common.delete}
                </Button>
              )}
              <span className="flex-1" />
              <Button variant="ghost" onClick={onClose}>
                {t.common.cancel}
              </Button>
              <Button onClick={save} disabled={busy}>
                {t.common.save}
              </Button>
            </>
          )
        }
      >
        <form
          className="grid grid-cols-2 gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <fieldset disabled={readOnly} className="contents">
            {fields.map((f) => {
              if (f.hidden?.(draft)) return null;
              const id = `${uid}-${f.key}`;
              const v = draft[f.key];
              const span = f.half ? "col-span-1" : "col-span-2";
              const err = errors[f.key] || undefined;
              if (f.kind === "check")
                return (
                  <label key={f.key} className={`${span} flex min-h-12 items-center gap-3 rounded-[14px] border border-[var(--qd-line)] bg-[var(--qd-paper)] px-3.5 py-3 text-[15px]`}>
                    <input type="checkbox" checked={!!v} onChange={(e) => set(f.key, e.target.checked)} className="size-5 accent-[var(--qd-primary)]" />
                    {f.label}
                  </label>
                );
              if (f.kind === "file")
                return (
                  <div key={f.key} className="col-span-2">
                    <FileInput label={f.label} value={typeof v === "string" ? v : undefined} onChange={(x) => set(f.key, x)} board={f.board} accept={f.accept} />
                  </div>
                );
              return (
                <div key={f.key} className={span}>
                  <Field label={f.label + (f.required ? "" : "")} hint={f.hint} htmlFor={id} error={err}>
                    {f.kind === "select" ? (
                      <select id={id} value={(v as string) ?? ""} onChange={(e) => set(f.key, e.target.value || undefined)} className={inputCls} aria-invalid={!!err}>
                        {!f.required && <option value="">—</option>}
                        {f.options!.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    ) : f.kind === "textarea" ? (
                      <TextArea id={id} value={(v as string) ?? ""} onChange={(e) => set(f.key, e.target.value)} maxLength={1000} aria-invalid={!!err} />
                    ) : (
                      <>
                        <input
                          id={id}
                          type={f.kind === "number" || f.kind === "money" ? "text" : f.kind}
                          inputMode={f.kind === "number" ? "numeric" : f.kind === "money" ? "decimal" : undefined}
                          dir={["tel", "url", "number", "date", "time", "money", "email"].includes(f.kind) ? "ltr" : undefined}
                          list={f.list ? `${id}-list` : undefined}
                          value={v === undefined || v === null ? "" : String(v)}
                          onChange={(e) => set(f.key, e.target.value)}
                          aria-invalid={!!err}
                          aria-required={f.required}
                          className={`${inputCls} ${["tel", "url", "number", "date", "time", "money", "email"].includes(f.kind) ? "text-start" : ""}`}
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
          </fieldset>
          {extra && <div className="col-span-2">{extra}</div>}
          {formError && (
            <p role="alert" className="col-span-2 rounded-[12px] bg-[var(--qd-alert-soft)] px-3.5 py-2.5 text-sm text-[var(--qd-alert)]">
              {formError}
            </p>
          )}
          <button type="submit" hidden />
        </form>
      </Sheet>
      {confirm.node(t.common.delete, t.common.cancel)}
    </>
  );
}

/** Private file (photo or PDF). Uploaded to the mother's private storage; shown only to her (and helpers she allows). */
export function FileInput({ label, value, onChange, board, accept = "image/jpeg,image/png,image/webp" }: { label: string; value?: string; onChange: (id: string | undefined) => void; board?: FileMeta["board"]; accept?: string }) {
  const { t, api, dispatch, plan } = useQ();
  const id = useId();
  const [state, setState] = useState<"idle" | "busy" | "error" | "big">("idle");
  const input = useRef<HTMLInputElement>(null);
  const meta = value ? plan.files.find((f) => f.id === value) : undefined;
  const onFile = async (file: File) => {
    setState("busy");
    const blob = file.type.startsWith("image/") ? await shrink(file) : file;
    if (!blob || blob.size > 3_000_000) return setState("big");
    const r = await api.upload(blob, file.name.slice(0, 100), board);
    if (!r.ok) return setState("error");
    dispatch({ t: "put", c: "files", item: r.meta });
    onChange(r.meta.id);
    setState("idle");
    if (input.current) input.current.value = "";
  };
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-[var(--qd-ink-soft)]">{label}</span>
      <div className="flex items-center gap-3">
        <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-[14px] border border-[var(--qd-line)] bg-[var(--qd-tint-2)]">
          {value && meta?.mime !== "application/pdf" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={api.fileUrl(value)} alt="" className="size-full object-cover" />
          ) : value ? (
            <FilePdfIcon size={28} className="text-[var(--qd-primary)]" />
          ) : (
            <FileImageIcon size={26} className="text-[var(--qd-muted)]" />
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor={id} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-[var(--qd-line)] bg-[var(--qd-paper)] px-4 text-[13.5px] font-medium hover:border-[var(--qd-primary)]">
            <UploadSimpleIcon size={16} />
            {state === "busy" ? t.common.uploading : value ? t.common.edit : t.common.addPhoto}
          </label>
          <input ref={input} id={id} type="file" accept={accept} className="sr-only" disabled={state === "busy"} onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
          {value && (
            <Button size="sm" variant="ghost" onClick={() => onChange(undefined)}>
              {t.common.removePhoto}
            </Button>
          )}
        </div>
      </div>
      {(state === "error" || state === "big") && (
        <p role="alert" className="text-xs font-medium text-[var(--qd-alert)]">
          {state === "big" ? t.common.fileTooBig : t.common.uploadFailed}
        </p>
      )}
    </div>
  );
}

/** Photos are resized in the browser (max 1600 px, JPEG) before upload: faster on mobile data, private by default. */
async function shrink(file: File): Promise<Blob | null> {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas");
    c.width = Math.round(bmp.width * scale);
    c.height = Math.round(bmp.height * scale);
    c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
    for (const q of [0.85, 0.75, 0.6, 0.45]) {
      const b = await new Promise<Blob | null>((res) => c.toBlob(res, "image/jpeg", q));
      if (b && b.size < 1_200_000) return b;
    }
    return null;
  } catch {
    return file.size <= 3_000_000 ? file : null;
  }
}
