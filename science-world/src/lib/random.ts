export function shuffle<T>(arr: readonly T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Shuffle, but never return the original order (for "arrange" games). */
export function shuffleNotSorted<T>(arr: readonly T[]): T[] {
  if (arr.length < 2) return arr.slice();
  let a = shuffle(arr);
  let guard = 0;
  while (a.every((x, i) => x === arr[i]) && guard++ < 10) a = shuffle(arr);
  return a;
}

export function sample<T>(arr: readonly T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}
