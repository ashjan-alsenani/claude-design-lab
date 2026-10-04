import { AVATAR_COLOR_VALUES, defaultAvatarColor, initials, type Avatar } from "@/lib/profile";

type Props = { user: { id: string; email: string; name?: string; avatar?: Avatar }; size?: number; className?: string };

/** The person's photo, or their initials on their chosen color. Never a blank circle. */
export function UserAvatar({ user, size = 40, className = "" }: Props) {
  const style = { width: size, height: size };
  if (user.avatar?.kind === "photo") {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- private, per-user image behind a session check
      <img src={`/api/avatar/${encodeURIComponent(user.id)}?v=${user.avatar.v}`} alt="" width={size} height={size} style={style} className={`shrink-0 rounded-full object-cover ${className}`} />
    );
  }
  const c = AVATAR_COLOR_VALUES[user.avatar?.kind === "initials" ? user.avatar.color : defaultAvatarColor(user.id)];
  return (
    <span aria-hidden="true" style={{ ...style, background: c.bg, color: c.fg, fontSize: Math.round(size * 0.4) }} className={`grid shrink-0 place-items-center rounded-full font-bold leading-none ${className}`}>
      {initials(user.name, user.email)}
    </span>
  );
}
