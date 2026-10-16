import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { QuestionCard } from '../components/QuestionCard'
import { getQuestion } from '../data/questions'
import { NotFound } from './NotFound'

export default function QuestionPage() {
  const { id } = useParams()
  const q = getQuestion(id ?? '')
  if (!q) return <NotFound />
  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/practice" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-ink-3 hover:text-ink"><ArrowLeft className="size-4" /> Practice Arena</Link>
      <QuestionCard key={q.id} q={q} />
    </div>
  )
}
