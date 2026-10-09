import { createPersistentStore, useStore } from './store';

export interface Settings {
  music: boolean;
  sfx: boolean;
  /** 'system' follows prefers-reduced-motion. */
  motion: 'system' | 'reduce' | 'full';
}

const initial = (): Settings => ({ music: false, sfx: true, motion: 'system' });

export const settingsStore = createPersistentStore('kj.settings', initial, (s) => ({
  ...initial(),
  ...(s as Partial<Settings>),
  // Music never auto-resumes on a fresh page load: browsers need a user gesture first.
  music: false,
}));

export const useSettings = <S,>(sel: (s: Settings) => S) => useStore(settingsStore, sel);
