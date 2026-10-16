import { useSyncExternalStore } from 'react'
import type { Difficulty, LabKey, LessonId, MistakeTag } from '../data/types'
import type { FormulaId } from './problems'

export type MotionPref = 'system' | 'full' | 'reduced'
export type ThemePref = 'system' | 'light' | 'dark'

export interface Settings {
  fontScale: number // 0.9 - 1.3
  readingFont: 'serif' | 'sans'
  motion: MotionPref
  speed: number // animation speed multiplier
  theme: ThemePref
  mockMinutes: number
  dailyGoalMinutes: number
  voiceURI?: string
  sidebarCollapsed: boolean
}

export interface QuizAttempt {
  id: string
  at: number
  mode: string
  questionIds: string[]
  answers: (number | null)[]
  correct: number
  total: number
  durationSec: number
  flagged?: string[]
}

export interface MistakeRecord {
  at: number
  tag: MistakeTag
  lesson?: LessonId
  questionId?: string
  formula?: FormulaId
}

export interface CardState { box: number; due: number; reviews: number; known?: boolean; practice?: boolean }

export interface Note { id: string; lesson?: LessonId; anchor?: string; quote?: string; text: string; at: number; updatedAt: number }
export interface Bookmark { id: string; kind: 'paragraph' | 'question'; lesson?: LessonId; ref: string; label: string; at: number }

export interface Profile {
  version: 1
  createdAt: number
  completed: Partial<Record<LessonId, number>>
  reading: Partial<Record<LessonId, { progress: number; anchor?: string; at: number }>>
  lastLesson?: LessonId
  attempts: QuizAttempt[]
  qstats: Record<string, { seen: number; correct: number; lastAt: number; lastCorrect: boolean }>
  mistakes: MistakeRecord[]
  formulas: Partial<Record<FormulaId, { attempts: number; correct: number; streak: number; best?: Difficulty }>>
  cards: Record<string, CardState>
  notes: Note[]
  bookmarks: Bookmark[]
  labs: Partial<Record<LabKey, { at: number; challenge?: number }>>
  xp: number
  streak: { current: number; best: number; lastDay?: string }
  days: Record<string, number> // yyyy-mm-dd -> active minutes
  achievements: Record<string, number>
  session: { id: string; startedAt: number; lastAt: number; lessons: LessonId[]; answered: number; correct: number; xp: number; cards: number }
  settings: Settings
}

const KEY = 'sigmaverse.profile.v1'

export const DEFAULT_SETTINGS: Settings = {
  fontScale: 1,
  readingFont: 'serif',
  motion: 'system',
  speed: 1,
  theme: 'system',
  mockMinutes: 34,
  dailyGoalMinutes: 45,
  sidebarCollapsed: false,
}

function newSession(now = Date.now()): Profile['session'] {
  return { id: `s${now}`, startedAt: now, lastAt: now, lessons: [], answered: 0, correct: 0, xp: 0, cards: 0 }
}

export function emptyProfile(): Profile {
  const now = Date.now()
  return {
    version: 1, createdAt: now, completed: {}, reading: {}, attempts: [], qstats: {}, mistakes: [],
    formulas: {}, cards: {}, notes: [], bookmarks: [], labs: {}, xp: 0, streak: { current: 0, best: 0 },
    days: {}, achievements: {}, session: newSession(now), settings: { ...DEFAULT_SETTINGS },
  }
}

let storageOk = true
function load(): Profile {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return emptyProfile()
    const p = JSON.parse(raw) as Profile
    const base = emptyProfile()
    const merged: Profile = { ...base, ...p, settings: { ...DEFAULT_SETTINGS, ...p.settings } }
    // A session ends after 30 minutes of inactivity.
    if (Date.now() - merged.session.lastAt > 30 * 60 * 1000) merged.session = newSession()
    return merged
  } catch {
    storageOk = false
    return emptyProfile()
  }
}

let state: Profile = typeof window === 'undefined' ? emptyProfile() : load()
const listeners = new Set<() => void>()
let saveTimer: number | undefined

function persist() {
  if (typeof window === 'undefined') return
  window.clearTimeout(saveTimer)
  saveTimer = window.setTimeout(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
      storageOk = true
    } catch {
      storageOk = false
    }
    listeners.forEach(l => l())
  }, 250)
}

export function isStorageAvailable() { return storageOk }

export function getProfile() { return state }

