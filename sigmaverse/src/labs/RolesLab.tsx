import { AnimatePresence, motion } from 'motion/react'
import { useState, type KeyboardEvent } from 'react'
import type { LabProps } from './registry'
import { ClassifierGame, Feedback, KnowledgeCheck, LabShell, type Bucket, type CheckItem, type ClassItem } from './kit'
import { update } from '../lib/store'

type RoleId = 'exec' | 'champ' | 'mbb' | 'bb' | 'gb' | 'yb' | 'po' | 'fin'

const ROLES: { id: RoleId; name: string; x: number; y: number; tone: string; summary: string; does: string[]; time: string; confused: string }[] = [
  { id: 'exec', name: 'Executive Sponsor', x: 360, y: 42, tone: 'var(--indigo)', summary: 'Senior leader who decides to deploy Lean Six Sigma and links it to strategy.',
    does: ['Sets the strategic direction and expectations for results', 'Funds training and the deployment', 'Gives visible support that makes the programme credible'], time: 'Small time on any single project', confused: 'Not the person who scopes individual projects: that is the Champion.' },
  { id: 'champ', name: 'Champion', x: 360, y: 128, tone: 'var(--violet)', summary: 'Senior manager accountable for a project\'s results in their area.',
    does: ['Selects and scopes projects, signs the charter', 'Chairs tollgate reviews', 'Removes barriers: data access, people\'s time, cross-department politics', 'Makes business trade-off decisions'], time: 'Part time, regular reviews', confused: 'When a team is blocked by another department, the answer is the Champion, not the MBB.' },
  { id: 'mbb', name: 'Master Black Belt', x: 140, y: 214, tone: 'var(--teal)', summary: 'Technical expert beyond Black Belt who teaches and mentors.',
    does: ['Trains and coaches Black and Green Belts', 'Reviews project analysis and tools', 'Supports Champions in project selection'], time: 'Usually full time in a deployment role', confused: 'The MBB coaches; the Black Belt leads.' },
  { id: 'bb', name: 'Black Belt', x: 360, y: 214, tone: 'var(--sky)', summary: 'Full-time leader of complex, often cross-functional projects.',
    does: ['Leads complex projects under a Champion', 'Applies advanced tools', 'Often coaches Green Belts'], time: 'Full time, about four weeks of training', confused: 'Black Belt is full time; Green Belt is part time. Distractors swap them.' },
  { id: 'gb', name: 'Green Belt', x: 360, y: 300, tone: 'var(--good)', summary: 'Part-time practitioner leading smaller projects in their own area.',
    does: ['Leads smaller-scoped projects alongside the day job', 'Supports Black Belt projects', 'Drafts the charter for their project'], time: 'Part time, about two weeks of training', confused: 'Green Belts lead smaller projects; they are not only team members.' },
  { id: 'yb', name: 'Yellow Belt', x: 360, y: 386, tone: 'var(--amber)', summary: 'Team member who knows the basics and applies them in their own job.',
    does: ['Participates in Green and Black Belt projects', 'Collects data and tests ideas', 'Applies the concepts in daily work'], time: 'As needed, about one week of training', confused: 'Yellow Belts do not lead projects.' },
  { id: 'po', name: 'Process Owner', x: 585, y: 170, tone: 'var(--coral)', summary: 'Accountable for the day-to-day performance of the process.',
    does: ['Supplies resources and functional expertise', 'Implements the solution in the process', 'Owns the process and control plan after handover'], time: 'Ongoing: stays after the Belt moves on', confused: 'The Belt leads the project; the Process Owner owns the process.' },
  { id: 'fin', name: 'Finance Representative', x: 585, y: 300, tone: 'var(--ink-2)', summary: 'Independent evaluator of hard and soft savings.',
    does: ['Helps estimate benefits in Define', 'Verifies realised benefits in Control', 'Supports Champions and project leaders on value'], time: 'Part time, at key tollgates', confused: 'Finance validates savings; the Belt does not certify their own benefits.' },
]
const R = (id: RoleId) => ROLES.find(r => r.id === id)!

const LINKS: { a: RoleId; b: RoleId; dashed?: boolean; label?: string }[] = [
  { a: 'exec', b: 'champ' }, { a: 'champ', b: 'bb' }, { a: 'bb', b: 'gb' }, { a: 'gb', b: 'yb' },
  { a: 'mbb', b: 'bb', dashed: true, label: 'coaches' }, { a: 'champ', b: 'po', dashed: true }, { a: 'bb', b: 'fin', dashed: true },
]

