"use client";

import { useState } from "react";
import { ArrowsClockwiseIcon, CopyIcon, EyeIcon, LinkBreakIcon, LinkIcon, ShieldCheckIcon, UserPlusIcon } from "@phosphor-icons/react";
import { useQ } from "../app/state";
import type { HelperInfo, LinkInfo, ShareKind } from "../app/api-types";
import { allSections, type SectionId } from "../model/types";
import { Badge, Button, Card, ChoiceCard, Field, PageHeader, SectionTitle, Toggle, inputCls } from "../ui/kit";
import { sectionLabel } from "./Setup";

export function SharePage() {
  const { t, pub, mode } = useQ();
  return (
    <div className="space-y-7">
      <PageHeader title={t.shareT.title} sub={t.shareT.sub} icon={<ShieldCheckIcon size={22} />} />
      {mode === "demo" && <p className="rounded-[14px] bg-[var(--qd-amber-soft)] px-4 py-3 text-[13.5px] text-[var(--qd-amber)]">{t.shareT.demoNote}</p>}
      <p className="rounded-[14px] bg-[var(--qd-tint-2)] px-4 py-3 text-[13.5px] leading-relaxed text-[var(--qd-ink-soft)]">{t.shareT.hidden}</p>
      <section className="space-y-3">
        <SectionTitle title={t.shareT.links} />
        <div className="grid gap-3 lg:grid-cols-2">
          <LinkCard kind="gifts" info={pub?.links.find((l) => l.kind === "gifts")} />
          <LinkCard kind="visits" info={pub?.links.find((l) => l.kind === "visits")} />
        </div>
      </section>
      <Helpers helpers={pub?.helpers ?? []} />
    </div>
  );
}

function LinkCard({ kind, info }: { kind: ShareKind; info?: LinkInfo }) {
  const { t, api, refreshPub, say, num, pub, date } = useQ();
  const [expires, setExpires] = useState(info?.expiresAt?.slice(0, 10) ?? "");
  const [busy, setBusy] = useState(false);
  const run = async (action: "create" | "disable" | "regenerate") => {
    setBusy(true);
    const r = await api.link(kind, action, { expiresAt: expires || undefined });
    setBusy(false);
    if (!r.ok) return say(r.reason === "demo" ? t.common.demoBlocked : t.common.saveError);
    await refreshPub();
  };
  const active = !!info?.active && !!info.url;
  return (
    <Card className="space-y-3 p-4">
      <div className="flex items-center gap-2">
        <LinkIcon size={20} className="text-[var(--qd-primary)]" />
        <h3 className="flex-1 font-semibold">{kind === "gifts" ? t.shareT.gifts : t.shareT.visits}</h3>
        <Badge tone={active ? "sage" : "neutral"}>{active ? t.shareT.active : t.shareT.off}</Badge>
      </div>
      {active && <p dir="ltr" className="break-all rounded-[12px] bg-[var(--qd-tint-2)] px-3 py-2 text-start text-[13px]">{info!.url}</p>}
      {info?.expiresAt && active && <p className="text-[12.5px] text-[var(--qd-muted)]">{t.shareT.expires}: {date(info.expiresAt.slice(0, 10), "long")}</p>}
      <Field label={t.shareT.expires} htmlFor={`exp-${kind}`}>
        <input id={`exp-${kind}`} type="date" dir="ltr" className={`${inputCls} text-start`} value={expires} onChange={(e) => setExpires(e.target.value)} />
      </Field>
      {kind === "gifts" && (
        <Field label={t.shareT.reserveHold} htmlFor="res-days">
          <input id="res-days" type="number" min={1} max={30} dir="ltr" className={`${inputCls} text-start`} defaultValue={pub?.reserveDays ?? 7} onBlur={async (e) => { const n = Math.round(Number(e.target.value)); if (n >= 1 && n <= 30 && n !== pub?.reserveDays) { const r = await api.setReserveDays(n); if (r.ok) { await refreshPub(); say(`${t.common.save} ✓ ${num(n)}`); } else say(r.reason === "demo" ? t.common.demoBlocked : t.common.saveError); } }} />
        </Field>
      )}
      <div className="flex flex-wrap gap-2">
        {!active ? (
          <Button disabled={busy} onClick={() => run("create")}><LinkIcon size={17} /> {t.shareT.create}</Button>
        ) : (
          <>
            <Button variant="secondary" onClick={async () => { try { await navigator.clipboard.writeText(info!.url!); say(t.common.copied); } catch {} }}><CopyIcon size={17} /> {t.common.copy}</Button>
            <a href={`${info!.url}?preview=1`} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center gap-2 rounded-full border-2 border-[var(--qd-line)] bg-[var(--qd-paper)] px-5 text-sm font-semibold"><EyeIcon size={17} /> {t.shareT.preview}</a>
            <Button variant="ghost" disabled={busy} onClick={() => run("regenerate")}><ArrowsClockwiseIcon size={17} /> {t.shareT.regenerate}</Button>
            <Button variant="danger" disabled={busy} onClick={() => run("disable")}><LinkBreakIcon size={17} /> {t.shareT.disable}</Button>
          </>
        )}
      </div>
    </Card>
  );
}