export function update(fn: (draft: Profile) => void) {
  const draft: Profile = structuredClone(state)
  fn(draft)
  state = draft
  listeners.forEach(l => l())
  persist()
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function useProfile(): Profile
export function useProfile<T>(selector: (p: Profile) => T): T
export function useProfile<T>(selector?: (p: Profile) => T) {
  return useSyncExternalStore(subscribe, () => (selector ? selector(state) : state), () => (selector ? selector(state) : state))
}

/* ---------- activity helpers ---------- */

export function today(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function yesterday() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return today(d)
}

/** Records activity: streak, active minutes and session heartbeat. */
export function touch(p: Profile, minutes = 0) {
  const t = today()
  if (p.streak.lastDay !== t) {
    p.streak.current = p.streak.lastDay === yesterday() ? p.streak.current + 1 : 1
    p.streak.best = Math.max(p.streak.best, p.streak.current)
    p.streak.lastDay = t
  }
  if (minutes > 0) p.days[t] = (p.days[t] ?? 0) + minutes
  const now = Date.now()
  if (now - p.session.lastAt > 30 * 60 * 1000) p.session = newSession(now)
  p.session.lastAt = now
}

export function addXp(p: Profile, amount: number) {
  p.xp += amount
  p.session.xp += amount
}

export function markLessonComplete(id: LessonId) {
  update(p => {
    if (!p.completed[id]) {
      p.completed[id] = Date.now()
      addXp(p, 50)
      if (!p.session.lessons.includes(id)) p.session.lessons.push(id)
    }
    touch(p)
  })
}

export function recordAnswer(opts: { questionId: string; lesson: LessonId; correct: boolean; mistake?: MistakeTag | null; xp?: number }) {
  update(p => {
    const s = p.qstats[opts.questionId] ?? { seen: 0, correct: 0, lastAt: 0, lastCorrect: false }
    s.seen += 1
    if (opts.correct) s.correct += 1
    s.lastAt = Date.now()
    s.lastCorrect = opts.correct
    p.qstats[opts.questionId] = s
    p.session.answered += 1
    if (opts.correct) {
      p.session.correct += 1
      addXp(p, opts.xp ?? 5)
    } else if (opts.mistake) {
      p.mistakes.push({ at: Date.now(), tag: opts.mistake, lesson: opts.lesson, questionId: opts.questionId })
      if (p.mistakes.length > 600) p.mistakes.splice(0, p.mistakes.length - 600)
    }
    touch(p)
  })
}

export function recordFormula(formula: FormulaId, difficulty: Difficulty, correct: boolean, mistake?: MistakeTag) {
  update(p => {
    const s = p.formulas[formula] ?? { attempts: 0, correct: 0, streak: 0 }
    s.attempts += 1
    if (correct) {
      s.correct += 1
      s.streak += 1
      const order: Difficulty[] = ['beginner', 'intermediate', 'advanced', 'trap', 'master']
      if (!s.best || order.indexOf(difficulty) > order.indexOf(s.best)) s.best = difficulty
      addXp(p, 8)
      p.session.correct += 1
    } else {
      s.streak = 0
      if (mistake) p.mistakes.push({ at: Date.now(), tag: mistake, formula })
    }
    p.session.answered += 1
    p.formulas[formula] = s
    touch(p)
  })
}

export function recordLab(lab: LabKey, challengeScore?: number) {
  update(p => {
    const prev = p.labs[lab]
    if (!prev) addXp(p, 20)
    p.labs[lab] = { at: Date.now(), challenge: Math.max(prev?.challenge ?? 0, challengeScore ?? 0) || undefined }
    touch(p)
  })
}

export function setSettings(patch: Partial<Settings>) {
  update(p => { p.settings = { ...p.settings, ...patch } })
}

export function resetProfile() {
  const keep = state.settings
  state = emptyProfile()
  state.settings = keep
  listeners.forEach(l => l())
  persist()
}

export function exportProfile(): string {
  return JSON.stringify(state, null, 2)
}

export function importProfile(json: string): boolean {
  try {
    const p = JSON.parse(json) as Profile
    if (p.version !== 1 || typeof p.xp !== 'number') return false
    state = { ...emptyProfile(), ...p, settings: { ...DEFAULT_SETTINGS, ...p.settings } }
    listeners.forEach(l => l())
    persist()
    return true
  } catch {
    return false
  }
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
