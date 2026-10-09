import { useSyncExternalStore } from 'react';
import type { ActivityId } from './types';

export type Route =
  | { name: 'intro' }
  | { name: 'map' }
  | { name: 'play'; id: ActivityId }
  | { name: 'teacher' }
  | { name: 'arena' };

const ACTIVITIES: ActivityId[] = ['gates', 'chests', 'wheel', 'detective', 'puzzle', 'cinema', 'lightning', 'crown'];

export function parseHash(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  if (parts[0] === 'map') return { name: 'map' };
  if (parts[0] === 'play' && ACTIVITIES.includes(parts[1] as ActivityId)) return { name: 'play', id: parts[1] as ActivityId };
  if (parts[0] === 'teacher') return { name: 'teacher' };
  if (parts[0] === 'arena') return { name: 'arena' };
  return { name: 'intro' };
}

export function hrefFor(r: Route): string {
  switch (r.name) {
    case 'intro':
      return '#/';
    case 'map':
      return '#/map';
    case 'play':
      return `#/play/${r.id}`;
    case 'teacher':
      return '#/teacher';
    case 'arena':
      return '#/arena';
  }
}

export function navigate(r: Route) {
  const h = hrefFor(r);
  if (window.location.hash !== h) window.location.hash = h;
}

const subscribe = (fn: () => void) => {
  window.addEventListener('hashchange', fn);
  return () => window.removeEventListener('hashchange', fn);
};

export function useHash(): string {
  return useSyncExternalStore(subscribe, () => window.location.hash, () => '');
}
