import type { PuzzleSlot } from '../data/lesson';

/** slotId → pieceId currently sitting in it */
export type Board = Record<string, string | undefined>;

export function checkBoard(board: Board, slots: PuzzleSlot[]) {
  const right: string[] = [];
  const wrong: string[] = [];
  for (const s of slots) {
    const p = board[s.id];
    if (!p) continue;
    (p === s.piece ? right : wrong).push(s.id);
  }
  return { right, wrong, complete: right.length === slots.length };
}

export function puzzleScore(hints: number, mistakes: number): number {
  return Math.max(30, 100 - hints * 10 - mistakes * 5);
}