const ITEMS: ClassItem[] = [
  { id: 'e1', text: 'Decides the organisation will deploy Lean Six Sigma', bucket: 'exec', why: 'Deployment decisions and strategy are the Executive Sponsor\'s.', mistake: 'role-confusion' },
  { id: 'e2', text: 'Funds the training programme', bucket: 'exec', why: 'The Executive Sponsor funds and sets expectations.', mistake: 'role-confusion' },
  { id: 'e3', text: 'Links the programme to company strategy', bucket: 'exec', why: 'Strategic alignment of the whole deployment sits at the top.', mistake: 'role-confusion' },
  { id: 'c1', text: 'Signs the project charter', bucket: 'champ', why: 'The Champion approves the charter and owns the result.', mistake: 'role-confusion' },
  { id: 'c2', text: 'Removes a barrier when IT will not release data', bucket: 'champ', why: 'Barrier removal across departments is the Champion\'s job.', mistake: 'role-confusion' },
  { id: 'c3', text: 'Chairs the tollgate review', bucket: 'champ', why: 'The Champion decides proceed, redirect or stop.', mistake: 'role-confusion' },
  { id: 'c4', text: 'Selects and scopes projects in their area', bucket: 'champ', why: 'The Champion recognises, defines and assigns projects.', mistake: 'role-confusion' },
  { id: 'm1', text: 'Trains and mentors Black Belts', bucket: 'mbb', why: 'Coaching Belts is the MBB\'s core role.', mistake: 'role-confusion' },
  { id: 'm2', text: 'Reviews a Belt\'s regression analysis', bucket: 'mbb', why: 'The MBB is the technical go-to expert.', mistake: 'role-confusion' },
  { id: 'm3', text: 'Acts as the deployment\'s statistical expert', bucket: 'mbb', why: 'Expertise beyond Black Belt.', mistake: 'role-confusion' },
  { id: 'b1', text: 'Leads a complex cross-functional project full time', bucket: 'bb', why: 'Full time on complex projects: Black Belt.', mistake: 'role-confusion' },
  { id: 'b2', text: 'Coaches Green Belts on their first projects', bucket: 'bb', why: 'Black Belts often coach Green Belts (the MBB coaches Black Belts).', mistake: 'role-confusion' },
  { id: 'b3', text: 'Applies advanced tools across several departments', bucket: 'bb', why: 'Cross-functional, complex work is Black Belt territory.', mistake: 'role-confusion' },
  { id: 'g1', text: 'Leads a small project in their own team part time', bucket: 'gb', why: 'Part time, local scope: Green Belt.', mistake: 'role-confusion' },
  { id: 'g2', text: 'Drafts the charter for a local project', bucket: 'gb', why: 'The Belt drafts; the Champion signs.', mistake: 'role-confusion' },
  { id: 'g3', text: 'Supports a Black Belt project alongside the day job', bucket: 'gb', why: 'Green Belts support Black Belt projects part time.', mistake: 'role-confusion' },
  { id: 'y1', text: 'Collects data as a project team member', bucket: 'yb', why: 'Yellow Belts participate as team members.', mistake: 'role-confusion' },
  { id: 'y2', text: 'Applies basic concepts in their own job after a week of training', bucket: 'yb', why: 'About one week of training: Yellow Belt.', mistake: 'role-confusion' },
  { id: 'y3', text: 'Tests an idea during a pilot, without leading the project', bucket: 'yb', why: 'Team member, not leader.', mistake: 'role-confusion' },
  { id: 'p1', text: 'Runs the improved process after handover', bucket: 'po', why: 'The Process Owner owns the process after the Belt moves on.', mistake: 'role-confusion' },
  { id: 'p2', text: 'Signs off the control plan for their process', bucket: 'po', why: 'The Process Owner is accountable for sustaining the gain.', mistake: 'role-confusion' },
  { id: 'p3', text: 'Supplies staff and functional expertise to the project', bucket: 'po', why: 'The glossary: Process Owners supply resources and expertise.', mistake: 'role-confusion' },
  { id: 'f1', text: 'Validates hard and soft savings independently', bucket: 'fin', why: 'Independent evaluation of savings is Finance\'s role.', mistake: 'role-confusion' },
  { id: 'f2', text: 'Confirms realised benefits at project closure', bucket: 'fin', why: 'Finance verifies realised benefits in Control.', mistake: 'role-confusion' },
  { id: 'f3', text: 'Helps estimate the benefit figure in the charter', bucket: 'fin', why: 'Finance supports the Define estimate too.', mistake: 'role-confusion' },
]

