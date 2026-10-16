import { lazy, type ComponentType, type LazyExoticComponent } from 'react'
import type { LabKey, LessonId } from '../data/types'
import type { Tone } from '../data/curriculum'

export interface LabProps {
  /** Compact mode when embedded inside a lesson. */
  embedded?: boolean
}

export interface LabMeta {
  key: LabKey
  title: string
  blurb: string
  lesson: LessonId
  tone: Tone
  core: boolean // one of the 12 signature labs
  component: LazyExoticComponent<ComponentType<LabProps>>
}

export const LABS: LabMeta[] = [
  { key: 'yfx', title: 'Y = f(X) Explorer', blurb: 'Adjust input factors and watch an illustrative output respond.', lesson: '1.1.4', tone: 'violet', core: true, component: lazy(() => import('./YfxLab')) },
  { key: 'voice', title: 'VOC, VOB, VOE Classifier', blurb: 'Sort real feedback statements into the voice they belong to.', lesson: '1.1.5', tone: 'violet', core: true, component: lazy(() => import('./VoiceLab')) },
  { key: 'ctq', title: 'CTQ Tree Builder', blurb: 'Turn a vague customer statement into measurable requirements.', lesson: '1.2.2', tone: 'teal', core: true, component: lazy(() => import('./CtqLab')) },
  { key: 'pareto', title: 'Pareto Chart Laboratory', blurb: 'Build, sort and read a live Pareto chart from your own data.', lesson: '1.2.4', tone: 'teal', core: true, component: lazy(() => import('./ParetoLab')) },
  { key: 'copq', title: 'COPQ Classification Challenge', blurb: 'Classify costs into the four quality cost categories and total them.', lesson: '1.2.3', tone: 'teal', core: true, component: lazy(() => import('./CopqLab')) },
  { key: 'dpmo', title: 'DPU / DPMO Calculator', blurb: 'Units, opportunities and defects, animated from count to sigma level.', lesson: '1.2.5', tone: 'teal', core: true, component: lazy(() => import('./DpmoLab')) },
  { key: 'rty', title: 'FTY / RTY Process Simulation', blurb: 'Send units through a multi-step process and watch yield compound.', lesson: '1.2.5', tone: 'teal', core: true, component: lazy(() => import('./RtyLab')) },
  { key: 'cycle', title: 'Cycle Time Laboratory', blurb: 'Compare cycle time, lead time and takt time on a live ticket flow.', lesson: '1.2.5', tone: 'teal', core: true, component: lazy(() => import('./CycleLab')) },
  { key: 'charter', title: 'Project Charter Builder', blurb: 'Draft a charter, get rule-based feedback and print it.', lesson: '1.3.1', tone: 'coral', core: true, component: lazy(() => import('./CharterLab')) },
  { key: 'smart', title: 'SMART Goal Evaluator', blurb: 'Check a goal statement against each SMART criterion.', lesson: '1.3.1', tone: 'coral', core: true, component: lazy(() => import('./SmartLab')) },
  { key: 'waste', title: 'Lean Waste Detective', blurb: 'Spot the seven elements of waste in workplace scenes.', lesson: '1.4.4', tone: 'amber', core: true, component: lazy(() => import('./WasteLab')) },
  { key: 'fives', title: '5S Workplace Simulation', blurb: 'Bring order to a cluttered service desk, one S at a time.', lesson: '1.4.5', tone: 'amber', core: true, component: lazy(() => import('./FiveSLab')) },
  { key: 'history', title: 'Timeline Challenge', blurb: 'Place quality and Lean milestones in the right order.', lesson: '1.1.2', tone: 'violet', core: false, component: lazy(() => import('./HistoryLab')) },
  { key: 'dmaic', title: 'DMAIC Deliverable Sorter', blurb: 'Decide which phase each project activity belongs to.', lesson: '1.1.3', tone: 'violet', core: false, component: lazy(() => import('./DmaicLab')) },
  { key: 'roles', title: 'Role Matching Challenge', blurb: 'Match responsibilities to the right Six Sigma role.', lesson: '1.1.6', tone: 'violet', core: false, component: lazy(() => import('./RolesLab')) },
  { key: 'process', title: 'Process Boundary Builder', blurb: 'Assemble a high-level process from suppliers to customers.', lesson: '1.2.1', tone: 'teal', core: false, component: lazy(() => import('./ProcessLab')) },
  { key: 'metrics', title: 'Metric Matcher', blurb: 'Pick primary and secondary metrics for business problems.', lesson: '1.3.2', tone: 'coral', core: false, component: lazy(() => import('./MetricsLab')) },
  { key: 'finance', title: 'Benefits Calculator', blurb: 'ROI, payback and hard versus soft savings, step by step.', lesson: '1.3.3', tone: 'coral', core: false, component: lazy(() => import('./FinanceLab')) },
  { key: 'value', title: 'Value-Added Sorter', blurb: 'Classify process steps as value added, required or waste.', lesson: '1.4.1', tone: 'amber', core: false, component: lazy(() => import('./ValueLab')) },
  { key: 'lean-sigma', title: 'Waste or Variation?', blurb: 'Decide whether a problem calls for Lean, Six Sigma or both.', lesson: '1.4.3', tone: 'amber', core: false, component: lazy(() => import('./LeanSigmaLab')) },
]

export const labMeta = (k: LabKey) => LABS.find(l => l.key === k)
