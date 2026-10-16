import { AnimatePresence, motion } from 'motion/react'
import { Timer } from 'lucide-react'
import { useEffect, useMemo, useState, type KeyboardEvent, type ReactNode } from 'react'
import type { LabProps } from './registry'
import { Feedback, KnowledgeCheck, LabShell, shuffle, type CheckItem } from './kit'
import { Segmented } from '../components/ui'
import { recordLab, update } from '../lib/store'

/* ------------------------------------------------------------------ */
/* Vocabulary                                                          */
/* ------------------------------------------------------------------ */

const SEVEN = ['Overproduction', 'Correction', 'Inventory', 'Motion', 'Overprocessing', 'Conveyance', 'Waiting'] as const
type Seven = (typeof SEVEN)[number]
type Waste = Seven | 'Non-Utilized Talent'

/** Eight-waste (DOWNTIME) names for each syllabus element. */
const EIGHT_NAME: Record<Waste, string> = {
  Overproduction: 'Over-Production', Correction: 'Defects', Inventory: 'Inventory', Motion: 'Motion',
  Overprocessing: 'Extra-Processing', Conveyance: 'Transportation', Waiting: 'Waiting', 'Non-Utilized Talent': 'Non-Utilized Talent',
}

const DEF: Record<Waste, string> = {
  Overproduction: 'Making more than is needed, or earlier than it is needed.',
  Correction: 'Finding, fixing, redoing or scrapping work that was not right first time.',
  Inventory: 'Material, information or work in progress held beyond immediate need.',
  Motion: 'Unnecessary movement of people within a workstation: reaching, walking, searching, switching screens.',
  Overprocessing: 'Doing more work, or higher-grade work, than the customer requires.',
  Conveyance: 'Moving materials, products or information between locations, steps or teams without adding value.',
  Waiting: 'People, equipment or customers idle because the next input has not arrived.',
  'Non-Utilized Talent': "Failing to use people's skills, ideas and knowledge (eight-waste model only).",
}

/* ------------------------------------------------------------------ */
/* Scenes                                                              */
/* ------------------------------------------------------------------ */

interface Spot { id: string; x: number; y: number; title: string; text: string; answer: Waste; why: string; confused?: Waste; tell?: string; talent?: boolean }
interface Scene { id: string; name: string; blurb: string; art: ReactNode; spots: Spot[] }

const T = { fontFamily: 'var(--font-sans)', fontSize: 13, fill: 'var(--ink-2)' } as const

function Person({ x, y, tone = 'var(--indigo)', label }: { x: number; y: number; tone?: string; label?: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle cx={0} cy={-30} r={9} fill={tone} opacity={0.9} />
      <rect x={-11} y={-19} width={22} height={30} rx={9} fill={tone} opacity={0.75} />
      {label && <text x={0} y={28} textAnchor="middle" {...T} fontSize={12}>{label}</text>}
    </g>
  )
}
function Box({ x, y, w = 26, h = 20, tone = 'var(--amber)' }: { x: number; y: number; w?: number; h?: number; tone?: string }) {
  return <rect x={x} y={y} width={w} height={h} rx={3} fill={tone} opacity={0.35} stroke={tone} strokeWidth={1.2} />
}
function Arrow({ d, tone = 'var(--ink-3)', dashed = true }: { d: string; tone?: string; dashed?: boolean }) {
  return <path d={d} fill="none" stroke={tone} strokeWidth={2} strokeDasharray={dashed ? '6 5' : undefined} markerEnd="url(#wl-arrow)" />
}
function Monitor({ x, y, w = 40 }: { x: number; y: number; w?: number }) {
  return <g><rect x={x} y={y} width={w} height={w * 0.65} rx={3} fill="var(--surface)" stroke="var(--ink-3)" strokeWidth={1.5} /><rect x={x + w / 2 - 3} y={y + w * 0.65} width={6} height={7} fill="var(--ink-3)" /></g>
}
function Floor({ wall = 'var(--surface-2)' }: { wall?: string }) {
  return <g><rect x={0} y={0} width={720} height={400} fill={wall} /><rect x={0} y={250} width={720} height={150} fill="var(--surface-3)" opacity={0.6} /></g>
}

