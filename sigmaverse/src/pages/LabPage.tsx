import { ArrowLeft, BookOpen } from 'lucide-react'
import { Suspense } from 'react'
import { Link, useParams } from 'react-router-dom'
import { lessonMeta } from '../data/curriculum'
import type { LabKey } from '../data/types'
import { labMeta } from '../labs/registry'
import { NotFound } from './NotFound'

export default function LabPage() {
  const { key } = useParams()
  const meta = labMeta(key as LabKey)
  if (!meta) return <NotFound />
  const C = meta.component
  return (
    <div>
      <Link to="/labs" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-ink-3 hover:text-ink"><ArrowLeft className="size-4" /> All labs</Link>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink md:text-4xl">{meta.title}</h1>
          <p className="mt-2 max-w-2xl text-lg leading-relaxed text-ink-2">{meta.blurb}</p>
        </div>
        <Link to={`/lessons/${meta.lesson}`} className="btn btn-soft"><BookOpen className="size-4" /> Lesson {meta.lesson}: {lessonMeta(meta.lesson).short}</Link>
      </div>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-surface-3" />}>
        <C />
      </Suspense>
    </div>
  )
}
