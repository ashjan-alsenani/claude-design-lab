import type { LessonId, Question } from '../types'
import { questions as m1a } from './m1a'
import { questions as m1b } from './m1b'
import { questions as m2a } from './m2a'
import { questions as numeric } from './numeric'
import { questions as m3 } from './m3'
import { questions as m4 } from './m4'
import { questions as traps } from './traps'

export const QUESTIONS: Question[] = [...m1a, ...m1b, ...m2a, ...numeric, ...m3, ...m4, ...traps]

const byId = new Map(QUESTIONS.map(q => [q.id, q]))
export const getQuestion = (id: string) => byId.get(id)
export const questionsFor = (lesson: LessonId) => QUESTIONS.filter(q => q.lesson === lesson)
