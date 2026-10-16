import { Map } from 'lucide-react'
import { JourneyMap } from '../components/JourneyMap'
import { PageHeader } from '../components/ui'
import { LESSONS } from '../data/curriculum'
import { useProfile } from '../lib/store'

export default function Journey() {
  const done = useProfile(p => LESSONS.filter(l => p.completed[l.id]).length)
  return (
    <div>
      <PageHeader icon={<Map className="size-5" />} title="Learning Journey" lead={`The four official Define Phase modules from the IASSC Green Belt syllabus, in order. ${done} of ${LESSONS.length} lessons completed. Filled circles are complete, the pulsing circle is your next lesson, and percentages show your mastery estimate where there is evidence.`} />
      <div className="mb-6 rounded-2xl border border-line bg-surface p-4 text-sm leading-relaxed text-ink-2">
        <span className="font-semibold text-ink">Recommended sequence for each lesson: </span>
        read, understand, visualise the animated explanation, interact with the lab, practise the questions, review feedback, revise with flashcards, then mark the lesson complete.
      </div>
      <JourneyMap />
    </div>
  )
}
