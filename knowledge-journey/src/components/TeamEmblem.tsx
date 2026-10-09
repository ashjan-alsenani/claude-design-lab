import { TEAMS, type TeamId } from '../state/teacher';

export function TeamEmblem({ id, size = 26 }: { id: TeamId; size?: number }) {
  const team = TEAMS.find((t) => t.id === id)!;
  const d =
    id === 'stars'
      ? 'M12 2.5l2.8 6 6.5.7-4.9 4.4 1.4 6.4L12 16.8 6.2 20l1.4-6.4-4.9-4.4 6.5-.7Z'
      : id === 'pearls'
        ? 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z'
        : id === 'gems'
          ? 'M7 4h10l4 5-9 11L3 9Z'
          : 'M15 3a9 9 0 1 0 6 15.5A8 8 0 0 1 15 3Z';
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path d={d} fill={team.color} stroke="#fff" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}
