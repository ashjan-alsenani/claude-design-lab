/** One consistent, hand-authored icon set: 24px grid, 2px rounded strokes. */
const PATHS = {
  map: 'M9 4 3 6.5v13L9 17l6 2.5 6-2.5v-13L15 6.5 9 4Zm0 0v13m6-10.5v13',
  // "Back" in RTL points to the right.
  back: 'M10 6l6 6-6 6M16 12H4',
  next: 'M14 6l-6 6 6 6M8 12h12',
  replay: 'M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5',
  music: 'M9 18V5.5l11-2V16M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm11-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  speaker: 'M4 9.5h3.5L12 5.5v13l-4.5-4H4v-5Zm11.5-.5a4.5 4.5 0 0 1 0 6m2.5-9a8.5 8.5 0 0 1 0 12',
  mute: 'M4 9.5h3.5L12 5.5v13l-4.5-4H4v-5Zm12 0 5 5m0-5-5 5',
  star: 'M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5Z',
  gem: 'M7 4h10l4 5-9 11L3 9l4-5Zm-4 5h18M9.5 4 8 9l4 11 4-11-1.5-5',
  sparkle: 'M12 3c.6 4.2 2.8 6.4 7 7-4.2.6-6.4 2.8-7 7-.6-4.2-2.8-6.4-7-7 4.2-.6 6.4-2.8 7-7Zm7 11c.3 1.7 1 2.4 2.5 2.7-1.5.3-2.2 1-2.5 2.6-.3-1.6-1-2.3-2.5-2.6 1.5-.3 2.2-1 2.5-2.7Z',
  hint: 'M9.5 18h5M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3Z',
  play: 'M7 4.5v15l12.5-7.5L7 4.5Z',
  pause: 'M8 5v14M16 5v14',
  check: 'M4.5 12.5l5 5L19.5 7',
  close: 'M6 6l12 12M18 6 6 18',
  teacher: 'M2.5 9 12 4.5 21.5 9 12 13.5 2.5 9Zm4 2v5c1.5 1.6 3.4 2.5 5.5 2.5s4-.9 5.5-2.5v-5M21.5 9v6',
  download: 'M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19.5h14',
  print: 'M7 8V4h10v4M7 17H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M7 14h10v6H7v-6Z',
  trophy: 'M8 4h8v5a4 4 0 0 1-8 0V4Zm0 2H4.5a3 3 0 0 0 3.5 4M16 6h3.5a3 3 0 0 1-3.5 4M12 13v4m-4 3h8m-6-3h4',
  crown: 'M3.5 8l4.5 4 4-7 4 7 4.5-4-2 10.5h-13L3.5 8Zm2 13.5h13',
  lock: 'M6.5 10.5h11v9.5h-11v-9.5Zm2.5 0V8a3 3 0 0 1 6 0v2.5',
  plus: 'M12 5v14M5 12h14',
  edit: 'M4 20h4L19 9l-4-4L4 16v4Zm9-13 4 4',
  trash: 'M4.5 7h15M10 11v6m4-6v6M6.5 7l1 13h9l1-13M9.5 7V4.5h5V7',
  upload: 'M12 15V4m0 0L7.5 8.5M12 4l4.5 4.5M5 19.5h14',
  users: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm-6 9c.4-3.4 2.9-5.5 6-5.5s5.6 2.1 6 5.5M16 4.5a3.5 3.5 0 0 1 0 6.5m2 3.6c1.7.8 2.8 2.6 3 5.4',
  timer: 'M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm0-12v4.5l2.5 2M9.5 2.5h5',
  eye: 'M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Zm9.5 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  wand: 'M4 20 15 9m2-5v3m0 6v3m4-7h-3m-6 0H9m9.5-4.5-2 2m-5 5-2 2',
  restart: 'M5 5v6h6M5.5 15a7 7 0 1 0 1.2-7.7L5 11',
  fullscreen: 'M4 9V4h5M20 9V4h-5M4 15v5h5m11-5v5h-5',
  film: 'M4 4h16v16H4V4Zm4 0v16m8-16v16M4 8h4m-4 4h4m-4 4h4m8-8h4m-4 4h4m-4 4h4',
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 22, className, title }: { name: IconName; size?: number; className?: string; title?: string }) {
  const filled = name === 'play';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path d={PATHS[name]} />
    </svg>
  );
}
