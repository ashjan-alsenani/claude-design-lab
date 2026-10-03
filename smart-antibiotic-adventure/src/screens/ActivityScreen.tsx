import type { ActivityId } from '../data/activities'
import { ActivityShell } from '../activities/ActivityShell'
import { Memory } from '../activities/Memory'
import { TrueFalse } from '../activities/TrueFalse'
import { Sequence } from '../activities/Sequence'
import { HandWash } from '../activities/HandWash'
import { Catch } from '../activities/Catch'
import { Detective } from '../activities/Detective'
import { Coloring } from '../activities/Coloring'

const GAMES = { memory: Memory, truefalse: TrueFalse, sequence: Sequence, handwash: HandWash, catch: Catch, detective: Detective, coloring: Coloring }

/** One play-park activity inside the shared shell; a new round remounts the game. */
export function ActivityScreen({ id }: { id: ActivityId }) {
  const Game = GAMES[id]
  return <ActivityShell id={id}>{(api, round) => <Game key={round} api={api} />}</ActivityShell>
}