const SCENES: Scene[] = [
  {
    id: 'depot', name: 'Fibre installation depot', blurb: 'Northwind Fibre prepares installation kits and loads engineer vans every morning.',
    art: (
      <g>
        <Floor />
        {/* Shelving with forecast kits */}
        <rect x={30} y={60} width={170} height={190} rx={4} fill="none" stroke="var(--ink-3)" strokeWidth={2} />
        {[100, 150, 200].map(y => <line key={y} x1={30} x2={200} y1={y} y2={y} stroke="var(--ink-3)" strokeWidth={2} />)}
        {[0, 1, 2, 3].flatMap(r => [0, 1, 2, 3, 4].map(c => <Box key={`${r}-${c}`} x={36 + c * 32} y={70 + r * 50} w={26} h={r === 3 ? 0 : 26} />))}
        <text x={115} y={52} textAnchor="middle" {...T}>Kits built to forecast</text>
        {/* Tool board on the far wall */}
        <rect x={600} y={60} width={90} height={70} rx={6} fill="var(--surface)" stroke="var(--ink-3)" strokeWidth={1.5} />
        <path d="M615 80 l10 30 M640 78 v34 M660 80 l12 28" stroke="var(--ink-2)" strokeWidth={3} strokeLinecap="round" />
        <text x={645} y={148} textAnchor="middle" {...T}>Splicing tools</text>
        <Person x={330} y={300} label="Engineer" />
        <Arrow d="M345 280 C 450 230, 540 170, 600 120" />
        {/* Two stores and a forklift */}
        <rect x={250} y={70} width={90} height={60} rx={4} fill="var(--surface)" stroke="var(--ink-3)" /><text x={295} y={105} textAnchor="middle" {...T}>Store A</text>
        <rect x={430} y={70} width={90} height={60} rx={4} fill="var(--surface)" stroke="var(--ink-3)" /><text x={475} y={105} textAnchor="middle" {...T}>Store B</text>
        <Arrow d="M345 95 H 425" /><Arrow d="M425 118 H 345" />
        <g transform="translate(360 145)"><rect width={44} height={22} rx={4} fill="var(--sky)" opacity={0.6} /><circle cx={10} cy={26} r={6} fill="var(--ink-3)" /><circle cx={34} cy={26} r={6} fill="var(--ink-3)" /><path d="M44 2 v24 h12" stroke="var(--ink-3)" strokeWidth={3} fill="none" /></g>
        {/* Loading bay and van */}
        <rect x={560} y={230} width={140} height={90} rx={10} fill="var(--surface)" stroke="var(--ink-3)" strokeWidth={1.5} />
        <rect x={580} y={245} width={40} height={28} rx={3} fill="var(--sky-soft)" stroke="var(--sky)" />
        <circle cx={590} cy={325} r={11} fill="var(--ink-3)" /><circle cx={670} cy={325} r={11} fill="var(--ink-3)" />
        <text x={630} y={355} textAnchor="middle" {...T}>Van waiting for kit sign-off</text>
        {/* Returns bench */}
        <rect x={60} y={300} width={180} height={16} rx={3} fill="var(--ink-3)" opacity={0.5} />
        <Box x={75} y={278} tone="var(--bad)" /><Box x={110} y={278} tone="var(--bad)" /><Box x={145} y={278} tone="var(--bad)" />
        <text x={150} y={340} textAnchor="middle" {...T}>Returns bench</text>
        <Person x={470} y={300} tone="var(--teal)" label="Storeman" />
      </g>
    ),
    spots: [
      { id: 'd1', x: 115, y: 160, title: 'Forecast kits', text: 'Four hundred kits are configured for next month\'s forecast. When the router model changes, many will be stripped and rebuilt.', answer: 'Overproduction', why: 'The kits were built before a confirmed order existed: output made too early and in excess. Overproduction is often called the worst waste because it creates others, here inventory and rework.', confused: 'Inventory', tell: 'The pile on the shelf is inventory, but the act that created it, building ahead of demand, is Overproduction. Ask: was this made before anyone needed it?' },
      { id: 'd2', x: 382, y: 156, title: 'Forklift shuttle', text: 'Pallets are moved from Store A to Store B in the morning and back again in the afternoon.', answer: 'Conveyance', why: 'Materials are being moved between locations with no change to the item and no value for the customer.', confused: 'Motion', tell: 'Motion is a person moving within their own workspace. Here the item travels between places: Conveyance.' },
      { id: 'd3', x: 470, y: 205, title: 'Walk to the tool board', text: 'Each engineer walks across the depot several times a day to fetch splicing tools kept on the far wall.', answer: 'Motion', why: 'A person moving around their work area to reach tools adds no value. 5S Straighten would keep A-class tools within reach.', confused: 'Conveyance', tell: 'Nothing is being transported for the customer: the person is moving. That is Motion.' },
      { id: 'd4', x: 630, y: 280, title: 'Van at the bay', text: 'Engineers sit in their vans for 35 minutes each morning until a supervisor signs off the kit list.', answer: 'Waiting', why: 'People are idle because the next input, the sign-off, has not arrived.', confused: 'Inventory', tell: 'Inventory is work sitting still. Here the people are idle: Waiting.' },
      { id: 'd5', x: 150, y: 270, title: 'Returns bench', text: '9% of kits come back because the wrong connectors were packed, and are unpacked and rebuilt.', answer: 'Correction', why: 'Effort spent fixing work that was not right the first time is Correction (called Defects in the eight-waste model).', confused: 'Overprocessing', tell: 'Overprocessing adds extra work to something already right. Fixing something wrong is Correction.' },
      { id: 'd6', x: 470, y: 250, title: 'Storeman\'s idea', text: 'The storeman designed a colour-coded kit label at his last job. Nobody has ever asked him how to reduce packing errors.', answer: 'Non-Utilized Talent', why: 'Failing to use people\'s skills and ideas is the eighth waste in the DOWNTIME model. It is not one of the seven syllabus elements.', talent: true },
    ],
  },
  {
    id: 'desk', name: 'IT service desk', blurb: 'A telecom service desk handles broadband and billing incidents for business customers.',
    art: (
      <g>
        <Floor />
        {/* Queue board */}
        <rect x={40} y={40} width={200} height={120} rx={8} fill="var(--surface)" stroke="var(--ink-3)" strokeWidth={1.5} />
        <text x={140} y={70} textAnchor="middle" {...T} fontWeight={600}>Open tickets</text>
        <text x={140} y={115} textAnchor="middle" fontFamily="var(--font-display)" fontSize={34} fontWeight={700} fill="var(--coral)">612</text>
        <text x={140} y={145} textAnchor="middle" {...T} fontSize={12}>oldest: 9 days</text>
        {/* Agent with many screens */}
        <rect x={290} y={230} width={200} height={14} rx={3} fill="var(--ink-3)" opacity={0.55} />
        {[0, 1, 2, 3, 4, 5].map(i => <Monitor key={i} x={292 + (i % 3) * 66} y={i < 3 ? 140 : 188} w={58} />)}
        <Person x={390} y={310} label="Agent" />
        {/* Resolver groups loop */}
        {[[560, 60, 'Network'], [660, 140, 'Billing'], [560, 220, 'Field'], [470, 140, 'Desk']].map(([x, y, l]) => (
          <g key={l as string}><circle cx={x as number} cy={y as number} r={30} fill="var(--surface)" stroke="var(--sky)" strokeWidth={1.5} /><text x={x as number} y={(y as number) + 4} textAnchor="middle" {...T} fontSize={12}>{l}</text></g>
        ))}
        <Arrow d="M588 72 Q 640 85 652 112" tone="var(--sky)" /><Arrow d="M650 168 Q 630 210 590 222" tone="var(--sky)" /><Arrow d="M532 225 Q 485 205 474 170" tone="var(--sky)" /><Arrow d="M478 112 Q 495 72 532 62" tone="var(--sky)" />
        {/* Reviewer */}
        <rect x={60} y={300} width={140} height={12} rx={3} fill="var(--ink-3)" opacity={0.55} />
        <Monitor x={110} y={258} w={44} />
        <Person x={60} y={350} tone="var(--violet)" label="Reviewer" />
        {/* Reopened tray */}
        <rect x={560} y={310} width={110} height={40} rx={6} fill="var(--bad-soft)" stroke="var(--bad)" />
        <text x={615} y={335} textAnchor="middle" {...T} fill="var(--bad)" fontSize={12}>Reopened</text>
        <Person x={250} y={350} tone="var(--teal)" label="Senior agent" />
      </g>
    ),
    spots: [
      { id: 's1', x: 140, y: 100, title: 'Ticket queue', text: '612 tickets are sitting in "open, unassigned". The oldest has waited nine days.', answer: 'Inventory', why: 'Work in progress piling up beyond what can be handled now is Inventory, even when it is digital.', confused: 'Waiting', tell: 'The tickets (the work) are sitting still: Inventory. If the agents were idle waiting for tickets, that would be Waiting.' },
      { id: 's2', x: 390, y: 180, title: 'Six screens', text: 'To answer one billing query an agent clicks through six systems and copies the account number by hand into each.', answer: 'Motion', why: 'Switching screens, searching and re-keying within one workstation is the digital form of Motion.', confused: 'Conveyance', tell: 'The ticket is not moving between teams; the agent is moving within the workstation. That is Motion.' },
      { id: 's3', x: 565, y: 140, title: 'Ticket ping-pong', text: 'A broadband fault ticket is reassigned between four resolver groups before anyone works on it.', answer: 'Conveyance', why: 'Information is being moved between teams without adding value. Each handoff adds delay and risk.', confused: 'Motion', tell: 'The work item travels between groups: Conveyance. No person is walking anywhere.' },
      { id: 's4', x: 132, y: 280, title: 'Universal review', text: 'A quality reviewer reads every resolution note before closure. 97.3% are already correct.', answer: 'Overprocessing', why: 'Checking work that is already right adds effort the customer does not need. Prevent errors at source instead.', confused: 'Correction', tell: 'Fixing the 2.7% of wrong notes is Correction. Reviewing the 97.3% that were right is Overprocessing.' },
      { id: 's5', x: 615, y: 330, title: 'Reopened tickets', text: '14% of closed faults are reopened within seven days because the fault was not actually fixed.', answer: 'Correction', why: 'Redoing work that was not right the first time is Correction.', confused: 'Overprocessing', tell: 'The work was wrong and must be redone: Correction, not extra work on a correct output.' },
      { id: 's6', x: 250, y: 300, title: 'Senior agent', text: 'A senior agent has written scripts that could auto-fill three of the six systems, but the team is not allowed to suggest tooling changes.', answer: 'Non-Utilized Talent', why: 'Unused skills and ideas are the eighth waste in the DOWNTIME model, not one of the syllabus seven.', talent: true },
    ],
  },
  {
    id: 'invoice', name: 'Invoice processing office', blurb: 'Brightwater Utilities\' accounts payable team handles 9,640 supplier invoices a month.',
    art: (
      <g>
        <Floor />
        {/* Mail van from regional offices */}
        <g transform="translate(30 70)"><rect width={120} height={56} rx={8} fill="var(--surface)" stroke="var(--ink-3)" strokeWidth={1.5} /><rect x={80} y={10} width={30} height={20} rx={3} fill="var(--sky-soft)" stroke="var(--sky)" /><circle cx={24} cy={60} r={10} fill="var(--ink-3)" /><circle cx={96} cy={60} r={10} fill="var(--ink-3)" /><text x={60} y={-10} textAnchor="middle" {...T}>Post from regions</text></g>
        <Arrow d="M160 100 H 230" />
        {/* To be keyed pile */}
        {[0, 1, 2, 3, 4, 5, 6].map(i => <rect key={i} x={240 + (i % 2) * 3} y={150 - i * 12} width={80} height={10} rx={2} fill="var(--surface)" stroke="var(--ink-3)" />)}
        <text x={282} y={185} textAnchor="middle" {...T}>To be keyed: 2,117</text>
        {/* Approvers waiting */}
        <Person x={420} y={160} tone="var(--violet)" /><Person x={460} y={160} tone="var(--violet)" />
        <text x={440} y={190} textAnchor="middle" {...T}>Approvers</text>
        <rect x={500} y={110} width={70} height={46} rx={5} fill="var(--surface)" stroke="var(--ink-3)" /><text x={535} y={138} textAnchor="middle" {...T} fontSize={12}>Weekly</text>
        {/* Two-level approval */}
        <rect x={600} y={60} width={90} height={40} rx={6} fill="var(--surface)" stroke="var(--ink-3)" /><text x={645} y={85} textAnchor="middle" {...T} fontSize={12}>Approval 1</text>
        <rect x={600} y={130} width={90} height={40} rx={6} fill="var(--surface)" stroke="var(--ink-3)" /><text x={645} y={155} textAnchor="middle" {...T} fontSize={12}>Approval 2</text>
        <Arrow d="M645 102 V 126" dashed={false} />
        {/* Printer and report */}
        <rect x={60} y={260} width={110} height={60} rx={6} fill="var(--surface)" stroke="var(--ink-3)" strokeWidth={1.5} />
        {[0, 1, 2, 3].map(i => <rect key={i} x={180 + i * 8} y={268 + i * 6} width={56} height={40} rx={2} fill="var(--surface)" stroke="var(--ink-3)" />)}
        <text x={150} y={345} textAnchor="middle" {...T}>Ageing report, 14 copies</text>
        {/* Returns */}
        <rect x={360} y={280} width={140} height={44} rx={6} fill="var(--bad-soft)" stroke="var(--bad)" />
        <text x={430} y={307} textAnchor="middle" {...T} fill="var(--bad)" fontSize={12}>Returned: wrong code</text>
        <Person x={600} y={330} label="AP clerk" />
        <Person x={660} y={330} tone="var(--teal)" label="Clerk" />
      </g>
    ),
    spots: [
      { id: 'i1', x: 90, y: 110, title: 'Posted invoices', text: 'Regional offices post paper invoices to head office, where they are scanned.', answer: 'Conveyance', why: 'Moving documents between locations adds time and risk but no value. Scanning at source removes it.', confused: 'Motion', tell: 'The invoice (the item) travels: Conveyance.' },
      { id: 'i2', x: 282, y: 120, title: 'Keying backlog', text: '2,117 invoices sit in the "to be keyed" queue on the day of the waste walk.', answer: 'Inventory', why: 'Unprocessed work held beyond immediate need is Inventory. It hides problems and ages.', confused: 'Waiting', tell: 'The invoices sit still: Inventory. If the clerks were idle, that would be Waiting.' },
      { id: 'i3', x: 440, y: 120, title: 'Weekly batch', text: 'Approvers wait for a weekly printed batch, so invoices received on Monday are not seen until the following Monday.', answer: 'Waiting', why: 'People and work are idle because the next input arrives only once a week.', confused: 'Inventory', tell: 'The approvers are idle until the batch arrives: Waiting.' },
      { id: 'i4', x: 645, y: 115, title: 'Two sign-offs', text: 'Every invoice under USD 500 needs two levels of approval.', answer: 'Overprocessing', why: 'More checking than the risk or the customer requires is Overprocessing.', confused: 'Correction', tell: 'Nothing is wrong with these invoices: extra work on correct items is Overprocessing.' },
      { id: 'i5', x: 115, y: 290, title: 'Ageing report', text: 'A monthly ageing report is printed for 14 managers. Two read it.', answer: 'Overproduction', why: 'Producing more output than anyone needs is Overproduction.', confused: 'Overprocessing', tell: 'Overprocessing is too much work on each unit. Here too many units (copies) are produced: Overproduction.' },
      { id: 'i6', x: 430, y: 302, title: 'Returned invoices', text: '6.4% of invoices are returned for wrong cost-centre codes and must be re-keyed.', answer: 'Correction', why: 'Re-keying work that was wrong the first time is Correction.', confused: 'Overprocessing', tell: 'The work was wrong and is redone: Correction.' },
      { id: 'i7', x: 660, y: 300, title: 'Clerk\'s suggestion', text: 'A clerk who trained in data validation proposed a cost-centre lookup a year ago. It was never discussed.', answer: 'Non-Utilized Talent', why: 'An unused idea and skill: the eighth waste in the DOWNTIME model.', talent: true },
    ],
  },
  {
    id: 'ward', name: 'Hospital ward', blurb: 'A 28-bed medical ward discharging patients home.',
    art: (
      <g>
        <Floor wall="var(--surface-2)" />
        {/* Beds */}
        {[0, 1, 2].map(i => (
          <g key={i} transform={`translate(${40 + i * 140} 200)`}><rect width={110} height={40} rx={8} fill="var(--surface)" stroke="var(--ink-3)" strokeWidth={1.5} /><rect x={6} y={6} width={26} height={28} rx={6} fill="var(--sky-soft)" /><rect x={10} y={40} width={6} height={22} fill="var(--ink-3)" /><rect x={94} y={40} width={6} height={22} fill="var(--ink-3)" /></g>
        ))}
        <text x={95} y={185} textAnchor="middle" {...T}>Ready to go home</text>
        {/* Supply room far away */}
        <rect x={600} y={50} width={100} height={90} rx={6} fill="var(--surface)" stroke="var(--ink-3)" strokeWidth={1.5} /><text x={650} y={100} textAnchor="middle" {...T} fontSize={12}>Supply room</text>
        <Person x={470} y={330} tone="var(--teal)" label="Nurse" />
        <Arrow d="M485 300 C 540 250, 600 190, 640 145" />
        {/* Sample run */}
        <rect x={40} y={60} width={110} height={60} rx={6} fill="var(--surface)" stroke="var(--ink-3)" /><text x={95} y={95} textAnchor="middle" {...T} fontSize={12}>Lab, Block D</text>
        <Arrow d="M300 100 H 160" />
        {[0, 1, 2, 3, 4].map(i => <rect key={i} x={310 + i * 12} y={86} width={8} height={26} rx={3} fill="var(--coral)" opacity={0.6} />)}
        <text x={340} y={135} textAnchor="middle" {...T} fontSize={12}>Sample batch</text>
        {/* Forms */}
        {[0, 1, 2, 3].map(i => <rect key={i} x={430 + i * 30} y={60 + i * 4} width={44} height={56} rx={3} fill="var(--surface)" stroke="var(--ink-3)" />)}
        <text x={490} y={150} textAnchor="middle" {...T} fontSize={12}>Same details, 4 forms</text>
        {/* Trolley */}
        <rect x={540} y={250} width={120} height={60} rx={6} fill="var(--surface)" stroke="var(--ink-3)" />
        {[0, 1, 2, 3, 4, 5].map(i => <Box key={i} x={546 + (i % 3) * 38} y={256 + Math.floor(i / 3) * 26} w={32} h={20} tone="var(--violet)" />)}
        <text x={600} y={330} textAnchor="middle" {...T} fontSize={12}>Medicine trolley</text>
        {/* Repeat test */}
        <rect x={60} y={320} width={140} height={40} rx={6} fill="var(--bad-soft)" stroke="var(--bad)" /><text x={130} y={345} textAnchor="middle" {...T} fill="var(--bad)" fontSize={12}>Repeat blood test</text>
        <Person x={300} y={350} tone="var(--violet)" label="Assistant" />
      </g>
    ),
    spots: [
      { id: 'w1', x: 95, y: 220, title: 'Discharge delay', text: 'A patient is medically fit at 9 am but waits until 3 pm for discharge medicines from pharmacy.', answer: 'Waiting', why: 'The patient (the customer) and the bed are idle until the next input arrives.', confused: 'Inventory', tell: 'A person is idle: Waiting. A pile of unprocessed prescriptions would be Inventory.' },
      { id: 'w2', x: 560, y: 220, title: 'Supply walk', text: 'Nurses walk to a supply room at the far end of the ward up to 30 times a shift for dressings.', answer: 'Motion', why: 'Staff moving around their work area to fetch items adds no value. Keep A-class items at the point of use.', confused: 'Conveyance', tell: 'A person moves within the work area: Motion.' },
      { id: 'w3', x: 240, y: 100, title: 'Sample batches', text: 'Blood samples are collected into batches and carried across the site to the lab in Block D twice a day.', answer: 'Conveyance', why: 'Moving items between locations without adding value is Conveyance; batching also creates waiting.', confused: 'Motion', tell: 'The samples (items) travel between places: Conveyance.' },
      { id: 'w4', x: 490, y: 95, title: 'Four forms', text: 'The same patient details are written by hand on four different discharge forms.', answer: 'Overprocessing', why: 'Duplicated effort beyond what the patient or regulation requires is Overprocessing.', confused: 'Correction', tell: 'Nothing was wrong the first time; the extra copies are Overprocessing.' },
      { id: 'w5', x: 130, y: 340, title: 'Repeat test', text: 'A blood test is repeated because the first sample was mislabelled.', answer: 'Correction', why: 'Redoing work that was not right the first time is Correction.', confused: 'Overprocessing', tell: 'The first attempt was wrong: Correction.' },
      { id: 'w6', x: 600, y: 280, title: 'Overstocked trolley', text: 'The trolley holds three weeks of medicines; 4% of stock expires each month.', answer: 'Inventory', why: 'Material held beyond immediate need ties up cash and expires.', confused: 'Overproduction', tell: 'The stock is held material: Inventory. Overproduction would be making more output than needed.' },
      { id: 'w7', x: 300, y: 300, title: 'Assistant\'s idea', text: 'A healthcare assistant suggested a discharge checklist used at her previous hospital. Nobody followed it up.', answer: 'Non-Utilized Talent', why: 'Unused knowledge and ideas: the eighth waste in the DOWNTIME model.', talent: true },
    ],
  },
]

