"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { CalendarBlankIcon, ClockIcon, HourglassIcon, StarFourIcon } from "@phosphor-icons/react";
import { useBridal } from "../app/state";
import { addDays, diffDays } from "../model/engine";
import type { CategoryKey, Priority, Task, TaskStatus } from "../model/types";
import { CatIcon } from "./icons";
import { Badge, Button, CheckCircle, Field, Sheet, TextArea, inputCls, useConfirm, cx, type Tone } from "./kit";

export const priorityTone: Record<Priority, Tone> = { urgent: "alert", high: "gold", normal: "neutral", low: "neutral" };

/** One task. Calm by default; urgency shows only through a small badge and the date colour. */
export function TaskCard({ task, compact = false }: { task: Task; compact?: boolean }) {
  const { t, dispatch, rel, today, tasks } = useBridal();
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const done = task.status === "done";
  const overdue = !done && task.status !== "skip" && task.due < today;
  const blockers = task.blockedBy.map((id) => tasks.find((x) => x.id === id)?.title).filter(Boolean);
  const toggle = () => dispatch({ t: "task", id: task.id, patch: { status: done ? "todo" : "done" } });

  return (
    <motion.div layout={!reduce} className={cx("group flex items-start gap-1.5 rounded-[18px] border bg-[linear-gradient(180deg,#fffdfc,#fcf8f6)] shadow-[0_12px_30px_-26px_rgba(110,70,60,.35)] px-2.5 py-2.5 transition-colors", done ? "border-transparent bg-bj-paper/60" : "border-bj-line hover:border-bj-taupe/35")}>
      <CheckCircle checked={done} onClick={toggle} label={`${t.task.markDone}: ${task.title}`} />
      <button type="button" onClick={() => setOpen(true)} className="min-w-0 flex-1 py-1.5 text-start">
        <span className={cx("block text-[15px] leading-snug transition-colors", done ? "text-bj-muted line-through decoration-bj-beige" : "text-bj-ink")}>{task.title}</span>
        <span className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12.5px] text-bj-muted">
          {!compact && (
            <span className="inline-flex items-center gap-1">
              <CatIcon cat={task.cat} size={14} />
              {t.cats[task.cat]}
            </span>
          )}
          <span className={cx("inline-flex items-center gap-1", overdue && "font-medium text-bj-alert")}>
            <CalendarBlankIcon size={13} weight="regular" />
            {rel(task.due)}
          </span>
          {!done && (task.priority === "urgent" || task.priority === "high") && <Badge tone={priorityTone[task.priority]}>{t.priority[task.priority]}</Badge>}
          {!done && !compact && (
            <span className="inline-flex items-center gap-1">
              <ClockIcon size={13} weight="regular" />
              {t.effort[task.effort]}
            </span>
          )}
          {task.status === "doing" && <Badge tone="sage">{t.taskStatus.doing}</Badge>}
          {task.status === "waiting" && <Badge tone="amber">{t.taskStatus.waiting}</Badge>}
          {task.custom && !compact && <Badge tone="rose">{t.common.custom}</Badge>}
          {task.milestone && !done && <StarFourIcon size={13} weight="fill" className="text-bj-gold" aria-label={t.task.milestone} />}
        </span>
        {!done && blockers.length > 0 && (
          <span className="mt-1 flex items-center gap-1 text-[12px] text-bj-amber">
            <HourglassIcon size={13} weight="regular" />
            {t.task.waitingOn} {blockers.join("، ")}
          </span>
        )}
      </button>
      <TaskSheet task={task} open={open} onClose={() => setOpen(false)} />
    </motion.div>
  );
}

