"use client";

import { useMemo, useState } from "react";
import { ArmchairIcon, MagnifyingGlassIcon, PlusIcon, UsersThreeIcon } from "@phosphor-icons/react";
import { useBridal } from "../app/state";
import type { Guest, Rsvp, SeatTable } from "../model/types";
import { EntitySheet, type FieldSpec } from "../ui/EntitySheet";
import { Badge, Bar, Button, Card, Chips, EmptyState, SectionHeader, Segmented, cx, inputCls, type Tone } from "../ui/kit";

const rsvpTone: Record<Rsvp, Tone> = { invited: "neutral", sent: "gold", confirmed: "sage", declined: "rose", pending: "amber" };
const size = (g: Guest) => g.adults + g.children;

export function Guests() {
  const { t, ws, dispatch, newId, num } = useBridal();
  const G = t.guests;
  const [tab, setTab] = useState<"list" | "seating">("list");
  const [q, setQ] = useState("");
  const [rsvp, setRsvp] = useState<Rsvp | "all">("all");
  const [side, setSide] = useState<Guest["side"] | "all">("all");
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [edit, setEdit] = useState<Partial<Guest> | null>(null);
  const [table, setTable] = useState<Partial<SeatTable> | null>(null);

  const people = ws.guests.reduce((s, g) => s + size(g), 0);
  const count = (r: Rsvp[]) => ws.guests.filter((g) => r.includes(g.rsvp)).reduce((s, g) => s + size(g), 0);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return ws.guests.filter((g) => (rsvp === "all" || g.rsvp === rsvp) && (side === "all" || g.side === side) && (!s || [g.name, g.family, g.phone].some((x) => x?.toLowerCase().includes(s))));
  }, [ws.guests, q, rsvp, side]);

  const fields: FieldSpec[] = [
    { key: "name", label: t.common.name, kind: "text", required: true },
    { key: "family", label: G.fields.family, kind: "text", half: true, list: [...new Set(ws.guests.map((g) => g.family).filter(Boolean) as string[])] },
    { key: "side", label: G.fields.side, kind: "select", required: true, half: true, options: (Object.keys(G.sides) as Guest["side"][]).map((s) => ({ value: s, label: G.sides[s] })) },
    { key: "phone", label: G.fields.phone, kind: "tel" },
    { key: "adults", label: G.fields.adults, kind: "number", required: true, half: true },
    { key: "children", label: G.fields.children, kind: "number", required: true, half: true },
    { key: "rsvp", label: t.common.status, kind: "select", required: true, half: true, options: (Object.keys(G.rsvp) as Rsvp[]).map((s) => ({ value: s, label: G.rsvp[s] })) },
    { key: "tableId", label: G.fields.table, kind: "select", half: true, options: ws.tables.map((x) => ({ value: x.id, label: `${num(x.number)} · ${x.name}` })) },
    { key: "notes", label: t.common.notes, kind: "textarea" },
  ];
  const bulk = (patch: { rsvp?: Rsvp; tableId?: string | null }) => {
    dispatch({ t: "guests", ids: [...sel], patch });
    setSel(new Set());
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title={G.title}
        sub={G.sub}
        action={
          <div className="flex gap-2">
            {tab === "seating" && (
              <Button variant="secondary" onClick={() => setTable({ number: ws.tables.length + 1, capacity: 10, name: "" })}>
                <PlusIcon size={15} />
                {G.addTable}
              </Button>
            )}
            <Button onClick={() => setEdit({ side: "bride", adults: 2, children: 0, rsvp: "invited" })}>
              <PlusIcon size={15} />
              {G.add}
            </Button>
          </div>
        }
      />
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          [G.stats.people, num(people), `${num(ws.guests.length)} ${G.stats.households}`],
          [G.stats.confirmed, num(count(["confirmed"])), ""],
          [G.stats.pending, num(count(["invited", "sent", "pending"])), ""],
          [G.stats.declined, num(count(["declined"])), ""],
        ].map(([k, v, s]) => (
          <Card key={k} className="p-4">
            <dt className="text-[12.5px] text-bj-muted">{k}</dt>
            <dd className="bj-serif mt-1 text-[1.8rem] leading-none tabular-nums text-bj-ink">{v}</dd>
            {s && <dd className="mt-1 text-[12px] text-bj-muted">{s}</dd>}
          </Card>
        ))}
      </dl>
      {ws.profile && people > 0 && <Bar value={count(["confirmed", "declined"]) / Math.max(1, people)} tone="sage" />}

      <Segmented label={G.title} value={tab} onChange={setTab} options={[{ value: "list", label: G.list }, { value: "seating", label: G.seating }]} />

      {tab === "list" &&
        (ws.guests.length === 0 ? (
          <EmptyState icon={<UsersThreeIcon size={24} weight="regular" />} title={G.empty} sub={G.emptySub} action={<Button onClick={() => setEdit({ side: "bride", adults: 2, children: 0, rsvp: "invited" })}>{G.add}</Button>} />
        ) : (
          <>
            <div className="relative max-w-md">
              <MagnifyingGlassIcon size={17} className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-bj-muted" />
              <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.common.search} aria-label={t.common.search} className={`${inputCls} ps-10`} />
            </div>
            <Chips label={t.common.status} value={rsvp} onChange={setRsvp} options={[{ value: "all", label: t.common.all }, ...(Object.keys(G.rsvp) as Rsvp[]).map((r) => ({ value: r, label: G.rsvp[r], count: ws.guests.filter((g) => g.rsvp === r).length }))]} />
            <Chips label={G.fields.side} value={side} onChange={setSide} options={[{ value: "all", label: t.common.all }, ...(Object.keys(G.sides) as Guest["side"][]).map((r) => ({ value: r, label: G.sides[r] }))]} />

            {sel.size > 0 && (
              <div className="sticky top-[72px] z-20 flex flex-wrap items-center gap-2 rounded-[16px] border border-bj-line bg-bj-paper/95 px-4 py-2.5 shadow-sm backdrop-blur">
                <span className="me-auto text-[13.5px] text-bj-ink">{G.selected(num(sel.size))}</span>
                <Button size="sm" variant="soft" onClick={() => bulk({ rsvp: "sent" })}>
                  {G.bulkSent}
                </Button>
                <Button size="sm" variant="soft" onClick={() => bulk({ rsvp: "confirmed" })}>
                  {G.bulkConfirmed}
                </Button>
                {ws.tables.length > 0 && (
                  <select aria-label={G.assign} className="h-9 rounded-full border border-bj-line bg-bj-paper px-3 text-[13px]" value="" onChange={(e) => e.target.value && bulk({ tableId: e.target.value })}>
                    <option value="">{G.assign}</option>
                    {ws.tables.map((x) => (
                      <option key={x.id} value={x.id}>
                        {num(x.number)} · {x.name}
                      </option>
                    ))}
                  </select>
                )}
                <Button size="sm" variant="ghost" onClick={() => setSel(new Set())}>
                  {G.clear}
                </Button>
              </div>
            )}

            <div className="overflow-hidden rounded-[20px] border border-bj-line bg-bj-paper">
              <div className="flex items-center gap-3 border-b border-bj-line px-4 py-2.5 text-[12.5px] text-bj-muted">
                <input type="checkbox" aria-label={G.selectAll} checked={list.length > 0 && list.every((g) => sel.has(g.id))} onChange={(e) => setSel(e.target.checked ? new Set(list.map((g) => g.id)) : new Set())} className="size-4 accent-[#c9a49a]" />
                {G.selectAll} · {num(list.length)}
              </div>
              <ul className="divide-y divide-bj-line">
                {list.map((g) => {
                  const tb = ws.tables.find((x) => x.id === g.tableId);
                  return (
                    <li key={g.id} className={cx("flex items-center gap-3 px-4 py-3", sel.has(g.id) && "bg-bj-cream/50")}>
                      <input type="checkbox" aria-label={g.name} checked={sel.has(g.id)} onChange={() => setSel((s) => (s.has(g.id) ? (s.delete(g.id), new Set(s)) : new Set(s.add(g.id))))} className="size-4 shrink-0 accent-[#c9a49a]" />
                      <button type="button" onClick={() => setEdit(g)} className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1 text-start">
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[15px] text-bj-ink">{g.name}</span>
                          <span className="text-[12.5px] text-bj-muted">
                            {g.family ? `${g.family} · ` : ""}
                            {G.sides[g.side]} · {num(size(g))}
                            {tb ? ` · ${G.fields.table} ${num(tb.number)}` : ""}
                          </span>
                        </span>
                        <Badge tone={rsvpTone[g.rsvp]}>{G.rsvp[g.rsvp]}</Badge>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </>
        ))}

      {tab === "seating" && (
        <>
          <p className="text-[13.5px] text-bj-muted">{G.seatingHint}</p>
          {ws.tables.length === 0 ? (
            <EmptyState icon={<ArmchairIcon size={24} weight="regular" />} title={G.emptyTables} action={<Button onClick={() => setTable({ number: 1, capacity: 10, name: "" })}>{G.addTable}</Button>} />
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {ws.tables
                .slice()
                .sort((a, b) => a.number - b.number)
                .map((tb) => {
                  const seated = ws.guests.filter((g) => g.tableId === tb.id);
                  const used = seated.reduce((s, g) => s + size(g), 0);
                  const left = tb.capacity - used;
                  return (
                    <li key={tb.id}>
                      <Card className="flex h-full flex-col p-4">
                        <button type="button" onClick={() => setTable(tb)} className="flex items-center gap-3 text-start">
                          <span className="bj-serif grid size-12 shrink-0 place-items-center rounded-full border border-[#e3cfc6] bg-[#f9f1ed] text-[1.3rem] text-bj-gold-ink">{num(tb.number)}</span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[15px] text-bj-ink">{tb.name || `${G.fields.table} ${num(tb.number)}`}</span>
                            <span className={cx("text-[12.5px]", left < 0 ? "text-bj-alert" : "text-bj-muted")}>{left <= 0 ? G.full : G.seatsLeft(num(left))}</span>
                          </span>
                        </button>
                        <Bar value={used / tb.capacity} tone={left < 0 ? "alert" : "gold"} className="mt-3" />
                        <ul className="mt-3 flex flex-wrap gap-1.5">
                          {seated.map((g) => (
                            <li key={g.id}>
                              <button type="button" onClick={() => setEdit(g)} className="rounded-full bg-bj-cream px-2.5 py-1 text-[12px] text-bj-ink-soft">
                                {g.name} · {num(size(g))}
                              </button>
                            </li>
                          ))}
                        </ul>
                        <select aria-label={G.assign} value="" onChange={(e) => e.target.value && dispatch({ t: "guests", ids: [e.target.value], patch: { tableId: tb.id } })} className="mt-auto h-9 translate-y-1 rounded-full border border-bj-line bg-bj-paper px-3 pt-0 text-[13px] text-bj-ink-soft">
                          <option value="">+ {G.assign}</option>
                          {ws.guests
                            .filter((g) => !g.tableId && g.rsvp !== "declined")
                            .map((g) => (
                              <option key={g.id} value={g.id}>
                                {g.name} ({num(size(g))})
                              </option>
                            ))}
                        </select>
                      </Card>
                    </li>
                  );
                })}
            </ul>
          )}
          <p className="text-[13px] text-bj-muted">
            {G.unassigned}: {num(ws.guests.filter((g) => !g.tableId && g.rsvp !== "declined").reduce((s, g) => s + size(g), 0))}
          </p>
        </>
      )}

      <EntitySheet
        open={!!edit}
        onClose={() => setEdit(null)}
        title={edit?.id ? (edit.name ?? G.add) : G.add}
        fields={fields}
        initial={(edit ?? {}) as Record<string, string | number | undefined>}
        onSave={(item) => dispatch({ t: "put", c: "guests", item: { ...item, id: edit?.id ?? newId("g") } })}
        onDelete={edit?.id ? () => dispatch({ t: "del", c: "guests", id: edit.id! }) : undefined}
      />
      <EntitySheet
        open={!!table}
        onClose={() => setTable(null)}
        title={table?.id ? G.tableName : G.addTable}
        fields={[
          { key: "name", label: G.tableName, kind: "text" },
          { key: "number", label: G.tableNumber, kind: "number", required: true, half: true },
          { key: "capacity", label: G.capacity, kind: "number", required: true, half: true },
        ]}
        initial={(table ?? {}) as Record<string, string | number | undefined>}
        onSave={(item) => dispatch({ t: "put", c: "tables", item: { name: "", ...item, id: table?.id ?? newId("t") } })}
        onDelete={table?.id ? () => dispatch({ t: "del", c: "tables", id: table.id! }) : undefined}
      />
    </div>
  );
}