/* ------------------------------------------------------------------ */
/* Scene renderer                                                      */
/* ------------------------------------------------------------------ */

function SceneView({ scene, spots, status, selected, onPick, label }: { scene: Scene; spots: Spot[]; status: Record<string, 'ok' | 'bad' | undefined>; selected: string | null; onPick?: (id: string) => void; label: string }) {
  return (
    <svg viewBox="0 0 720 400" className="h-auto w-full rounded-2xl border border-line" role="img" aria-label={label}>
      <defs>
        <marker id="wl-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="var(--ink-3)" /></marker>
      </defs>
      {scene.art}
      {spots.map((s, i) => {
        const st = status[s.id]
        const fill = st === 'ok' ? 'var(--good)' : st === 'bad' ? 'var(--bad)' : s.talent ? 'var(--violet)' : 'var(--amber)'
        const sel = selected === s.id
        return (
          <g key={s.id} {...(onPick ? {
            role: 'button', tabIndex: 0, 'aria-pressed': sel, style: { cursor: 'pointer', outline: 'none' },
            'aria-label': `Hotspot ${i + 1}: ${s.title}${st ? (st === 'ok' ? ', answered correctly' : ', answered incorrectly') : ''}`,
            onClick: () => onPick(s.id),
            onKeyDown: (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPick(s.id) } },
          } : { 'aria-hidden': true })} className="group">
            {sel && <motion.circle cx={s.x} cy={s.y} r={26} fill="none" stroke={fill} strokeWidth={3} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ transformOrigin: `${s.x}px ${s.y}px` }} />}
            <circle cx={s.x} cy={s.y} r={17} fill={fill} stroke="var(--surface)" strokeWidth={3} className="transition-[r] group-hover:[r:19] group-focus-visible:[r:20]" />
            <text x={s.x} y={s.y + 5} textAnchor="middle" fontFamily="var(--font-sans)" fontSize={14} fontWeight={700} fill="var(--surface)">{st === 'ok' ? '✓' : st === 'bad' ? '!' : i + 1}</text>
          </g>
        )
      })}
    </svg>
  )
}