const BUCKETS: Bucket[] = [
  { id: 'exec', label: 'Executive Sponsor', tone: 'indigo' }, { id: 'champ', label: 'Champion', tone: 'violet' },
  { id: 'mbb', label: 'Master Black Belt', tone: 'teal' }, { id: 'bb', label: 'Black Belt', tone: 'sky' },
  { id: 'gb', label: 'Green Belt', tone: 'teal' }, { id: 'yb', label: 'Yellow Belt', tone: 'amber' },
  { id: 'po', label: 'Process Owner', tone: 'coral' }, { id: 'fin', label: 'Finance Representative', tone: 'indigo' },
]

const W = 168, H = 44

function OrgChart({ value, onSelect }: { value: RoleId; onSelect: (r: RoleId) => void }) {
  return (
    <svg viewBox="0 0 720 420" className="h-auto w-full" role="img" aria-label={`Six Sigma roles chart. Selected: ${R(value).name}`}>
      {LINKS.map(l => {
        const a = R(l.a), b = R(l.b)
        const horiz = a.y === b.y && a.x !== b.x
        const d = horiz ? `M${a.x + (b.x > a.x ? W / 2 : -W / 2)} ${a.y} H ${b.x + (b.x > a.x ? -W / 2 : W / 2)}` : a.x === b.x ? `M${a.x} ${a.y + H / 2} V ${b.y - H / 2}` : `M${a.x + W / 2} ${a.y} C ${(a.x + b.x) / 2} ${a.y}, ${(a.x + b.x) / 2} ${b.y}, ${b.x - W / 2} ${b.y}`
        const active = l.a === value || l.b === value
        return (
          <g key={`${l.a}-${l.b}`}>
            <path d={d} fill="none" stroke={active ? 'var(--violet)' : 'var(--line-2)'} strokeWidth={active ? 2.5 : 2} strokeDasharray={l.dashed ? '6 5' : undefined} style={{ transition: 'stroke 200ms' }} />
            {l.label && <text x={(a.x + b.x) / 2} y={a.y - 8} textAnchor="middle" fontFamily="var(--font-sans)" fontSize={12} fill="var(--ink-3)">{l.label}</text>}
          </g>
        )
      })}
      {ROLES.map(r => {
        const on = r.id === value
        return (
          <g key={r.id} role="button" tabIndex={0} aria-pressed={on} aria-label={r.name} onClick={() => onSelect(r.id)}
            onKeyDown={(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(r.id) } }} style={{ cursor: 'pointer' }}>
            <motion.rect x={r.x - W / 2} y={r.y - H / 2} width={W} height={H} rx={12} initial={false} animate={{ scale: on ? 1.04 : 1 }} transition={{ duration: 0.2 }} style={{ transformOrigin: `${r.x}px ${r.y}px` }}
              fill={on ? r.tone : 'var(--surface)'} stroke={r.tone} strokeWidth={2} />
            <text x={r.x} y={r.y + 5} textAnchor="middle" fontFamily="var(--font-sans)" fontSize={14} fontWeight={600} fill={on ? 'var(--surface)' : 'var(--ink)'}>{r.name}</text>
          </g>
        )
      })}
    </svg>
  )
}

const SCENARIOS: { text: string; answer: RoleId; why: string }[] = [
  { text: 'The Green Belt cannot get ticket data because the IT department will not prioritise the extract.', answer: 'champ', why: 'Removing cross-department barriers is the Champion\'s job.' },
  { text: 'The project is closing. Who will run the new dispatch process and its control plan from Monday?', answer: 'po', why: 'Ownership transfers to the Process Owner at handover.' },
  { text: 'The Belt claims USD 267,000 of annual savings. Who confirms the figure?', answer: 'fin', why: 'Finance independently validates savings.' },
  { text: 'A new Black Belt needs help choosing the right hypothesis test.', answer: 'mbb', why: 'The MBB coaches Belts on advanced tools.' },
  { text: 'A complex project spans billing, network and field operations and needs a full-time leader.', answer: 'bb', why: 'Complex cross-functional work led full time: Black Belt.' },
  { text: 'A billing team lead wants to improve her own team\'s invoice error rate alongside her normal job.', answer: 'gb', why: 'A part-time, local-scope project: Green Belt.' },
  { text: 'The board wants Lean Six Sigma linked to the three-year strategy and funded.', answer: 'exec', why: 'Strategy and funding of the deployment: Executive Sponsor.' },
  { text: 'An agent with one week of training helps collect call-timing data for a project.', answer: 'yb', why: 'A trained team member contributing to a project: Yellow Belt.' },
]

