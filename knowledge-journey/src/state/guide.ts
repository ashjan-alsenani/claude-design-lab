import type { Mood } from '../components/art/StarSprite';
import { createMemoryStore, useStore } from './store';

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
export const praise = () => say(PRAISE[Math.floor(Math.random() * PRAISE.length)], 'cheer');
export const encourage = () => say(ENCOURAGE[Math.floor(Math.random() * ENCOURAGE.length)], 'think');