function Choices({ eight, onChoose, disabled, picked, answer }: { eight: boolean; onChoose: (w: Waste) => void; disabled: boolean; picked: Waste | null; answer: Waste }) {
  const list: Waste[] = eight ? [...SEVEN, 'Non-Utilized Talent'] : [...SEVEN]
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {list.map(w => {
        const show = disabled
        const cls = show && w === answer ? 'border-good bg-good-soft' : show && w === picked ? 'border-bad bg-bad-soft' : 'border-line hover:border-amber hover:bg-amber-soft/50'
        return (
          <button key={w} disabled={disabled} onClick={() => onChoose(w)} className={`rounded-xl border px-3 py-2 text-left text-sm font-semibold text-ink transition-colors disabled:cursor-default ${cls}`}>
            {eight ? EIGHT_NAME[w] : w}
            {eight && EIGHT_NAME[w] !== w && <span className="block text-xs font-normal text-ink-3">Syllabus: {w}</span>}
            {w === 'Non-Utilized Talent' && <span className="block text-xs font-normal text-ink-3">Eight-waste model only</span>}
          </button>
        )
      })}
    </div>
  )
}

function Reasoning({ spot, chosen, eight }: { spot: Spot; chosen: Waste; eight: boolean }) {
  const ok = chosen === spot.answer
  const name = (w: Waste) => (eight ? `${EIGHT_NAME[w]}${EIGHT_NAME[w] !== w ? ` (${w})` : ''}` : w)
  return (
    <Feedback ok={ok}>
      <p><strong>{ok ? 'Correct: ' : `Not ${name(chosen)}. It is `}{name(spot.answer)}.</strong> {spot.why}</p>
      {spot.confused && <p className="mt-1.5"><strong>Commonly confused with {name(spot.confused)}:</strong> {spot.tell}</p>}
    </Feedback>
  )
}