export function TaskList({ tasks, compact, empty }: { tasks: Task[]; compact?: boolean; empty?: string }) {
  const reduce = useReducedMotion();
  if (!tasks.length) return empty ? <p className="px-1 py-3 text-sm text-bj-muted">{empty}</p> : null;
  return (
    <ul className="flex flex-col gap-2">
      <AnimatePresence initial={false}>
        {tasks.map((task, i) => (
          <motion.li key={task.id} initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? undefined : { opacity: 0, height: 0 }} transition={{ duration: 0.35, delay: Math.min(i, 8) * 0.03 }}>
            <TaskCard task={task} compact={compact} />
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}

/** Task details: status, date (reschedule), priority, notes. Custom tasks are fully editable. */
export function TaskSheet({ task, open, onClose }: { task: Task; open: boolean; onClose: () => void }) {
  const { t, dispatch, date, today, ws, num } = useBridal();
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [due, setDue] = useState(task.due);
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [notes, setNotes] = useState(task.notes ?? "");
  const [title, setTitle] = useState(task.title);
  const [cat, setCat] = useState<CategoryKey>(task.cat);
  const confirm = useConfirm();
  const custom = ws.customTasks.find((c) => c.id === task.id);

  const save = () => {
    if (custom) dispatch({ t: "put", c: "customTasks", item: { ...custom, title: title.trim() || custom.title, cat, due, priority, status, notes: notes || undefined } });
    else dispatch({ t: "task", id: task.id, patch: { status, due: due === task.due ? undefined : due, priority: priority === task.priority ? undefined : priority, notes } });
    onClose();
  };
  const quick = (days: number) => setDue(addDays(due < today ? today : due, days));

  return (
    <>
      <Sheet
        open={open}
        onClose={onClose}
        title={custom ? t.common.edit : task.title}
        footer={
          <>
            {custom && (
              <Button variant="danger" onClick={() => confirm.ask(t.common.confirmDelete, () => (dispatch({ t: "del", c: "customTasks", id: task.id }), onClose()))}>
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
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2 text-[13px] text-bj-muted">
            <Badge tone={custom ? "rose" : "gold"}>{custom ? t.common.custom : t.common.system}</Badge>
            <span className="inline-flex items-center gap-1">
              <CatIcon cat={task.cat} size={14} />
              {t.cats[task.cat]}
            </span>
            <span>· {t.effort[task.effort]}</span>
          </div>
          {custom && (
            <>
              <Field label={t.task.title} htmlFor="ts-title">
                <input id="ts-title" value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} maxLength={120} />
              </Field>
              <Field label={t.common.category} htmlFor="ts-cat">
                <select id="ts-cat" value={cat} onChange={(e) => setCat(e.target.value as CategoryKey)} className={inputCls}>
                  {(Object.keys(t.cats) as CategoryKey[]).map((k) => (
                    <option key={k} value={k}>
                      {t.cats[k]}
                    </option>
                  ))}
                </select>
              </Field>
            </>
          )}
          <Field label={t.common.status} htmlFor="ts-status">
            <select id="ts-status" value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)} className={inputCls}>
              {(Object.keys(t.taskStatus) as TaskStatus[]).map((k) => (
                <option key={k} value={k}>
                  {t.taskStatus[k]}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t.task.reschedule} htmlFor="ts-due" hint={`${date(due, "weekday")} · ${t.task.countdownHint(num(Math.max(0, diffDays(due, ws.profile!.weddingDate))))}`}>
            <input id="ts-due" type="date" dir="ltr" value={due} onChange={(e) => e.target.value && setDue(e.target.value)} className={`${inputCls} text-start`} />
          </Field>
          <div className="-mt-2 flex flex-wrap gap-2">
            {[1, 3, 7, 14].map((d) => (
              <Button key={d} size="sm" variant="soft" onClick={() => quick(d)}>
                +{d}
              </Button>
            ))}
          </div>
          <Field label={t.task.priorityLabel} htmlFor="ts-pri">
            <select id="ts-pri" value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className={inputCls}>
              {(Object.keys(t.priority) as Priority[]).map((k) => (
                <option key={k} value={k}>
                  {t.priority[k]}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t.common.notes} htmlFor="ts-notes">
            <TextArea id="ts-notes" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={1000} />
          </Field>
          {!custom && task.status !== "skip" && (
            <Button variant="ghost" size="sm" onClick={() => (dispatch({ t: "task", id: task.id, patch: { status: "skip" } }), onClose())}>
              {t.task.notNeeded}
            </Button>
          )}
        </div>
      </Sheet>
      {confirm.node(t.common.delete, t.common.cancel)}
    </>
  );
}

/** "+ New task" sheet. */
export function NewTaskSheet({ open, onClose, cat }: { open: boolean; onClose: () => void; cat?: CategoryKey }) {
  const { t, dispatch, today, newId } = useBridal();
  const [title, setTitle] = useState("");
  const [c, setC] = useState<CategoryKey>(cat ?? "planning");
  const [due, setDue] = useState(addDays(today, 7));
  const [priority, setPriority] = useState<Priority>("normal");
  const [notes, setNotes] = useState("");
  const [err, setErr] = useState(false);
  const save = () => {
    if (!title.trim()) return setErr(true);
    dispatch({ t: "put", c: "customTasks", item: { id: newId("c"), title: title.trim(), cat: c, due, priority, status: "todo", notes: notes || undefined } });
    setTitle("");
    setNotes("");
    onClose();
  };
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={t.task.newTask}
      footer={
        <>
          <span className="flex-1" />
          <Button variant="ghost" onClick={onClose}>
            {t.common.cancel}
          </Button>
          <Button onClick={save}>{t.common.save}</Button>
        </>
      }
    >
      <div className="space-y-5">
        <Field label={t.task.title} htmlFor="nt-title" error={err ? t.task.titleRequired : undefined}>
          <input id="nt-title" value={title} onChange={(e) => (setTitle(e.target.value), setErr(false))} className={inputCls} maxLength={120} autoFocus />
        </Field>
        <Field label={t.common.category} htmlFor="nt-cat">
          <select id="nt-cat" value={c} onChange={(e) => setC(e.target.value as CategoryKey)} className={inputCls}>
            {(Object.keys(t.cats) as CategoryKey[]).map((k) => (
              <option key={k} value={k}>
                {t.cats[k]}
              </option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label={t.task.due} htmlFor="nt-due">
            <input id="nt-due" type="date" dir="ltr" value={due} onChange={(e) => e.target.value && setDue(e.target.value)} className={`${inputCls} text-start`} />
          </Field>
          <Field label={t.task.priorityLabel} htmlFor="nt-pri">
            <select id="nt-pri" value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className={inputCls}>
              {(Object.keys(t.priority) as Priority[]).map((k) => (
                <option key={k} value={k}>
                  {t.priority[k]}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label={t.common.notes} htmlFor="nt-notes">
          <TextArea id="nt-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>
      </div>
    </Sheet>
  );
}
