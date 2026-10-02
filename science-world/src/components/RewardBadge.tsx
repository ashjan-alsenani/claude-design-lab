interface Props {
  emoji: string;
  title: string;
  description: string;
  unlocked: boolean;
  howTo?: string;
  kind?: 'badge' | 'trophy' | 'sticker';
}

export function RewardBadge({ emoji, title, description, unlocked, howTo, kind = 'badge' }: Props) {
  return (
    <div className={`reward reward--${kind} ${unlocked ? 'reward--on' : 'reward--locked'}`}>
      <div className="reward__medal" aria-hidden="true">
        <span>{emoji}</span>
        {!unlocked && <span className="reward__lock">🔒</span>}
      </div>
      <div className="reward__title">{title}</div>
      <div className="reward__desc">{unlocked ? description : howTo}</div>
    </div>
  );
}