/* ------------------------------------------------------------------ */
/* Challenge: timed, one hotspot at a time                             */
/* ------------------------------------------------------------------ */

function Challenge() {
  const [seed, setSeed] = useState(0)
  const items = useMemo(() => shuffle(SCENES.flatMap(sc => sc.spots.filter(s => !s.talent).map(s => ({ scene: sc, spot: s })))).slice(0, 8), [seed]) // eslint-disable-line react-hooks/exhaustive-deps
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<Waste | null>(null)
  const [score, setScore] = useState(0)
  const [start, setStart] = useState(() => Date.now())
  const [now, setNow] = useState(() => Date.now())
  const [end, setEnd] = useState<number | null>(null)
  const done = i >= items.length

  useEffect(() => {
    if (done) return
    const t = window.setInterval(() => setNow(Date.now()), 500)
    return () => window.clearInterval(t)
  }, [done])

  const secs = Math.round(((end ?? now) - start) / 1000)
  const restart = () => { setSeed(s => s + 1); setI(0); setPicked(null); setScore(0); setStart(Date.now()); setNow(Date.now()); setEnd(null) }

  if (done) {
    const pctScore = Math.round((score / items.length) * 100)
    return (
      <div className="rounded-2xl bg-amber-soft p-5">
        <p className="font-display text-2xl font-semibold text-ink">{score} of {items.length} wastes named correctly</p>
        <p className="mt-1 text-sm text-ink-2 tabular">Time: {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}. Accuracy {pctScore}%.</p>
        <p className="mt-2 text-sm text-ink-2">Ask two questions every time: what is moving or idle, the item or the person? And is the work wrong, or right but excessive?</p>
        <button className="btn btn-primary mt-4" onClick={restart}>New timed round</button>
      </div>
    )
  }
  const { scene, spot } = items[i]
  const choose = (w: Waste) => {
    if (picked) return
    setPicked(w)
    if (w === spot.answer) setScore(s => s + 1)
    else update(p => { p.mistakes.push({ at: Date.now(), tag: 'waste-confusion', lesson: '1.4.4' }) })
  }
  const next = () => {
    const ni = i + 1
    setI(ni); setPicked(null)
    if (ni >= items.length) { setEnd(Date.now()); recordLab('waste', Math.round((score / items.length) * 100)) }
  }
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-ink-3">
        <span className="tabular">Hotspot {i + 1} of {items.length} · {scene.name}</span>
        <span className="tabular flex items-center gap-1.5 font-semibold text-ink"><Timer className="size-4 text-amber" />{Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}</span>
      </div>
      <SceneView scene={scene} spots={[spot]} status={picked ? { [spot.id]: picked === spot.answer ? 'ok' : 'bad' } : {}} selected={spot.id} label={`${scene.name}. Highlighted: ${spot.title}`} />
      <div>
        <h3 className="font-semibold text-ink">{spot.title}</h3>
        <p className="mt-1 text-[0.95rem] leading-relaxed text-ink-2">{spot.text}</p>
      </div>
      <Choices eight={false} onChoose={choose} disabled={!!picked} picked={picked} answer={spot.answer} />
      {picked && <><Reasoning spot={spot} chosen={picked} eight={false} /><button className="btn btn-primary" onClick={next}>{i + 1 < items.length ? 'Next hotspot' : 'See result'}</button></>}
    </div>
  )
}

