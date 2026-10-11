/**
 * Clicky's purchase-party dance: the logo mascot in a party hat, bouncing to a beat, swaying,
 * throwing its arms up, kicking its feet and spinning round every few beats. Pure SVG + CSS
 * (globals.css, `.dc-*`), so it costs no JavaScript; static under prefers-reduced-motion.
 */
const INK = "#1E1B3A";
const BODY = "M50 6 C78 6 94 18 94 48 C94 80 78 94 50 94 C22 94 6 80 6 48 C6 18 22 6 50 6 Z";

export function DancingClicky({ size = 170 }: { size?: number }) {
  return (
    <div aria-hidden="true" className="dc-stage relative mx-auto" style={{ width: size, height: size * 1.25 }}>
      <div className="dc-shadow absolute bottom-[2%] left-1/2 h-[6%] w-[46%] -translate-x-1/2 rounded-[50%] bg-[color-mix(in_oklab,var(--oc-ink)_18%,transparent)]" />
      <div className="dc-bounce absolute inset-0">
        <div className="dc-sway absolute inset-0">
          <div className="dc-spin absolute inset-0">
            <svg viewBox="-20 -40 140 170" width="100%" height="100%" style={{ overflow: "visible" }}>
              <defs>
                <linearGradient id="dc-body" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#59cbc1" />
                  <stop offset="1" stopColor="#12B5A6" />
                </linearGradient>
              </defs>
              {/* legs (behind the body) */}
              <g stroke={INK} strokeWidth="5" strokeLinecap="round" fill="none">
                <path className="dc-leg-l" d="M38 90 L34 112 L24 112" />
                <path className="dc-leg-r" d="M62 90 L66 112 L76 112" />
              </g>
              {/* arms thrown up, waving in turns */}
              <g stroke={INK} strokeWidth="5" strokeLinecap="round" fill="none">
                <path className="dc-arm-l" d="M10 58 Q-6 44 -4 22" />
                <path className="dc-arm-r" d="M90 58 Q106 44 104 22" />
              </g>
              <circle className="dc-arm-l" cx="-4" cy="20" r="4.5" fill="#FFC23D" />
              <circle className="dc-arm-r" cx="104" cy="20" r="4.5" fill="#FF6B6B" />
              <path d={BODY} fill="url(#dc-body)" />
              <path d="M20 30 Q22 16 38 13" stroke="#fff" strokeOpacity=".45" strokeWidth="5" strokeLinecap="round" fill="none" />
              {/* the celebrate face from the logo set */}
              <path d="M28 46 Q36 36 44 46" stroke={INK} strokeWidth="5" strokeLinecap="round" fill="none" />
              <path d="M56 46 Q64 36 72 46" stroke={INK} strokeWidth="5" strokeLinecap="round" fill="none" />
              <g fill="#FF8FAB" opacity=".85">
                <ellipse cx="23" cy="63" rx="6.5" ry="4" />
                <ellipse cx="77" cy="63" rx="6.5" ry="4" />
              </g>
              <path d="M36 58 Q50 80 64 58 Z" fill={INK} />
              <path d="M42 66 Q50 72 58 66" fill="#FF8FAB" />
              {/* party hat, slightly askew */}
              <g className="dc-hat">
                <path d="M34 12 L56 -30 L72 16 Z" fill="#8B7CF6" stroke="#fff" strokeWidth="2.5" strokeLinejoin="round" />
                <path d="M41 0 L66 3" stroke="#FFC23D" strokeWidth="4" strokeLinecap="round" />
                <path d="M48 -14 L61 -12" stroke="#FF6B6B" strokeWidth="4" strokeLinecap="round" />
                <circle cx="56" cy="-32" r="6" fill="#FFC23D" stroke="#fff" strokeWidth="2" />
              </g>
            </svg>
          </div>
        </div>
      </div>
      {/* music notes drifting up */}
      {["♪", "♫", "♪", "♬"].map((n, i) => (
        <span key={i} className={`dc-note dc-note-${i} absolute text-2xl font-bold`} style={{ color: ["#8B7CF6", "#F0567A", "#12B5A6", "#FFC23D"][i] }}>
          {n}
        </span>
      ))}
    </div>
  );
}
