import type { ContentStatus, LessonId, SourceId } from './types'

export interface SourceDoc {
  id: SourceId
  title: string
  publisher: string
  file: string
  pdfPages: string
  printedPages: string
  role: string
  defineContent: string
  /** Page count of the supplied PDF, used to recognise the file when the learner loads their own copy. */
  pageCount?: number
}

/**
 * Documents supplied while the academy was being built. The PDFs themselves are
 * copyrighted and are not redistributed with the app; learners can load their own
 * copies in the Reference Library to open referenced pages.
 */
export const SOURCE_DOCS: SourceDoc[] = [
  {
    id: 'syllabus',
    title: 'IASSC Certified Green Belt (ICGB) Syllabus, Version 1.0, June 2021',
    publisher: 'PeopleCert International Ltd.',
    file: 'LSSPeopleCertGBSyllabusENv11.pdf',
    pdfPages: '1-12',
    printedPages: '1-12',
    role: 'Authoritative source for topic names, Define Phase scope, examination format and test specification.',
    defineContent: 'Detailed syllabus table on page 7 lists all 19 Define topics (1.1.1 to 1.4.5). Exam format on page 6. Test specification (Define = 19%) on page 9. Introduction on page 3 names the eight wastes.',
    pageCount: 12,
  },
  {
    id: 'gb-101-200',
    title: 'Lean Six Sigma Green Belt eBook v11.1 MT, PDF pages 101-200',
    publisher: 'Open Source Six Sigma, LLC',
    file: '101-200_2_compressed.pdf',
    pdfPages: '1-100 of this part (book pages 101-200)',
    printedPages: '98-197',
    role: 'Measure Phase: Process Discovery (process maps, SIPOC, VA/NVA, X-Y matrix, FMEA) and Six Sigma Statistics.',
    defineContent: 'Supports 1.1.4 (Y = f(X), controllable vs noise inputs), 1.2.1 (process maps, inputs and outputs), 1.2.2 (customer requirements, RUMBA), 1.2.5 (RTY multiplied across steps in a value stream map) and 1.4.1 (value-added test).',
    pageCount: 100,
  },
  {
    id: 'gb-201-300',
    title: 'Lean Six Sigma Green Belt eBook v11.1 MT, PDF pages 201-300',
    publisher: 'Open Source Six Sigma, LLC',
    file: '201-300.pdf',
    pdfPages: 'book pages 201-300',
    printedPages: '198-297',
    role: 'Measure Phase: MSA, Process Capability, Measure wrap-up; start of Analyze.',
    defineContent: 'Supports 1.1.1 (sigma level vs DPMO table with the 1.5 sigma shift), 1.2.5 (DPU definition in attribute capability) and 1.1.3 (DMAIC roadmap).',
    pageCount: 100,
  },
  {
    id: 'gb-301-400',
    title: 'Lean Six Sigma Green Belt eBook v11.1 MT, PDF pages 301-400',
    publisher: 'Open Source Six Sigma, LLC',
    file: '301-400.pdf',
    pdfPages: 'book pages 301-400',
    printedPages: '298-397',
    role: 'Analyze Phase: hypothesis testing with normal and non-normal data.',
    defineContent: 'No Define Phase content identified.',
    pageCount: 100,
  },
  {
    id: 'gb-401-500',
    title: 'Lean Six Sigma Green Belt eBook v11.1 MT, PDF pages 401-500',
    publisher: 'Open Source Six Sigma, LLC',
    file: '401-500.pdf',
    pdfPages: 'book pages 401-500',
    printedPages: '398-497',
    role: 'Analyze wrap-up, Improve Phase (regression, DOE).',
    defineContent: 'No Define Phase content identified.',
    pageCount: 100,
  },
  {
    id: 'gb-501-600',
    title: 'Lean Six Sigma Green Belt eBook v11.1 MT, PDF pages 501-600',
    publisher: 'Open Source Six Sigma, LLC',
    file: '501-600.pdf',
    pdfPages: 'book pages 501-600',
    printedPages: '498-584 plus appendix',
    role: 'Control Phase (Lean Controls, SPC, Control Plans), Glossary, quiz answer keys.',
    defineContent: 'Supports 1.4.4 (the seven elements of muda, PDF p.505), 1.4.5 (5S with Japanese terms and English labels, PDF pp.506-511), 1.3.3 (cost of improvements and verified financial impact), and many Define definitions in the Glossary (PDF pp.587-593).',
    pageCount: 100,
  },
  {
    id: 'supplementary',
    title: 'SigmaVerse supplementary educational content',
    publisher: 'Written for this academy',
    file: '',
    pdfPages: '',
    printedPages: '',
    role: 'Original explanations based on established Lean Six Sigma principles, written where the supplied sources do not cover a topic.',
    defineContent: 'Used wherever a lesson is marked Supplementary or Partial source.',
  },
]

