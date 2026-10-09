import type { Mood } from '../components/art/StarSprite';
import { currentTeam, playStore } from './play';
import { createMemoryStore, useStore } from './store';
import { TEAMS } from './teacher';

interface GuideState {
  message: string;
  mood: Mood;
  key: number;
}

export const guideStore = createMemoryStore<GuideState>(() => ({ message: '', mood: 'idle', key: 0 }));

export function say(message: string, mood: Mood = 'happy') {
  guideStore.set((g) => ({ message, mood, key: g.key + 1 }));
}
export function hush() {
  guideStore.set((g) => ({ ...g, message: '', mood: 'idle' }));
}

export const useGuide = <S,>(sel: (g: GuideState) => S) => useStore(guideStore, sel);

const PRAISE = ['أحسنتِ! إجابة رائعة.', 'ممتاز! أنتِ تقتربين من الكنز التالي.', 'رائع! معلومة في مكانها تمامًا.', 'تألقتِ! استمري.', 'إجابة ذكية!'];
const ENCOURAGE = ['فكّري مرة أخرى، أنتِ قادرة على حل التحدي!', 'لا بأس، الخطأ خطوة نحو الفهم.', 'اقرئي التلميح بهدوء، ثم حاولي.', 'اقتربتِ! ركّزي على الكلمة المفتاحية.'];
const pick = (a: string[]) => a[Math.floor(Math.random() * a.length)];
const teamName = (id: string | null | undefined) => TEAMS.find((t) => t.id === id)?.name ?? '';

/** In group play: name the team that just answered and announce whose turn is next. */
function groupLine(correct: boolean): string | null {
  const p = playStore.get();
  if (p.mode !== 'group' || !p.last) return null;
  const who = teamName(p.last.team);
  const next = teamName(currentTeam(p));
  const head = correct
    ? pick([`أحسنتُنّ يا ${who}! +${p.last.points} نقطة.`, `إجابة رائعة من ${who}! +${p.last.points}`, `${who} تتألق! +${p.last.points} نقطة.`])
    : pick([`لا بأس يا ${who}، اقرأن التوضيح جيدًا.`, `قريب يا ${who}! الخطأ خطوة نحو الفهم.`]);
  return next && next !== who ? `${head} الدور الآن على ${next}.` : head;
}

export const praise = () => say(groupLine(true) ?? pick(PRAISE), 'cheer');
export const encourage = () => say(groupLine(false) ?? pick(ENCOURAGE), 'think');