function Helpers({ helpers }: { helpers: HelperInfo[] }) {
  const { t, api, refreshPub, say, date } = useQ();
  const [email, setEmail] = useState("");
  const [sections, setSections] = useState<SectionId[]>(["prep", "bag", "visits", "calendar"]);
  const [canEdit, setCanEdit] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [fresh, setFresh] = useState<HelperInfo | null>(null);
  const invite = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return setErr(t.common.required);
    setBusy(true);
    const r = await api.inviteHelper(email.trim(), sections, canEdit);
    setBusy(false);
    if (!r.ok) return setErr(r.reason === "demo" ? t.common.demoBlocked : t.common.saveError);
    setErr(null);
    setEmail("");
    setFresh(r.helper);
    await refreshPub();
  };
  const update = async (h: HelperInfo, patch: { sections?: SectionId[]; canEdit?: boolean; revoke?: true }) => {
    const r = await api.updateHelper(h.id, patch);
    if (!r.ok) return say(r.reason === "demo" ? t.common.demoBlocked : t.common.saveError);
    await refreshPub();
  };
  const choosable = allSections.filter((s) => s !== "budget" && s !== "received");
  return (
    <section className="space-y-3">
      <SectionTitle title={t.shareT.helpers} sub={t.shareT.helpersSub} />
      <Card className="space-y-4 p-4">
        <Field label={t.shareT.email} htmlFor="h-email" error={err ?? undefined}>
          <input id="h-email" type="email" dir="ltr" autoComplete="off" className={`${inputCls} text-start`} value={email} onChange={(e) => (setEmail(e.target.value), setErr(null))} aria-invalid={!!err} />
        </Field>
        <div>
          <p className="mb-2 text-[13px] font-medium text-[var(--qd-ink-soft)]">{t.shareT.sections}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {[...choosable, "budget" as const, "received" as const].map((s) => (
              <ChoiceCard key={s} multi selected={sections.includes(s)} onClick={() => setSections(sections.includes(s) ? sections.filter((x) => x !== s) : [...sections, s])}>{sectionLabel(t, s)}</ChoiceCard>
            ))}
          </div>
        </div>
        <Toggle checked={canEdit} onChange={setCanEdit} label={canEdit ? t.shareT.canEdit : t.shareT.viewOnly} />
        <Button disabled={busy} onClick={invite}><UserPlusIcon size={18} /> {t.shareT.invite}</Button>
        {fresh?.inviteUrl && (
          <div className="space-y-2 rounded-[14px] bg-[var(--qd-tint-2)] p-3">
            <p className="text-[13px] font-semibold">{t.shareT.inviteLink}</p>
            <p dir="ltr" className="break-all text-start text-[12.5px]">{fresh.inviteUrl}</p>
            <Button size="sm" variant="secondary" onClick={async () => { try { await navigator.clipboard.writeText(fresh.inviteUrl!); say(t.common.copied); } catch {} }}><CopyIcon size={15} /> {t.common.copy}</Button>
            <p className="text-[12px] text-[var(--qd-muted)]">{t.shareT.inviteNote}</p>
          </div>
        )}
      </Card>
      {helpers.filter((h) => h.status !== "revoked").map((h) => (
        <Card key={h.id} className="space-y-3 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span dir="ltr" className="min-w-0 flex-1 truncate font-semibold">{h.email}</span>
            <Badge tone={h.status === "active" ? "sage" : "amber"}>{h.status === "active" ? t.shareT.accepted : t.shareT.pending}</Badge>
            <Badge>{h.canEdit ? t.shareT.canEdit : t.shareT.viewOnly}</Badge>
          </div>
          <p className="text-[12.5px] text-[var(--qd-muted)]">{h.sections.map((s) => sectionLabel(t, s)).join(" · ")} · {date(h.createdAt.slice(0, 10))}</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={() => update(h, { canEdit: !h.canEdit })}>{h.canEdit ? t.shareT.viewOnly : t.shareT.canEdit}</Button>
            <Button size="sm" variant="danger" onClick={() => update(h, { revoke: true })}>{t.shareT.revoke}</Button>
          </div>
        </Card>
      ))}
    </section>
  );
}