const CHECK: CheckItem[] = [
  { q: 'Who is accountable for sustaining the gains after the project closes?', options: ['Black Belt', 'Champion', 'Process Owner', 'Master Black Belt'], answer: 2, why: 'The Process Owner owns the process and its control plan after handover.' },
  { q: 'Which role is usually full time on Six Sigma projects?', options: ['Green Belt', 'Black Belt', 'Yellow Belt', 'Process Owner'], answer: 1, why: 'Black Belts lead complex projects full time; Green Belts are part time.' },
  { q: 'A team is blocked by another department. Who should act FIRST?', options: ['The Champion', 'The Yellow Belt', 'The Finance Representative', 'The Master Black Belt'], answer: 0, why: 'The Champion removes barriers and resolves cross-department issues.' },
  { q: 'Who provides an independent evaluation of hard and soft savings?', options: ['The Green Belt', 'The Finance Representative', 'The Executive Sponsor', 'The Process Owner'], answer: 1, why: 'Finance validates savings so the claims are credible.' },
]

export default function RolesLab({ embedded }: LabProps) {
  const [role, setRole] = useState<RoleId>('champ')
  const [sc, setSc] = useState(0)
  const [pick, setPick] = useState<RoleId | null>(null)
  const r = R(role)
  const s = SCENARIOS[sc]

  const answer = (id: RoleId) => {
    if (pick) return
    setPick(id)
    setRole(s.answer)
    if (id !== s.answer) update(p => { p.mistakes.push({ at: Date.now(), tag: 'role-confusion', lesson: '1.1.6' }) })
  }
  const another = () => { setSc(i => (i + 1 + Math.floor(Math.random() * (SCENARIOS.length - 1))) % SCENARIOS.length); setPick(null) }

  const explore = (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-line bg-surface-2/40 p-2"><OrgChart value={role} onSelect={setRole} /></div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={role} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="rounded-2xl border border-line p-4">
            <h3 className="font-display text-xl font-semibold text-ink">{r.name}</h3>
            <p className="mt-1 text-[0.95rem] text-ink-2">{r.summary}</p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink">{r.does.map(d => <li key={d}>{d}</li>)}</ul>
            <p className="mt-3 text-sm text-ink-2"><strong className="text-ink">Time: </strong>{r.time}</p>
            <p className="mt-3 rounded-xl bg-coral-soft px-3 py-2 text-sm text-ink"><strong className="text-coral">Often confused: </strong>{r.confused}</p>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="rounded-2xl border border-dashed border-line-2 p-4">
        <h3 className="font-display text-base font-semibold text-ink">Who should act?</h3>
        <p className="mt-1.5 text-[0.95rem] leading-relaxed text-ink">{s.text}</p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {ROLES.map(x => {
            const show = pick !== null
            const cls = show && x.id === s.answer ? 'border-good bg-good-soft' : show && x.id === pick ? 'border-bad bg-bad-soft' : 'border-line hover:bg-surface-2'
            return <button key={x.id} disabled={show} onClick={() => answer(x.id)} className={`rounded-xl border px-2 py-2 text-sm font-semibold text-ink transition-colors disabled:cursor-default ${cls}`}>{x.name}</button>
          })}
        </div>
        {pick && <><Feedback ok={pick === s.answer}><strong>{R(s.answer).name}.</strong> {s.why}</Feedback><button className="btn btn-soft btn-sm mt-3" onClick={another}>Next situation</button></>}
      </div>
    </div>
  )

  return (
    <LabShell
      lab="roles"
      embedded={embedded}
      instructions="Select any role in the chart to see its responsibilities, time commitment and the role it is most often confused with. Then decide who should act in each situation. Solid lines show reporting; dashed lines show coaching and partnership."
      scenario="Northwind Fibre is launching its first Green Belt project to cut repeat field visits, and everyone wants to know who does what."
      explore={explore}
      challenge={<ClassifierGame lab="roles" items={ITEMS} buckets={BUCKETS} count={10} timed />}
      check={<KnowledgeCheck lab="roles" items={CHECK} />}
      onReset={() => { setRole('champ'); setSc(0); setPick(null) }}
      onNewExample={another}
    />
  )
}
