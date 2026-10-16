import { Compass } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Empty } from '../components/ui'

export function NotFound() {
  return (
    <div className="py-16">
      <Empty icon={<Compass className="size-6" />} title="This page is not part of the academy" action={<Link to="/" className="btn btn-primary">Back to the dashboard</Link>}>
        The link may be mistyped, or the page may have moved. Everything in SigmaVerse is reachable from the sidebar or with search (Ctrl K).
      </Empty>
    </div>
  )
}
