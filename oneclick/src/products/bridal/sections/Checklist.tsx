"use client";

import { useMemo, useState } from "react";
import { CaretDownIcon, PlusIcon } from "@phosphor-icons/react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useBridal } from "../app/state";
import { groupTasks, weightedProgress, type Bucket } from "../model/engine";
import type { CategoryKey, Task } from "../model/types";
import { CatIcon } from "../ui/icons";
import { Bar, Button, Chips, ProgressRing, SectionHeader, Segmented, Toggle } from "../ui/kit";
import { NewTaskSheet, TaskList } from "../ui/tasks";

/** The master checklist: by time (today / this week / soon / later) or by category. */
export function Checklist({ cats, title, sub }: { cats?: CategoryKey[]; title?: string; sub?: string }) {
  const { t, tasks: all, today, num, pct } = useBridal();
  const [view, setView] = useState<"time" | "cat">("time");
  const [showDone, setShowDone] = useState(false);
  const [cat, setCat] = useState<CategoryKey | "all">("all");
  const [newTask, setNewTask] = useState(false);
  const tasks = useMemo(() => (cats ? all.filter((x) => cats.includes(x.cat)) : all), [all, cats]);
  const filtered = cat === "all" ? tasks : tasks.filter((x) => x.cat === cat);
  const done = tasks.filter((x) => x.status === "done").length;
  const live = tasks.filter((x) => x.status !== "skip").length;
  const presentCats = useMemo(() => [...new Set(tasks.map((x) => x.cat))], [tasks]);
  const groups = groupTasks(filtered, today);
  const order: Bucket[] = ["overdue", "today", "week", "soon", "later"];
  const finished = filtered.filter((x) => x.status === "done" || x.status === "skip");

  return (
    <div className="space-y-6">
      <SectionHeader
        title={title ?? t.checklist.title}
        sub={sub ?? t.checklist.sub}
        action={
          <Button onClick={() => setNewTask(true)}>
            <PlusIcon size={16} />
            {t.task.newTask}
          </Button>
        }
      />
      <div className="flex flex-wrap items-center gap-5 rounded-[20px] border border-bj-line bg-bj-paper px-5 py-4">
        <ProgressRing value={weightedProgress(tasks)} size={64} stroke={5}>
          <span className="text-[13px] font-medium tabular-nums">{pct(Math.round(weightedProgress(tasks) * 100))}</span>
        </ProgressRing>
        <div className="min-w-40 flex-1">
          <p className="text-[15px] text-bj-ink">{t.checklist.progress(num(done), num(live))}</p>
          <Bar value={done / Math.max(1, live)} className="mt-2" />
        </div>
        {!cats && (
          <Segmented
            label={t.checklist.title}
            value={view}
            onChange={setView}
            options={[
              { value: "time", label: t.checklist.viewFocus },
              { value: "cat", label: t.checklist.viewCategory },
            ]}
          />
        )}
      </div>

      {presentCats.length > 1 && (
        <Chips
          label={t.common.category}
          value={cat}
          onChange={setCat}
          options={[{ value: "all", label: t.common.all }, ...presentCats.map((c) => ({ value: c, label: t.cats[c], count: tasks.filter((x) => x.cat === c && x.status !== "done" && x.status !== "skip").length }))]}
        />
      )}

      {view === "time" || cats ? (
        <div className="space-y-7">
          {order.map((b) =>
            groups[b].length ? (
              <BucketBlock key={b} title={t.buckets[b]} tasks={groups[b]} tone={b} defaultOpen={b !== "later" || (groups.week.length + groups.today.length + groups.overdue.length < 4)} />
            ) : null
          )}
          {order.every((b) => !groups[b].length) && <p className="py-8 text-center text-bj-muted">{t.checklist.empty}</p>}
        </div>
      ) : (
        <div className="space-y-7">
          {presentCats
            .filter((c) => cat === "all" || c === cat)
            .map((c) => {
              const list = tasks.filter((x) => x.cat === c && x.status !== "done" && x.status !== "skip");
              const d = tasks.filter((x) => x.cat === c && x.status === "done").length;
              return list.length ? <BucketBlock key={c} title={t.cats[c]} icon={c} meta={`${num(d)} / ${num(tasks.filter((x) => x.cat === c && x.status !== "skip").length)}`} tasks={list} defaultOpen={false} /> : null;
            })}
        </div>
      )}

      <div className="border-t border-bj-line pt-4">
        <Toggle checked={showDone} onChange={setShowDone} label={`${t.checklist.showDone} (${num(finished.length)})`} />
        {showDone && <TaskList tasks={finished} />}
      </div>
      <NewTaskSheet open={newTask} onClose={() => setNewTask(false)} cat={cats?.[0]} />
    </div>
  );
}

function BucketBlock({ title, tasks, tone, defaultOpen, icon, meta }: { title: string; tasks: Task[]; tone?: Bucket; defaultOpen: boolean; icon?: CategoryKey; meta?: string }) {
  const { num } = useBridal();
  const [open, setOpen] = useState(defaultOpen);
  const reduce = useReducedMotion();
  return (
    <section>
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="mb-3 flex w-full items-center gap-2.5 text-start">
        {icon && (
          <span className="grid size-8 place-items-center rounded-full bg-bj-cream text-bj-gold-ink">
            <CatIcon cat={icon} size={16} />
          </span>
        )}
        {tone && <span className={`size-2 rounded-full ${tone === "overdue" ? "bg-bj-alert" : tone === "today" || tone === "week" ? "bg-bj-gold" : tone === "soon" ? "bg-bj-taupe" : "bg-bj-beige"}`} />}
        <h2 className="bj-serif text-[1.4rem] text-bj-ink">{title}</h2>
        <span className="text-[13px] text-bj-muted">{meta ?? num(tasks.length)}</span>
        <CaretDownIcon size={16} className={`ms-auto text-bj-muted transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={reduce ? false : { height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={reduce ? undefined : { height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
            <TaskList tasks={tasks} />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