const CHECK: CheckItem[] = [
  { q: 'Which of these is NOT one of the seven elements of waste in the syllabus?', options: ['Conveyance', 'Non-Utilized Talent', 'Overprocessing', 'Correction'], answer: 1, why: 'Non-Utilized Talent belongs to the eight-waste (DOWNTIME) model. The syllabus seven are Overproduction, Correction, Inventory, Motion, Overprocessing, Conveyance and Waiting.' },
  { q: 'A ticket is reassigned between four resolver groups. Which waste is this?', options: ['Motion', 'Waiting', 'Conveyance', 'Inventory'], answer: 2, why: 'The work item moves between teams: Conveyance. Motion is a person moving within a workstation.' },
  { q: 'A manager reviews every invoice even though 98% are correct. Which waste?', options: ['Correction', 'Overprocessing', 'Overproduction', 'Waiting'], answer: 1, why: 'Extra work on items that are already right is Overprocessing. Fixing the wrong 2% would be Correction.' },
  { q: 'Which waste is often called the worst because it creates the others?', options: ['Overproduction', 'Motion', 'Waiting', 'Conveyance'], answer: 0, why: 'Producing too much or too early creates inventory, conveyance, waiting and often correction.' },
]

/* ------------------------------------------------------------------ */
/* Lab                                                                 */
/* ------------------------------------------------------------------ */

