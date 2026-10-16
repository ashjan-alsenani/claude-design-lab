import {
  ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, ChevronLeft, ChevronRight, Clock, FileText, Focus, Headphones,
  ListTree, Minus, Pause, Plus, RotateCcw, Square, Target, Type,
} from 'lucide-react'
import { motion, useScroll, useSpring } from 'motion/react'
import { Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { Blocks, Callout, InlineLab, RichTable } from '../components/Blocks'
import { FlipCard } from '../components/FlipCard'
import { QuestionCard } from '../components/QuestionCard'
import { plain, Rich } from '../components/Rich'
import { Disclosure, StatusBadge } from '../components/ui'
import { isLessonId, lessonMeta, loadLesson, moduleMeta, nextLesson, prevLesson, TONE } from '../data/curriculum'
import { getQuestion } from '../data/questions'
import { SOURCE_DOCS } from '../data/sources'
import type { Block, Lesson } from '../data/types'
import { Diagram } from '../diagrams/Diagram'
import { markLessonComplete, setSettings, update, useProfile } from '../lib/store'
import { NotFound } from './NotFound'
import { PageSkeleton } from '../components/Layout'

type TocItem = { id: string; label: string }

function blocksPlain(blocks: Block[]): string {
  return blocks.map(b => {
    if (b.kind === 'p' || b.kind === 'h') return plain(b.text)
    if (b.kind === 'list') return b.items.map(plain).join('. ')
    if (b.kind === 'callout') return `${b.title}. ${plain(b.text)}`
    return ''
  }).filter(Boolean).join(' ')
}

function useSpeech() {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window
  const [speaking, setSpeaking] = useState(false)
  const [paused, setPaused] = useState(false)
  const voiceURI = useProfile(p => p.settings.voiceURI)
  useEffect(() => () => { if (supported) window.speechSynthesis.cancel() }, [supported])
  const speak = (chunks: string[]) => {
    if (!supported) return
    window.speechSynthesis.cancel()
    const voices = window.speechSynthesis.getVoices()
    const voice = voices.find(v => v.voiceURI === voiceURI) ?? voices.find(v => v.lang.startsWith('en'))
    chunks.forEach((c, i) => {
      const u = new SpeechSynthesisUtterance(c)
      if (voice) u.voice = voice
      u.lang = voice?.lang ?? 'en-GB'
      u.rate = 1
      if (i === chunks.length - 1) u.onend = () => { setSpeaking(false); setPaused(false) }
      window.speechSynthesis.speak(u)
    })
    setSpeaking(true)
    setPaused(false)
  }
  const stop = () => { if (supported) window.speechSynthesis.cancel(); setSpeaking(false); setPaused(false) }
  const togglePause = () => {
    if (!supported) return
    if (paused) { window.speechSynthesis.resume(); setPaused(false) } else { window.speechSynthesis.pause(); setPaused(true) }
  }
  return { supported, speaking, paused, speak, stop, togglePause }
}

function SectionHeading({ id, children, icon }: { id: string; children: ReactNode; icon?: ReactNode }) {
  return (
    <h2 id={id} className="mb-5 mt-16 flex scroll-mt-24 items-center gap-3 font-display text-[1.65rem] font-bold leading-tight text-ink first:mt-0">
      {icon && <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-surface-2 text-violet [&>svg]:size-[18px]">{icon}</span>}
      {children}
    </h2>
  )
}

export default function LessonReader() {
  const { id } = useParams()
  const loc = useLocation()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [error, setError] = useState(false)
  const valid = isLessonId(id)

  useEffect(() => {
    if (!valid) return
    setLesson(null)
    loadLesson(id).then(setLesson).catch(() => setError(true))
    update(p => { p.lastLesson = id; p.reading[id] = { ...(p.reading[id] ?? { progress: 0 }), at: Date.now() } })
  }, [id, valid])

  if (!valid || error) return <NotFound />
  if (!lesson) return <PageSkeleton />
  return <Reader key={lesson.id} lesson={lesson} hash={loc.hash} />
}

function Reader({ lesson, hash }: { lesson: Lesson; hash: string }) {
  const meta = lessonMeta(lesson.id)
  const mod = moduleMeta(meta.module)
  const tone = TONE[mod.tone]
  const settings = useProfile(p => p.settings)
  const completed = useProfile(p => p.completed[lesson.id])
  const saved = useProfile(p => p.reading[lesson.id])
  const [focus, setFocus] = useState(false)
  const [tocOpen, setTocOpen] = useState(false)
  const [active, setActive] = useState('overview')
  const [resumeOffer] = useState(() => (saved?.anchor && saved.progress > 0.04 && saved.progress < 0.97 && !hash ? saved.anchor : null))
  const [cardIdx, setCardIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const articleRef = useRef<HTMLDivElement>(null)
  const speech = useSpeech()

  const { scrollYProgress } = useScroll({ target: articleRef, offset: ['start start', 'end end'] })
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 })

  const toc: TocItem[] = useMemo(() => [
    { id: 'objectives', label: 'Learning objectives' },
    { id: 'overview', label: 'Concept overview' },
    ...lesson.sections.map(s => ({ id: `sec-${s.id}`, label: s.title })),
    { id: 'why', label: 'Why this matters' },
    { id: 'example', label: 'Real business example' },
    { id: 'visual', label: 'Animated explanation' },
    { id: 'definitions', label: 'Important definitions' },
    ...(lesson.comparisons.length ? [{ id: 'compare', label: 'Comparisons' }] : []),
    { id: 'misconceptions', label: 'Common misconceptions' },
    { id: 'traps', label: 'Exam traps' },
    { id: 'worked', label: 'Worked examples' },
    { id: 'activity', label: 'Interactive activity' },
    { id: 'check', label: 'Check your understanding' },
    { id: 'takeaways', label: 'Key takeaways' },
    { id: 'flashcards', label: 'Flashcards' },
    { id: 'sources', label: 'Source references' },
    { id: 'next', label: 'Next lesson' },
  ], [lesson])

  // Focus reading mode hides the sidebar and table of contents.
  useEffect(() => {
    document.body.classList.toggle('focus-reading', focus)
    return () => document.body.classList.remove('focus-reading')
  }, [focus])

  // Scroll to a hash target once rendered.
  useEffect(() => {
    if (!hash) return
    const t = window.setTimeout(() => document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120)
    return () => window.clearTimeout(t)
  }, [hash])

  // Track active section and reading position.
  useEffect(() => {
    const ids = toc.map(t => t.id)
    const els = ids.map(i => document.getElementById(i)).filter(Boolean) as HTMLElement[]
    const io = new IntersectionObserver(entries => {
      const vis = entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
      if (vis[0]) setActive(vis[0].target.id)
    }, { rootMargin: '-80px 0px -65% 0px' })
    els.forEach(e => io.observe(e))
    let last = 0
    const onScroll = () => {
      const now = Date.now()
      if (now - last < 2500) return
      last = now
      const art = articleRef.current
      if (!art) return
      const r = art.getBoundingClientRect()
      const prog = Math.max(0, Math.min(1, -r.top / Math.max(1, r.height - window.innerHeight)))
      const anchors = Array.from(art.querySelectorAll<HTMLElement>('[id]'))
      const top = anchors.find(a => a.getBoundingClientRect().top > 60)
      update(p => {
        const prev = p.reading[lesson.id]
        p.reading[lesson.id] = { progress: Math.max(prog, prev?.progress ?? 0), anchor: top?.id ?? prev?.anchor, at: now }
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { io.disconnect(); window.removeEventListener('scroll', onScroll) }
  }, [toc, lesson.id])

  const readAloud = () => {
    if (speech.speaking) { speech.stop(); return }
    const startIdx = Math.max(0, lesson.sections.findIndex(s => `sec-${s.id}` === active))
    const fromOverview = active === 'overview' || active === 'objectives'
    const chunks: string[] = []
    if (fromOverview) chunks.push(`${lesson.title}. ${lesson.overview.map(plain).join(' ')}`)
    for (const s of lesson.sections.slice(fromOverview ? 0 : startIdx)) chunks.push(`${s.title}. ${blocksPlain(s.blocks)}`)
    speech.speak(chunks)
  }

  const nxt = nextLesson(lesson.id)
  const prv = prevLesson(lesson.id)
  const card = lesson.flashcards[cardIdx]
  const words = useMemo(() => {
    const t = [...lesson.overview, ...lesson.sections.map(s => blocksPlain(s.blocks))].join(' ')
    return plain(t).split(/\s+/).length
  }, [lesson])

  return (
    <div className="relative">
      <motion.div className="no-print fixed left-0 right-0 top-0 z-[60] h-[3px] origin-left" style={{ scaleX: progress, background: tone.hex }} aria-hidden />

      {/* Header */}
      <header className="mb-8">
        <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-ink-3" aria-label="Breadcrumb">
          <Link to="/lessons" className="hover:text-ink">Lessons</Link><ChevronRight className="size-3.5" />
          <span>{mod.ref} {mod.title}</span>
        </nav>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-sm font-bold ${tone.soft} ${tone.text}`}>Lesson {lesson.id}</span>
          <StatusBadge status={lesson.status} />
          <span className="chip"><Clock className="size-3.5" /> {lesson.readingMinutes} min read</span>
          <span className="chip tabular">{words.toLocaleString()} words</span>
          {completed && <span className="chip border-good/40 bg-good-soft text-good"><Check className="size-3.5" /> Completed</span>}
        </div>
        <h1 className="mt-4 max-w-4xl text-[2.1rem] font-bold leading-[1.1] text-ink md:text-5xl">{lesson.title}</h1>
        <p className="mt-3 max-w-3xl text-lg leading-relaxed text-ink-2">{lesson.subtitle}</p>
        <div className="mt-5 max-w-3xl rounded-2xl border border-line bg-surface px-4 py-3 text-sm">
          <span className="font-semibold text-ink">Official syllabus reference </span>
          <span className="text-ink-2">{lesson.id} {lesson.officialTitle} (IASSC Green Belt Syllabus v1.0, Define Phase, topic {mod.ref} {mod.title})</span>
        </div>
      </header>

      {/* Reading toolbar */}
      <div className="no-print sticky top-14 z-30 -mx-4 mb-8 border-y border-line bg-bg/90 px-4 py-2 backdrop-blur-md lg:top-0 lg:mx-0 lg:rounded-2xl lg:border lg:px-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex items-center rounded-xl border border-line bg-surface" role="group" aria-label="Text size">
            <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setSettings({ fontScale: Math.max(0.85, +(settings.fontScale - 0.05).toFixed(2)) })} aria-label="Smaller text"><Minus className="size-4" /></button>
            <span className="tabular w-11 text-center text-xs font-semibold text-ink-2">{Math.round(settings.fontScale * 100)}%</span>
            <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setSettings({ fontScale: Math.min(1.35, +(settings.fontScale + 0.05).toFixed(2)) })} aria-label="Larger text"><Plus className="size-4" /></button>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => setSettings({ readingFont: settings.readingFont === 'serif' ? 'sans' : 'serif' })} aria-label="Switch reading font"><Type className="size-4" /> {settings.readingFont === 'serif' ? 'Serif' : 'Sans'}</button>
          <button className={`btn btn-sm ${focus ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFocus(f => !f)} aria-pressed={focus}><Focus className="size-4" /> Focus</button>
          {speech.supported ? (
            <>
              <button className={`btn btn-sm ${speech.speaking ? 'btn-soft' : 'btn-ghost'}`} onClick={readAloud} aria-pressed={speech.speaking}>
                {speech.speaking ? <><Square className="size-3.5" /> Stop</> : <><Headphones className="size-4" /> Listen</>}
              </button>
              {speech.speaking && <button className="btn btn-ghost btn-sm btn-icon" onClick={speech.togglePause} aria-label={speech.paused ? 'Resume reading' : 'Pause reading'}>{speech.paused ? <Headphones className="size-4" /> : <Pause className="size-4" />}</button>}
            </>
          ) : (
            <span className="px-2 text-xs text-ink-3">Read-aloud is not supported in this browser</span>
          )}
          <button className="btn btn-ghost btn-sm xl:hidden" onClick={() => setTocOpen(o => !o)} aria-expanded={tocOpen}><ListTree className="size-4" /> Contents</button>
          {resumeOffer && (
            <button className="btn btn-soft btn-sm ml-auto" onClick={() => document.getElementById(resumeOffer)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}><RotateCcw className="size-4" /> Resume where you left off</button>
          )}
        </div>
        {tocOpen && (
          <nav className="mt-2 grid max-h-[50vh] gap-0.5 overflow-y-auto pb-2 sm:grid-cols-2 xl:hidden" aria-label="Lesson contents">
            {toc.map(t => <a key={t.id} href={`#${t.id}`} onClick={() => setTocOpen(false)} className={`rounded-lg px-2 py-1.5 text-sm ${active === t.id ? 'bg-violet-soft font-semibold text-violet' : 'text-ink-2 hover:bg-surface-2'}`}>{t.label}</a>)}
          </nav>
        )}
      </div>

      <div className="flex gap-12">
        <div ref={articleRef} className={`min-w-0 flex-1 ${focus ? 'mx-auto max-w-[760px]' : ''}`}>
          <div className={`prose-reading ${settings.readingFont === 'sans' ? 'sans' : ''} ${focus ? 'mx-auto' : ''}`}>
            {/* Objectives */}
            <section id="objectives" className="scroll-mt-24 rounded-3xl border border-line bg-surface p-5 font-sans shadow-sm sm:p-6">
              <div className="flex items-center gap-2 font-display text-lg font-semibold text-ink"><Target className={`size-5 ${tone.text}`} /> By the end of this lesson you will be able to</div>
              <ul className="mt-3 space-y-2 pl-0">
                {lesson.objectives.map((o, i) => (
                  <li key={i} className="flex list-none gap-3 pl-0 text-[0.98rem] leading-relaxed text-ink-2"><CheckCircle2 className={`mt-1 size-4 shrink-0 ${tone.text}`} /><span>{o}</span></li>
                ))}
              </ul>
            </section>

            <SectionHeading id="overview" icon={<BookOpen />}>Concept overview</SectionHeading>
            {lesson.overview.map((t, i) => <p key={i} className={i === 0 ? 'text-[1.12em] leading-[1.7] text-ink' : ''}><Rich text={t} /></p>)}

            {lesson.sections.map(s => (
              <section key={s.id}>
                <SectionHeading id={`sec-${s.id}`}>{s.title}</SectionHeading>
                <Blocks blocks={s.blocks} anchorBase={`p-${s.id}`} lesson={lesson.id} />
              </section>
            ))}

            <SectionHeading id="why">Why this matters</SectionHeading>
            {lesson.whyItMatters.map((t, i) => <p key={i}><Rich text={t} /></p>)}

            <SectionHeading id="example">Real business example</SectionHeading>
            <div className="rounded-3xl border border-line bg-surface p-5 sm:p-7">
              <div className="mb-1 font-sans text-xs font-semibold text-ink-3">{lesson.businessExample.industry}</div>
              <div className="mb-3 font-display text-xl font-semibold text-ink">{lesson.businessExample.title}</div>
              <Blocks blocks={lesson.businessExample.blocks} />
            </div>
          </div>

          <div id="visual" className="my-14 scroll-mt-24">
            <h2 className="mb-5 font-display text-[1.65rem] font-bold text-ink">Animated explanation</h2>
            <Diagram k={lesson.visual.diagram} title={lesson.visual.title} caption={lesson.visual.caption} />
          </div>

          <div className={`prose-reading ${settings.readingFont === 'sans' ? 'sans' : ''}`}>
            <SectionHeading id="definitions">Important definitions</SectionHeading>
            <dl className="grid gap-3 font-sans">
              {lesson.definitions.map((d, i) => (
                <div key={i} className="rounded-2xl border border-line bg-surface px-4 py-3">
                  <dt className="font-display font-semibold text-ink">{d.term}</dt>
                  <dd className="mt-1 text-[0.97rem] leading-relaxed text-ink-2"><Rich text={d.definition} /></dd>
                </div>
              ))}
            </dl>
          </div>

          {lesson.comparisons.length > 0 && (
            <div id="compare" className="mt-16 scroll-mt-24">
              <h2 className="mb-5 font-display text-[1.65rem] font-bold text-ink">Comparison with similar concepts</h2>
              {lesson.comparisons.map((c, i) => (
                <div key={i} className="mb-6">
                  <div className="mb-2 font-display text-lg font-semibold text-ink">{c.title}</div>
                  <RichTable head={c.head} rows={c.rows} />
                </div>
              ))}
            </div>
          )}

          <div className={`prose-reading ${settings.readingFont === 'sans' ? 'sans' : ''}`}>
            <SectionHeading id="misconceptions">Common misconceptions</SectionHeading>
            <div className="grid gap-3 font-sans">
              {lesson.misconceptions.map((m, i) => (
                <div key={i} className="grid overflow-hidden rounded-2xl border border-line bg-surface md:grid-cols-2">
                  <div className="bg-bad-soft/60 p-4"><div className="text-xs font-semibold text-bad">Misconception</div><p className="mt-1 text-[0.96rem] leading-relaxed text-ink"><Rich text={m.myth} /></p></div>
                  <div className="p-4"><div className="text-xs font-semibold text-good">What is actually true</div><p className="mt-1 text-[0.96rem] leading-relaxed text-ink-2"><Rich text={m.reality} /></p></div>
                </div>
              ))}
            </div>

            <SectionHeading id="traps">Exam traps</SectionHeading>
            {lesson.examTraps.map((t, i) => <Callout key={i} tone="trap" title={t.title}><Rich text={t.text} /></Callout>)}
            <p className="font-sans text-sm"><Link to="/traps" className="font-semibold text-violet hover:underline">Train trap wording in the Exam Trap Detector</Link></p>

            <SectionHeading id="worked">Worked examples</SectionHeading>
            <div className="space-y-4 font-sans">
              {lesson.workedExamples.map((w, i) => <WorkedExample key={i} w={w} n={i + 1} />)}
            </div>
          </div>

          <div id="activity" className="mt-16 scroll-mt-24">
            <h2 className="mb-2 font-display text-[1.65rem] font-bold text-ink">Interactive activity</h2>
            <Suspense fallback={<div className="h-64 animate-pulse rounded-3xl bg-surface-3" />}>
              <InlineLab lab={lesson.activity.lab} prompt={lesson.activity.prompt} />
            </Suspense>
          </div>

          <div id="check" className="mt-16 scroll-mt-24">
            <h2 className="mb-2 font-display text-[1.65rem] font-bold text-ink">Check your understanding</h2>
            <p className="mb-5 text-ink-2">Answer each question. You get the full explanation immediately, and your answers feed your mastery estimate.</p>
            <div className="space-y-4">
              {lesson.checkQuestionIds.map(qid => getQuestion(qid)).filter(Boolean).map((q, i) => <QuestionCard key={q!.id} q={q!} index={i} />)}
            </div>
            <Link to={`/practice?lesson=${lesson.id}`} className="btn btn-soft mt-4">More questions on this lesson <ArrowRight className="size-4" /></Link>
          </div>

          <div className={`prose-reading ${settings.readingFont === 'sans' ? 'sans' : ''}`}>
            <SectionHeading id="takeaways">Key takeaways</SectionHeading>
            <ol className="space-y-1">{lesson.takeaways.map((t, i) => <li key={i}><Rich text={t} /></li>)}</ol>
          </div>

          <div id="flashcards" className="mt-16 scroll-mt-24">
            <h2 className="mb-5 font-display text-[1.65rem] font-bold text-ink">Flashcards</h2>
            {card && (
              <div className="mx-auto max-w-xl">
                <FlipCard front={card.front} back={<Rich text={card.back} />} flipped={flipped} onFlip={() => setFlipped(f => !f)} label={`Card ${cardIdx + 1} of ${lesson.flashcards.length}`} />
                <div className="mt-4 flex items-center justify-between">
                  <button className="btn btn-soft btn-sm" disabled={cardIdx === 0} onClick={() => { setFlipped(false); setCardIdx(i => i - 1) }}><ChevronLeft className="size-4" /> Previous</button>
                  <Link to={`/flashcards?lesson=${lesson.id}`} className="text-sm font-semibold text-violet hover:underline">Study with spaced repetition</Link>
                  <button className="btn btn-soft btn-sm" disabled={cardIdx === lesson.flashcards.length - 1} onClick={() => { setFlipped(false); setCardIdx(i => i + 1) }}>Next <ChevronRight className="size-4" /></button>
                </div>
              </div>
            )}
          </div>

          <div id="sources" className="mt-16 scroll-mt-24">
            <Disclosure title="Source references" icon={<FileText className="size-4" />}>
              <p className="mb-3 text-sm leading-relaxed text-ink-2">
                {lesson.status === 'supplementary'
                  ? 'This lesson is supplementary educational content: the supplied sources do not cover this topic beyond its syllabus listing.'
                  : lesson.status === 'partial-source'
                    ? 'Parts of this lesson are supported by the supplied sources below. Everything else is supplementary educational content written for this academy and is not a statement from the syllabus or the book.'
                    : 'The core facts in this lesson are supported by the supplied sources below. Examples and explanations are original.'}
                {' '}The Define chapter of the training book (book pages 1-97) was not supplied.
              </p>
              <ul className="space-y-2">
                {lesson.sources.map((s, i) => {
                  const doc = SOURCE_DOCS.find(d => d.id === s.source)
                  return (
                    <li key={i} className="rounded-xl bg-surface-2 px-3 py-2.5 text-sm">
                      <div className="font-semibold text-ink">{doc?.title ?? s.source}</div>
                      {(s.pdfPages?.length || s.printedPages?.length) ? (
                        <div className="tabular text-ink-3">
                          {s.pdfPages?.length ? `PDF page${s.pdfPages.length > 1 ? 's' : ''} ${s.pdfPages.join(', ')}` : ''}
                          {s.printedPages?.length ? ` · printed page${s.printedPages.length > 1 ? 's' : ''} ${s.printedPages.join(', ')}` : ''}
                        </div>
                      ) : null}
                      <div className="mt-0.5 leading-relaxed text-ink-2">{s.note}</div>
                      {s.source !== 'supplementary' && s.pdfPages?.length ? (
                        <Link className="mt-1 inline-block text-xs font-semibold text-violet hover:underline" to={`/library?source=${s.source}&page=${s.pdfPages[0]}`}>Open in Reference Library</Link>
                      ) : null}
                    </li>
                  )
                })}
              </ul>
            </Disclosure>
          </div>

          <div id="next" className="mt-12 scroll-mt-24 rounded-3xl border border-line bg-surface p-6 shadow-sm">
            {completed ? (
              <p className="flex items-center gap-2 font-semibold text-good"><CheckCircle2 className="size-5" /> You completed this lesson.</p>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-display text-lg font-semibold text-ink">Finished reading and practising?</div>
                  <p className="text-sm text-ink-2">Mark the lesson complete when you can explain it in your own words. It adds 50 XP.</p>
                </div>
                <button className="btn btn-primary" onClick={() => markLessonComplete(lesson.id)}><Check className="size-4" /> Mark lesson complete</button>
              </div>
            )}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {prv ? <Link to={`/lessons/${prv.id}`} className="group rounded-2xl border border-line p-4 hover:border-line-2 hover:bg-surface-2"><div className="flex items-center gap-1 text-xs font-semibold text-ink-3"><ArrowLeft className="size-3.5" /> Previous</div><div className="mt-1 font-semibold text-ink">{prv.id} {prv.short}</div></Link> : <span />}
              {nxt ? <Link to={`/lessons/${nxt.id}`} className="group rounded-2xl border border-line p-4 text-right hover:border-line-2 hover:bg-surface-2"><div className="flex items-center justify-end gap-1 text-xs font-semibold text-ink-3">Next lesson <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" /></div><div className="mt-1 font-semibold text-ink">{nxt.id} {nxt.short}</div></Link>
                : <Link to="/mock" className="rounded-2xl border border-line p-4 text-right hover:bg-surface-2"><div className="text-xs font-semibold text-ink-3">You reached the end of Define</div><div className="mt-1 font-semibold text-ink">Take the Define mock exam</div></Link>}
            </div>
          </div>
        </div>

        {/* Sticky table of contents */}
        {!focus && (
          <aside className="no-print hidden w-60 shrink-0 xl:block">
            <nav className="sticky top-24 max-h-[calc(100dvh-8rem)] overflow-y-auto pr-1" aria-label="Lesson contents">
              <div className="mb-2 text-xs font-semibold text-ink-3">On this page</div>
              <ul className="space-y-0.5 border-l border-line">
                {toc.map(t => (
                  <li key={t.id}>
                    <a href={`#${t.id}`} className={`-ml-px block border-l-2 py-1 pl-3 text-[13px] leading-snug transition-colors ${active === t.id ? `${tone.border} font-semibold text-ink` : 'border-transparent text-ink-3 hover:text-ink'}`}>{t.label}</a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        )}
      </div>
    </div>
  )
}

function WorkedExample({ w, n }: { w: Lesson['workedExamples'][number]; n: number }) {
  const [shown, setShown] = useState(0)
  const all = shown >= w.steps.length
  return (
    <div className="rounded-3xl border border-line bg-surface p-5 sm:p-6">
      <div className="text-xs font-semibold text-ink-3">Worked example {n}</div>
      <div className="mt-1 font-display text-lg font-semibold text-ink">{w.title}</div>
      <p className="mt-2 text-[0.98rem] leading-relaxed text-ink-2"><Rich text={w.scenario} /></p>
      <ol className="mt-4 space-y-2">
        {w.steps.slice(0, shown).map((s, i) => (
          <motion.li key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 rounded-xl bg-surface-2 px-3 py-2.5 text-[0.96rem] leading-relaxed text-ink">
            <span className="tabular grid size-6 shrink-0 place-items-center rounded-md bg-violet-soft text-xs font-bold text-violet">{i + 1}</span>
            <span><Rich text={s} /></span>
          </motion.li>
        ))}
      </ol>
      {all && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="mt-3 rounded-xl border border-good/40 bg-good-soft px-4 py-3 text-[0.98rem] font-medium text-ink">
          <span className="font-semibold text-good">Answer: </span><Rich text={w.answer} />
        </motion.div>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        {!all && <button className="btn btn-primary btn-sm" onClick={() => setShown(s => s + 1)}>{shown === 0 ? 'Start the solution' : 'Show next step'}</button>}
        {!all && <button className="btn btn-ghost btn-sm" onClick={() => setShown(w.steps.length)}>Show full solution</button>}
        {shown > 0 && <button className="btn btn-ghost btn-sm" onClick={() => setShown(0)}><RotateCcw className="size-4" /> Hide steps</button>}
      </div>
    </div>
  )
}
