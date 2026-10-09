import { useId } from 'react';

export type Mood = 'idle' | 'happy' | 'think' | 'cheer' | 'wow';

/** «سَنا» — the little guiding star. Original character. */
export function StarSprite({ mood = 'idle', size = 96 }: { mood?: Mood; size?: number }) {
  const id = useId().replace(/:/g, '');
  const eyesClosed = mood === 'happy' || mood === 'cheer';
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id={`${id}glow`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fff3c4" stopOpacity=".95" />
          <stop offset=".45" stopColor="#ffd66e" stopOpacity=".35" />
          <stop offset="1" stopColor="#ffd66e" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}body`} x1=".2" y1="0" x2=".8" y2="1">
          <stop offset="0" stopColor="#fff7d6" />
          <stop offset=".45" stopColor="#ffd86f" />
          <stop offset="1" stopColor="#f0a53a" />
        </linearGradient>
        <linearGradient id={`${id}rim`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".9" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="62" r="58" fill={`url(#${id}glow)`} />
      {/* soft rounded star body */}
      <path
        d="M60 12c3.5 0 5.6 2.6 7.6 7.3l7 16.3 17.6 1.6c5 .5 8 2 9 5.1 1 3.2-.9 6-4.6 9.3L83.3 63.4l3.9 17.3c1.1 5 .8 8.3-1.9 10.2-2.7 2-6 1.1-10.4-1.5L60 80.3l-14.9 9.1c-4.4 2.6-7.7 3.5-10.4 1.5-2.7-1.9-3-5.2-1.9-10.2l3.9-17.3-13.3-11.8c-3.7-3.3-5.6-6.1-4.6-9.3 1-3.1 4-4.6 9-5.1l17.6-1.6 7-16.3C54.4 14.6 56.5 12 60 12Z"
        fill={`url(#${id}body)`}
        stroke="#e39a2e"
        strokeWidth="1.5"
      />
      <path d="M52 22c2-4 4.5-6 8-6 2 0 3.6.8 5 2.6-6.4-.4-9.8 2-13 3.4Z" fill={`url(#${id}rim)`} />
      {/* cheeks */}
      <ellipse cx="43" cy="58" rx="6" ry="3.6" fill="#ff9fb8" opacity=".75" />
      <ellipse cx="77" cy="58" rx="6" ry="3.6" fill="#ff9fb8" opacity=".75" />
      {/* eyes */}
      {eyesClosed ? (
        <g stroke="#4a2a12" strokeWidth="3" strokeLinecap="round" fill="none">
          <path d="M44 49q4.5-5 9 0" />
          <path d="M67 49q4.5-5 9 0" />
        </g>
      ) : (
        <g fill="#3b210f">
          <ellipse cx="49" cy={mood === 'think' ? 47 : 49} rx="4.2" ry={mood === 'wow' ? 5.6 : 5} />
          <ellipse cx="71" cy={mood === 'think' ? 47 : 49} rx="4.2" ry={mood === 'wow' ? 5.6 : 5} />
          <circle cx="50.6" cy="46.6" r="1.6" fill="#fff" />
          <circle cx="72.6" cy="46.6" r="1.6" fill="#fff" />
        </g>
      )}
      {/* mouth */}
      {mood === 'think' ? (
        <path d="M55 62q5 -2 10 1" stroke="#4a2a12" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      ) : mood === 'wow' ? (
        <ellipse cx="60" cy="62" rx="4" ry="4.6" fill="#7a3418" />
      ) : (
        <path d={mood === 'cheer' ? 'M52 58q8 11 16 0Z' : 'M53 59q7 7 14 0'} stroke="#4a2a12" strokeWidth="2.6" strokeLinecap="round" fill={mood === 'cheer' ? '#a2442f' : 'none'} />
      )}
      {mood === 'think' && <circle cx="94" cy="26" r="4" fill="#fff" opacity=".8" />}
    </svg>
  );
}
