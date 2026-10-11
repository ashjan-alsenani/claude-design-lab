/**
 * Clicky's purchase-party dance: the logo mascot in a party hat doing a 6-second routine on a loop:
 * bounce and wave → shoulder shimmy while laughing ("هههه") → disco point → the hat flies off and
 * lands back (tongue out) → a full spin. Pure SVG + CSS (globals.css, `.dc-*`), no JavaScript;
 * under prefers-reduced-motion it stands still, happy, in its hat.
 */
const INK = "#1E1B3A";
const BODY = "M50 6 C78 6 94 18 94 48 C94 80 78 94 50 94 C22 94 6 80 6 48 C6 18 22 6 50 6 Z";

const cheeks = (
  <g fill="#FF8FAB" opacity=".85">
    <ellipse cx="23" cy="63" rx="6.5" ry="4" />
    <ellipse cx="77" cy="63" rx="6.5" ry="4" />
  </g>
);

export function DancingClicky({ size = 170, laugh = "هههههه" }: { size?: number; laugh?: string }) {
  return (
    <div aria-hidden="true" className="dc-stage relative mx-auto" style={{ width: size, height: size * 1.25 }}>
      <div className="dc-shadow absolute bottom-[2%] left-1/2 h-[6%] w-[46%] -translate-x-1/2 rounded-[50%] bg-[color-mix(in_oklab,var(--oc-ink)_18%,transparent)]" />
      <div className="dc-bounce absolute inset-0">
        <div className="dc-jump absolute inset-0">
          <div className="dc-shimmy absolute inset-0">
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
                  {/* arms: each group turns around its shoulder */}
                  <g className="dc-arm-l">
                    <path d="M10 58 Q-6 44 -4 22" stroke={INK} strokeWidth="5" strokeLinecap="round" fill="none" />
                    <circle cx="-4" cy="20" r="4.5" fill="#FFC23D" />
                  </g>
                  <g className="dc-arm-r">
                    <path d="M90 58 Q106 44 104 22" stroke={INK} strokeWidth="5" strokeLinecap="round" fill="none" />
                    <circle cx="104" cy="20" r="4.5" fill="#FF6B6B" />
                  </g>
                  <path d={BODY} fill="url(#dc-body)" />
                  <path d="M20 30 Q22 16 38 13" stroke="#fff" strokeOpacity=".45" strokeWidth="5" strokeLinecap="round" fill="none" />
                  {/* face 1: big happy (the logo set's "celebrate") */}
                  <g className="dc-face-happy">
                    <path d="M28 46 Q36 36 44 46" stroke={INK} strokeWidth="5" strokeLinecap="round" fill="none" />
                    <path d="M56 46 Q64 36 72 46" stroke={INK} strokeWidth="5" strokeLinecap="round" fill="none" />
                    {cheeks}
                    <path d="M36 58 Q50 80 64 58 Z" fill={INK} />
                    <path d="M42 66 Q50 72 58 66" fill="#FF8FAB" />
                  </g>
                  {/* face 2: laughing out loud, eyes squeezed shut >< */}
                  <g className="dc-face-laugh">
                    <path d="M28 38 L40 44 L28 50" stroke={INK} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <path d="M72 38 L60 44 L72 50" stroke={INK} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    {cheeks}
                    <path d="M30 56 Q50 92 70 56 Z" fill={INK} />
                    <path d="M38 68 Q50 80 62 68 Q50 74 38 68 Z" fill="#FF8FAB" />
                    <path d="M33 58 L67 58" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                    <path d="M18 34 Q14 40 17 44" stroke="#7cc8ff" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                  </g>
                  {/* face 3: silly wink with the tongue out */}
                  <g className="dc-face-silly">
                    <ellipse cx="36" cy="44" rx="8.5" ry="10" fill="#fff" />
                    <circle cx="38" cy="46" r="5.5" fill={INK} />
                    <circle cx="40" cy="43.5" r="2" fill="#fff" />
                    <path d="M56 46 Q64 40 72 46" stroke={INK} strokeWidth="5" strokeLinecap="round" fill="none" />
                    {cheeks}
                    <path d="M36 62 Q50 70 64 60" stroke={INK} strokeWidth="5" strokeLinecap="round" fill="none" />
                    <path d="M50 66 Q50 80 58 80 Q66 80 62 64 Z" fill="#FF5A7A" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
                  </g>
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
        </div>
      </div>
      {/* "hahaha" bubbles during the shimmy and the hat trick */}
      <span className="dc-ha dc-ha-1 absolute rounded-full bg-surface-raised px-3 py-1 text-lg font-extrabold text-[#F0567A] shadow-soft">{laugh}</span>
      <span className="dc-ha dc-ha-2 absolute rounded-full bg-surface-raised px-2.5 py-0.5 text-base font-extrabold text-[#8B7CF6] shadow-soft">{laugh.slice(0, 4)}</span>
      {/* music notes drifting up */}
      {["♪", "♫", "♪", "♬"].map((n, i) => (
        <span key={i} className={`dc-note dc-note-${i} absolute text-2xl font-bold`} style={{ color: ["#8B7CF6", "#F0567A", "#12B5A6", "#FFC23D"][i] }}>
          {n}
        </span>
      ))}
    </div>
  );
}