export const MISSING_SOURCE_NOTE =
  'The Define Phase chapter of the training book (book pages 1-97, which would be PDF pages 1-100) was not among the supplied files. The available parts start at book page 98 in the Measure Phase. Define lessons therefore rely on the official syllabus for scope, on Define-related passages found elsewhere in the supplied book parts, and on clearly labelled supplementary explanations.'

export interface CoverageRow {
  lesson: LessonId
  topic: string
  sources: string
  pages: string
  concepts: string
  definitions: string
  numerical: string
  figures: string
  status: ContentStatus
  statusNote: string
}

export const COVERAGE: CoverageRow[] = [
  { lesson: '1.1.1', topic: 'Meanings of Six Sigma', sources: 'Syllabus; GB 201-300; GB 501-600 Glossary', pages: 'Syllabus p.7; PDF 226 (sigma table); PDF 591-592 (Sigma Score, Six Sigma System)', concepts: 'Data-driven improvement, variation, sigma level, 3.4 DPMO, 1.5 sigma shift', definitions: 'Six Sigma, sigma level, defect, variation', numerical: 'Reading sigma level vs DPMO', figures: 'Normal curve with specification limits', status: 'partial-source', statusNote: 'Sigma table and glossary only; meanings of Six Sigma written as supplementary content.' },
  { lesson: '1.1.2', topic: 'General History of Six Sigma & Continuous Improvement', sources: 'Syllabus intro', pages: 'Syllabus p.3 (Motorola origin)', concepts: 'Motorola, GE, quality pioneers, Lean Six Sigma', definitions: 'Continuous improvement', numerical: 'None', figures: 'Timeline', status: 'supplementary', statusNote: 'Only one sentence in the syllabus. History written as supplementary content.' },
  { lesson: '1.1.3', topic: 'Deliverables of a Lean Six Sigma Project', sources: 'GB 201-300; GB 501-600', pages: 'PDF 233 and 580 (DMAIC roadmap); PDF 234 (planning for action); PDF 581 (control checklist)', concepts: 'DMAIC phase outputs, Define deliverables', definitions: 'DMAIC, deliverable, tollgate', numerical: 'None', figures: 'DMAIC roadmap', status: 'partial-source', statusNote: 'Roadmap pages support the phase outputs; Define deliverables detail is supplementary.' },
  { lesson: '1.1.4', topic: 'The Problem Solving Strategy Y = f(x)', sources: 'GB 101-200; Glossary', pages: 'PDF 103, 114, 116-117, 119-120; PDF 588 (Critical X), 593 (X, Y)', concepts: 'Inputs and outputs, controllable vs noise inputs, critical X', definitions: 'Y, X, Critical X, noise input', numerical: 'None', figures: 'Input-process-output', status: 'partial-source', statusNote: 'Measure-phase passages support the concept; Define framing is supplementary.' },
  { lesson: '1.1.5', topic: 'Voice of the Customer, Business and Employee', sources: 'Glossary; GB 101-200', pages: 'PDF 593 (VOB, VOC, VOP); PDF 115 (customer requirements, RUMBA); PDF 512 (steps to develop CTQs)', concepts: 'VOC, VOB, VOE, internal and external customers', definitions: 'VOC, VOB, VOP, customer', numerical: 'None', figures: 'Three voices', status: 'partial-source', statusNote: 'VOE is not defined in the supplied pages; written as supplementary content.' },
  { lesson: '1.1.6', topic: 'Six Sigma Roles & Responsibilities', sources: 'Glossary', pages: 'PDF 587 (Black Belt, Champion), 588 (Finance Representative), 589 (Green Belt, MBB), 591 (Process Owner), 593 (Yellow Belt)', concepts: 'Belt hierarchy, Champion, Process Owner', definitions: 'All roles', numerical: 'None', figures: 'Org chart', status: 'partial-source', statusNote: 'Glossary definitions; Executive Sponsor and team dynamics supplementary.' },
  { lesson: '1.2.1', topic: 'Defining a Process', sources: 'Glossary; GB 101-200', pages: 'PDF 590 (Process); PDF 589 (IPO diagram); PDF 103-108 (process mapping levels and types, SIPOC)', concepts: 'Inputs, activities, outputs, boundaries, ownership', definitions: 'Process, input, output, supplier, customer', numerical: 'None', figures: 'IPO and high-level map', status: 'partial-source', statusNote: 'SIPOC and detailed mapping are Measure-phase material (syllabus 2.1.2).' },
  { lesson: '1.2.2', topic: "Critical to Quality Characteristics (CTQ's)", sources: 'Glossary; GB 101-200; GB 501-600', pages: 'PDF 588 (CTQ), 591 (Significant Y, RUMBA); PDF 115 (requirements form, LSL/target/USL); PDF 512 (CTQ steps)', concepts: 'CTQ tree, operational definitions, specifications', definitions: 'CTQ, specification limits, operational definition', numerical: 'None', figures: 'CTQ tree', status: 'partial-source', statusNote: 'CTQ tree method written as supplementary content.' },
  { lesson: '1.2.3', topic: 'Cost of Poor Quality (COPQ)', sources: 'Glossary', pages: 'PDF 587 (COPQ), 589 (Hidden Factory), 591 (Rework); PDF 595 (Define quiz key lists Internal Failure Costs)', concepts: 'Prevention, appraisal, internal and external failure', definitions: 'COPQ, hidden factory, rework', numerical: 'COPQ totals', figures: 'Iceberg', status: 'partial-source', statusNote: 'Cost categories explained as supplementary content.' },
  { lesson: '1.2.4', topic: 'Pareto Analysis (80:20 rule)', sources: 'Glossary', pages: 'PDF 590 (Pareto Chart, Pareto Principle)', concepts: 'Sorting, cumulative percentage, vital few', definitions: 'Pareto chart, Pareto principle', numerical: 'Cumulative percentages', figures: 'Pareto chart', status: 'partial-source', statusNote: 'Construction and interpretation written as supplementary content.' },
  { lesson: '1.2.5', topic: 'Basic Six Sigma Metrics: DPU, DPMO, FTY, RTY, Cycle Time', sources: 'Glossary; GB 101-200; GB 201-300', pages: 'PDF 588 (Cycle Time, Defect, Defective, DPMO, DPU), 590 (Opportunities), 591 (RTY, Rework); PDF 108 (RTY = product of step yields); PDF 226 (DPMO vs sigma); PDF 228 (DPU)', concepts: 'Unit, defect, defective, opportunity, yields', definitions: 'All metric terms', numerical: 'DPU, DPO, DPMO, FTY, RTY, cycle time', figures: 'Metric flow, RTY pipeline', status: 'partial-source', statusNote: 'Definitions and RTY multiplication are source-supported; worked derivations are supplementary.' },
  { lesson: '1.3.1', topic: 'Building a Business Case & Project Charter', sources: 'Glossary; GB 101-200', pages: 'PDF 590 (Problem Statement, Objective Statement), 592 (Six Sigma Project); PDF 118 (narrowing scope from the problem statement)', concepts: 'Business case, charter elements, SMART goals, scope', definitions: 'Problem statement, goal statement, scope', numerical: 'None', figures: 'Charter anatomy', status: 'partial-source', statusNote: 'Charter structure written as supplementary content.' },
  { lesson: '1.3.2', topic: 'Developing Project Metrics', sources: 'GB 101-200; GB 201-300; Glossary', pages: 'PDF 123 (primary and secondary metrics); PDF 234 (primary/secondary metric questions); PDF 590 (Metric); PDF 587 (Breakthrough Improvement)', concepts: 'Primary, secondary, baseline, entitlement', definitions: 'Metric, baseline, entitlement', numerical: 'Percentage improvement', figures: 'Metric ladder', status: 'partial-source', statusNote: 'Leading and lagging indicators are supplementary.' },
  { lesson: '1.3.3', topic: 'Financial Evaluation & Benefits Capture', sources: 'GB 501-600; Glossary', pages: 'PDF 561 (cost considerations), 567 (verified financial impact), 580-581 (roadmap, finance sign-off); PDF 588 (Finance Representative, hard and soft savings)', concepts: 'Hard vs soft savings, cost avoidance, verification', definitions: 'Hard savings, soft savings, ROI, payback', numerical: 'ROI, payback, % improvement (supplementary formulas)', figures: 'Benefits pipeline', status: 'partial-source', statusNote: 'ROI and payback formulas are supplementary; not present in the supplied pages.' },
  { lesson: '1.4.1', topic: 'Understanding Lean', sources: 'Glossary; GB 101-200', pages: 'PDF 590 (Non-Value Added), 593 (Waste); PDF 120 (two VA questions)', concepts: 'Value, VA/NVA, flow, pull', definitions: 'Value added, waste', numerical: 'None', figures: 'Lean flow', status: 'partial-source', statusNote: 'Lean principles written as supplementary content.' },
  { lesson: '1.4.2', topic: 'The History of Lean', sources: 'None in supplied files', pages: 'n/a', concepts: 'Ford, Toyota Production System, Ohno, Lean Thinking', definitions: 'TPS, JIT, Jidoka', numerical: 'None', figures: 'Lean timeline', status: 'supplementary', statusNote: 'Entirely supplementary content.' },
  { lesson: '1.4.3', topic: 'Lean & Six Sigma', sources: 'Syllabus; GB 501-600', pages: 'Syllabus p.3; PDF 505 (vision of Lean supporting Six Sigma)', concepts: 'Waste vs variation, complementary use', definitions: 'Lean Six Sigma', numerical: 'None', figures: 'Comparison', status: 'partial-source', statusNote: 'Comparison detail is supplementary.' },
  { lesson: '1.4.4', topic: 'The Seven Elements of Waste', sources: 'Syllabus; GB 501-600', pages: 'Syllabus p.7 (seven wastes) and p.3 (eight wastes); PDF 505 (7 elements of muda)', concepts: 'Seven syllabus wastes, eight-waste model', definitions: 'Each waste', numerical: 'None', figures: 'Waste gallery', status: 'source-supported', statusNote: 'Names and lists are source-supported; examples are original.' },
  { lesson: '1.4.5', topic: '5S', sources: 'Syllabus; GB 501-600', pages: 'Syllabus p.7; PDF 506-511 (5S definitions, translation table, sorting method, ABC storage)', concepts: 'Sort, Straighten, Shine, Standardize, Self-Discipline', definitions: 'Each S with Japanese term', numerical: 'None', figures: '5S workplace', status: 'source-supported', statusNote: 'Well supported by the Lean Controls chapter.' },
]