export default function WasteLab({ embedded }: LabProps) {
  const [sceneId, setSceneId] = useState(SCENES[0].id)
  const [eight, setEight] = useState(false)
  const [answers, setAnswers] = useState<Record<string, Waste>>({})
  const [selected, setSelected] = useState<string | null>(null)
  const scene = SCENES.find(s => s.id === sceneId)!
  const spots = scene.spots.filter(s => eight || !s.talent)
  const status: Record<string, 'ok' | 'bad' | undefined> = {}
  for (const s of spots) if (answers[s.id]) status[s.id] = answers[s.id] === s.answer ? 'ok' : 'bad'
  const answered = spots.filter(s => answers[s.id]).length
  const correct = spots.filter(s => answers[s.id] === s.answer).length
  const spot = spots.find(s => s.id === selected) ?? null

  const choose = (w: Waste) => {
    if (!spot || answers[spot.id]) return
    setAnswers(a => ({ ...a, [spot.id]: w }))
    if (w !== spot.answer) update(p => { p.mistakes.push({ at: Date.now(), tag: 'waste-confusion', lesson: '1.4.4' }) })
  }
  const goScene = (id: string) => { setSceneId(id); setSelected(null) }
  const nextUnanswered = () => {
    const n = spots.find(s => !answers[s.id])
    setSelected(n ? n.id : null)
  }

  const explore = (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented label="Scene" value={sceneId} onChange={goScene} options={SCENES.map(s => ({ value: s.id, label: s.name }))} size="sm" />
        <Segmented label="Waste vocabulary" value={eight ? 'eight' : 'seven'} onChange={v => { setEight(v === 'eight'); setSelected(null) }} options={[{ value: 'seven', label: 'Syllabus seven' }, { value: 'eight', label: 'Eight-waste model' }]} size="sm" />
      </div>
      <p className="text-sm text-ink-2">{scene.blurb} <span className="tabular font-semibold text-ink">{correct} of {spots.length} correct</span>{answered > correct && <span className="text-ink-3">, {answered - correct} to review</span>}.</p>
      <SceneView scene={scene} spots={spots} status={status} selected={selected} onPick={setSelected} label={`${scene.name}: ${spots.length} hotspots, ${answered} answered`} />

      <AnimatePresence mode="wait" initial={false}>
        {spot ? (
          <motion.div key={spot.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="space-y-3 rounded-2xl border border-line p-4">
            <div>
              <h3 className="font-display text-lg font-semibold text-ink">{spot.title}</h3>
              <p className="mt-1 text-[0.95rem] leading-relaxed text-ink-2">{spot.text}</p>
            </div>
            <Choices eight={eight} onChoose={choose} disabled={!!answers[spot.id]} picked={answers[spot.id] ?? null} answer={spot.answer} />
            {answers[spot.id] && <Reasoning spot={spot} chosen={answers[spot.id]} eight={eight} />}
            {answers[spot.id] && answered < spots.length && <button className="btn btn-soft btn-sm" onClick={nextUnanswered}>Next hotspot</button>}
          </motion.div>
        ) : (
          <motion.p key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="rounded-2xl border border-dashed border-line-2 p-4 text-sm text-ink-3">
            {answered === spots.length ? 'Scene complete. Try another scene, or switch vocabulary to compare the two models.' : 'Select a numbered hotspot in the scene to investigate it.'}
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {eight && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <div className="rounded-2xl border border-violet/40 bg-violet-soft/40 p-4">
              <h3 className="font-display text-base font-semibold text-ink">Eight-waste model (DOWNTIME), shown separately</h3>
              <p className="mt-1 text-sm text-ink-2">The syllabus detailed topic 1.4.4 names seven elements. The syllabus introduction and many organisations use eight, adding Non-Utilized Talent. Same ideas, different words. Answer exam questions with the vocabulary the question uses.</p>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[420px] text-sm">
                  <thead><tr className="text-left text-ink-3"><th className="py-1.5 pr-3 font-semibold">Seven elements (syllabus 1.4.4)</th><th className="py-1.5 pr-3 font-semibold">Eight wastes (DOWNTIME)</th></tr></thead>
                  <tbody>
                    {(['Correction', 'Overproduction', 'Waiting', 'Non-Utilized Talent', 'Conveyance', 'Inventory', 'Motion', 'Overprocessing'] as Waste[]).map(w => (
                      <tr key={w} className="border-t border-line">
                        <td className="py-1.5 pr-3 text-ink">{w === 'Non-Utilized Talent' ? <span className="text-ink-3">(no equivalent)</span> : w}</td>
                        <td className="py-1.5 pr-3 font-semibold text-ink">{EIGHT_NAME[w]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <details className="rounded-2xl border border-line p-4 text-sm">
        <summary className="cursor-pointer font-semibold text-ink">The seven definitions</summary>
        <dl className="mt-3 grid gap-2 sm:grid-cols-2">
          {SEVEN.map(w => <div key={w}><dt className="font-semibold text-ink">{w}</dt><dd className="text-ink-2">{DEF[w]}</dd></div>)}
        </dl>
      </details>
    </div>
  )

  return (
    <LabShell
      lab="waste"
      embedded={embedded}
      instructions="Pick a scene, then select each numbered hotspot and name the waste using the seven syllabus terms. Feedback explains the reasoning and the waste it is most often confused with. Switch to the eight-waste model to see the DOWNTIME vocabulary and an extra hotspot for Non-Utilized Talent."
      scenario="You are leading a two-hour waste walk across four operations: a fibre installation depot, a service desk, an invoice office and a hospital ward."
      explore={explore}
      challenge={<Challenge />}
      check={<KnowledgeCheck lab="waste" items={CHECK} />}
      onReset={() => { setAnswers({}); setSelected(null) }}
      onNewExample={() => { const others = SCENES.filter(s => s.id !== sceneId); goScene(others[Math.floor(Math.random() * others.length)].id) }}
    />
  )
}
