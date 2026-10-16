import { addXp, touch, update, type CardState } from './store'

/** Leitner-style spaced repetition. Box intervals in days. */
const INTERVALS = [0, 1, 2, 4, 8, 16, 30]
const DAY = 86_400_000

export type Grade = 'again' | 'hard' | 'good' | 'easy'

export function schedule(prev: CardState | undefined, grade: Grade, now = Date.now()): CardState {
  const box = prev?.box ?? 0
  let nextBox = box
  if (grade === 'again') nextBox = 0
  else if (grade === 'hard') nextBox = Math.max(1, box)
  else if (grade === 'good') nextBox = Math.min(INTERVALS.length - 1, box + 1)
  else nextBox = Math.min(INTERVALS.length - 1, box + 2)
  const due = grade === 'again' ? now + 10 * 60 * 1000 : now + INTERVALS[nextBox] * DAY
  return { box: nextBox, due, reviews: (prev?.reviews ?? 0) + 1, known: prev?.known, practice: grade === 'again' ? true : prev?.practice }
}

export function gradeCard(id: string, grade: Grade) {
  update(p => {
    p.cards[id] = schedule(p.cards[id], grade)
    addXp(p, 1)
    p.session.cards += 1
    touch(p)
  })
}

export function setCardFlag(id: string, flag: 'known' | 'practice', value: boolean) {
  update(p => {
    const c = p.cards[id] ?? { box: 0, due: Date.now(), reviews: 0 }
    c[flag] = value
    if (flag === 'known' && value) { c.practice = false; c.box = Math.max(c.box, 3); c.due = Date.now() + INTERVALS[c.box] * DAY }
    if (flag === 'practice' && value) { c.known = false; c.due = Date.now() }
    p.cards[id] = c
  })
}

export function intervalLabel(c: CardState | undefined, grade: Grade): string {
  const n = schedule(c, grade)
  const d = Math.round((n.due - Date.now()) / DAY)
  if (grade === 'again') return '10 min'
  return d <= 0 ? 'today' : d === 1 ? '1 day' : `${d} days`
}
