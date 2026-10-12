import type { ReactNode } from "react";
import type { FavorCat } from "../model/favor-ideas";
import type { Look } from "../model/looks";

/*
 * Hand-drawn style illustrations, generated in SVG so 1,000 welcome looks and every favor idea get
 * their own picture: no stock photos, no AI images, crisp at any size, tiny to load. Decorative
 * (aria-hidden); the title next to each picture carries the meaning.
 */

const INK = "#7a7590";
const star = (x: number, y: number, r: number, c: string, k?: string) => {
  const p: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r;
    p.push(`${(x + rr * Math.cos(a)).toFixed(1)},${(y + rr * Math.sin(a)).toFixed(1)}`);
  }
  return <polygon key={k} points={p.join(" ")} fill={c} />;
};
const cloud = (x: number, y: number, s: number, c: string, k?: string) => (
  <g key={k} transform={`translate(${x} ${y}) scale(${s})`} fill={c}>
    <circle cx="0" cy="0" r="9" /><circle cx="11" cy="-6" r="11" /><circle cx="24" cy="0" r="9" /><rect x="0" y="-1" width="24" height="10" rx="5" />
  </g>
);
const flower = (x: number, y: number, s: number, c: string, mid: string, k?: string) => (
  <g key={k} transform={`translate(${x} ${y}) scale(${s})`}>
    {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx="0" cy="-6" rx="4.4" ry="6" fill={c} transform={`rotate(${a})`} />)}
    <circle r="3" fill={mid} />
  </g>
);
const balloon = (x: number, y: number, s: number, c: string, k?: string) => (
  <g key={k} transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M0 9 Q-2 18 1 26" stroke={INK} strokeOpacity=".35" strokeWidth="1" fill="none" />
    <ellipse cx="0" cy="0" rx="8" ry="10" fill={c} />
    <ellipse cx="-2.5" cy="-3.5" rx="2" ry="3" fill="#fff" opacity=".45" />
  </g>
);
const butterfly = (x: number, y: number, s: number, c: string, k?: string) => (
  <g key={k} transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx="-5" cy="-3" rx="5" ry="6" fill={c} /><ellipse cx="5" cy="-3" rx="5" ry="6" fill={c} />
    <ellipse cx="-4" cy="5" rx="3.5" ry="4" fill={c} opacity=".75" /><ellipse cx="4" cy="5" rx="3.5" ry="4" fill={c} opacity=".75" />
    <rect x="-0.8" y="-7" width="1.6" height="14" rx=".8" fill={INK} opacity=".6" />
  </g>
);
const teddy = (x: number, y: number, s: number, c: string, k?: string) => (
  <g key={k} transform={`translate(${x} ${y}) scale(${s})`}>
    <circle cx="-11" cy="-11" r="6" fill={c} /><circle cx="11" cy="-11" r="6" fill={c} />
    <circle cx="0" cy="0" r="14" fill={c} />
    <ellipse cx="0" cy="5" rx="6" ry="4.5" fill="#fff" opacity=".7" />
    <circle cx="-5" cy="-3" r="1.6" fill={INK} /><circle cx="5" cy="-3" r="1.6" fill={INK} /><circle cx="0" cy="3.5" r="1.6" fill={INK} />
    <ellipse cx="0" cy="24" rx="12" ry="12" fill={c} />
  </g>
);

/** The baby name sign: a small easel board. */
const sign = (x: number, y: number, main: string, soft: string) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M-12 30 L-4 0 M12 30 L4 0" stroke={INK} strokeOpacity=".35" strokeWidth="2" />
    <rect x="-22" y="-16" width="44" height="30" rx="8" fill="#fff" stroke={main} strokeWidth="2" />
    <rect x="-13" y="-7" width="26" height="4" rx="2" fill={main} />
    <rect x="-9" y="1" width="18" height="3" rx="1.5" fill={soft} />
  </g>
);

function motif(l: Look, area: { x: number; y: number; w: number; h: number }) {
  const { main, soft, accent } = l.palette;
  const { x, y, w, h } = area;
  const at = (fx: number, fy: number) => [x + w * fx, y + h * fy] as const;
  const out: ReactNode[] = [];
  switch (l.theme) {
    case "clouds":
      out.push(cloud(...at(0.12, 0.25), 0.9, "#fff", "c1"), cloud(...at(0.62, 0.15), 0.75, "#fff", "c2"), cloud(...at(0.4, 0.55), 0.6, "#fff", "c3"));
      out.push(star(...at(0.35, 0.2), 4, accent, "s1"), star(...at(0.85, 0.45), 3.5, accent, "s2"), star(...at(0.15, 0.65), 3, accent, "s3"));
      break;
    case "moon": {
      const [mx, my] = at(0.72, 0.28);
      out.push(<path key="m" d={`M${mx} ${my - 14} a14 14 0 1 0 10 24 a11 11 0 1 1 -10 -24z`} fill={accent} />);
      [[0.2, 0.2], [0.4, 0.45], [0.15, 0.6], [0.5, 0.15], [0.88, 0.7]].forEach(([fx, fy], i) => out.push(star(...at(fx, fy), 3 + (i % 2), i % 2 ? "#fff" : accent, `s${i}`)));
      break;
    }
    case "garden":
      [[0.1, 0.2], [0.3, 0.1], [0.55, 0.12], [0.8, 0.22], [0.92, 0.5], [0.05, 0.55]].forEach(([fx, fy], i) => out.push(flower(...at(fx, fy), 0.9, i % 2 ? main : "#fff", accent, `f${i}`)));
      break;
    case "teddy":
      out.push(teddy(...at(0.82, 0.55), 0.9, accent, "t"));
      out.push(star(...at(0.2, 0.25), 3.5, main, "s1"), star(...at(0.5, 0.15), 3, accent, "s2"));
      break;
    case "balloons":
      [[0.1, 0.3, main], [0.2, 0.18, "#fff"], [0.28, 0.35, accent], [0.75, 0.25, main], [0.86, 0.15, accent], [0.92, 0.36, "#fff"]].forEach(([fx, fy, c], i) => out.push(balloon(...at(fx as number, fy as number), 1, c as string, `b${i}`)));
      break;
    case "sea": {
      const [sx, sy] = at(0, 0.7);
      out.push(<path key="w1" d={`M${sx} ${sy} q${w / 8} -8 ${w / 4} 0 t${w / 4} 0 t${w / 4} 0 t${w / 4} 0`} stroke={main} strokeWidth="3" fill="none" />);
      out.push(<path key="w2" d={`M${sx} ${sy + 9} q${w / 8} -8 ${w / 4} 0 t${w / 4} 0 t${w / 4} 0 t${w / 4} 0`} stroke={accent} strokeWidth="2.5" fill="none" />);
      const [hx, hy] = at(0.8, 0.3);
      out.push(<path key="shell" d={`M${hx} ${hy} l-10 12 q10 6 20 0 z`} fill={accent} />);
      out.push(star(...at(0.2, 0.25), 4, "#fff", "st"));
      break;
    }
    case "sadu": {
      const [bx, by] = at(0, 0.78);
      for (let i = 0; i < 10; i++) out.push(<path key={`tr${i}`} d={`M${bx + (w / 10) * i} ${by + 10} l${w / 20} -10 l${w / 20} 10 z`} fill={i % 2 ? main : accent} />);
      out.push(<rect key="band" x={bx} y={by + 10} width={w} height="4" fill={main} opacity=".6" />);
      break;
    }
    case "minimal":
      out.push(flower(...at(0.85, 0.3), 0.8, "#fff", accent, "f"));
      out.push(<path key="l" d={`M${x + w * 0.1} ${y + h * 0.6} q${w * 0.4} -20 ${w * 0.8} 0`} stroke={main} strokeWidth="1.5" fill="none" />);
      break;
    case "gold":
      out.push(<rect key="fr" x={x + w * 0.08} y={y + h * 0.1} width={w * 0.84} height={h * 0.8} rx="10" fill="none" stroke={accent} strokeWidth="3" />);
      [[0.18, 0.75], [0.82, 0.75]].forEach(([fx, fy], i) => {
        const [cx, cy] = at(fx, fy);
        out.push(<g key={`cd${i}`}><rect x={cx - 3} y={cy - 12} width="6" height="14" rx="2" fill="#fff" /><ellipse cx={cx} cy={cy - 15} rx="2.2" ry="3.4" fill={accent} /></g>);
      });
      break;
    case "butterflies":
      [[0.15, 0.25], [0.35, 0.12], [0.7, 0.2], [0.88, 0.45], [0.1, 0.6]].forEach(([fx, fy], i) => out.push(butterfly(...at(fx, fy), 0.9, i % 2 ? main : accent, `bf${i}`)));
      break;
  }
  return out;
}

/** One welcome look, drawn: the place, the theme on the backdrop, the palette everywhere. */
export function LookArt({ look, className = "" }: { look: Look; className?: string }) {
  const { main, soft, accent } = look.palette;
  const floor = `color-mix(in oklab, ${soft} 70%, ${main})`;
  let scene: ReactNode;
  switch (look.place) {
    case "hospital":
      scene = (
        <>
          <rect x="22" y="34" width="70" height="56" rx="8" fill="#fff" opacity=".85" />
          <path d="M57 34 V90 M22 62 H92" stroke={soft} strokeWidth="3" />
          {motif(look, { x: 110, y: 26, w: 190, h: 90 })}
          <rect x="160" y="128" width="130" height="34" rx="10" fill="#fff" />
          <rect x="160" y="118" width="40" height="22" rx="8" fill={soft} stroke={main} strokeWidth="2" />
          <rect x="196" y="132" width="94" height="30" rx="8" fill={main} opacity=".85" />
          <path d="M166 162 V182 M284 162 V182" stroke={INK} strokeOpacity=".3" strokeWidth="3" />
          {sign(70, 150, main, soft)}
        </>
      );
      break;
    case "majlis":
      scene = (
        <>
          <path d="M70 182 V80 A90 70 0 0 1 250 80 V182 Z" fill={soft} stroke={main} strokeWidth="3" />
          {motif(look, { x: 82, y: 40, w: 156, h: 120 })}
          {sign(160, 140, main, soft)}
          <rect x="16" y="160" width="288" height="22" rx="10" fill={main} opacity=".85" />
          {[30, 70, 230, 270].map((cx) => <rect key={cx} x={cx} y="146" width="28" height="20" rx="8" fill={accent} />)}
          <path d="M290 150 q6 -10 0 -18 h-8 q-6 8 0 18 z" fill={accent} stroke={INK} strokeOpacity=".3" />
        </>
      );
      break;
    case "family":
      scene = (
        <>
          <path d="M60 182 V70 A100 66 0 0 1 260 70 V182 Z" fill={soft} />
          {motif(look, { x: 70, y: 22, w: 180, h: 110 })}
          <rect x="105" y="150" width="110" height="10" rx="4" fill="#fff" />
          <path d="M115 160 V182 M205 160 V182" stroke={INK} strokeOpacity=".3" strokeWidth="3" />
          <rect x="146" y="126" width="28" height="24" rx="4" fill={main} /><rect x="150" y="112" width="20" height="16" rx="4" fill={accent} /><circle cx="160" cy="108" r="3" fill={main} />
          {[118, 132, 188, 202].map((cx, i) => <circle key={cx} cx={cx} cy="145" r="5" fill={i % 2 ? accent : main} />)}
          {balloon(40, 80, 1.3, main, "bl1")}{balloon(28, 100, 1.1, accent, "bl2")}{balloon(286, 86, 1.3, accent, "bl3")}{balloon(296, 106, 1.1, main, "bl4")}
          {sign(245, 158, main, soft)}
        </>
      );
      break;
    case "outdoor":
      scene = (
        <>
          <circle cx="40" cy="120" r="32" fill={`color-mix(in oklab, ${accent} 30%, #9cb59a)`} /><rect x="36" y="140" width="8" height="42" fill="#b08a64" />
          <path d="M90 60 L230 60 L250 92 L70 92 Z" fill={main} opacity=".9" />
          <path d="M90 92 V182 M230 92 V182" stroke={INK} strokeOpacity=".35" strokeWidth="3" />
          <path d="M70 92 q90 26 180 0" stroke={accent} strokeWidth="1.5" fill="none" />
          {[90, 120, 150, 180, 210, 240].map((cx, i) => <circle key={cx} cx={cx} cy={92 + Math.sin(i) * 6 + 8} r="3" fill={accent} />)}
          {motif(look, { x: 100, y: 96, w: 120, h: 60 })}
          <rect x="120" y="164" width="80" height="10" rx="4" fill="#fff" />
          {sign(270, 156, main, soft)}
        </>
      );
      break;
    case "aqiqah":
      scene = (
        <>
          {motif(look, { x: 30, y: 20, w: 260, h: 90 })}
          <path d="M160 24 V44" stroke={INK} strokeOpacity=".35" strokeWidth="1.5" />
          <path d="M150 44 h20 l4 18 q-14 8 -28 0 z" fill={accent} /><circle cx="160" cy="56" r="4" fill="#fff" opacity=".8" />
          <rect x="30" y="140" width="260" height="14" rx="6" fill="#fff" />
          <rect x="30" y="152" width="260" height="8" rx="3" fill={main} opacity=".8" />
          {[70, 125, 195, 250].map((cx, i) => <g key={cx}><ellipse cx={cx} cy="138" rx="22" ry="7" fill={i % 2 ? soft : accent} stroke={main} strokeWidth="1.5" /><ellipse cx={cx} cy="134" rx="13" ry="5" fill={i % 2 ? "#e7b16a" : "#fff"} /></g>)}
          <path d="M40 160 V182 M280 160 V182" stroke={INK} strokeOpacity=".3" strokeWidth="3" />
        </>
      );
      break;
  }
  return (
    <svg viewBox="0 0 320 200" className={className} aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <rect width="320" height="200" fill={`color-mix(in oklab, ${soft} 85%, #fff)`} />
      <rect y="182" width="320" height="18" fill={floor} />
      {scene}
    </svg>
  );
}

/** A favor, drawn by its kind: box, candle, plant, keychain, soap, coffee, card, toy, jar or burner. */
export function FavorArt({ cat, color, className = "" }: { cat: FavorCat; color: string; className?: string }) {
  const soft = `color-mix(in oklab, ${color} 30%, #fff)`;
  const deep = `color-mix(in oklab, ${color} 70%, ${INK})`;
  const shapes: Record<FavorCat, ReactNode> = {
    sweets: (
      <g>
        <rect x="16" y="34" width="48" height="34" rx="6" fill={soft} stroke={deep} strokeWidth="2" />
        <rect x="14" y="26" width="52" height="12" rx="4" fill={color} stroke={deep} strokeWidth="2" />
        <rect x="37" y="26" width="6" height="42" fill="#fff" opacity=".9" />
        <path d="M40 26 c-8 -10 -16 -4 -10 2 M40 26 c8 -10 16 -4 10 2" stroke={deep} strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <circle cx="26" cy="54" r="5" fill="#d9a066" /><circle cx="54" cy="56" r="4" fill="#d9a066" />
      </g>
    ),
    scents: (
      <g>
        <rect x="24" y="34" width="32" height="36" rx="8" fill={soft} stroke={deep} strokeWidth="2" />
        <rect x="24" y="46" width="32" height="10" fill={color} />
        <path d="M40 34 V26" stroke={INK} strokeWidth="2" />
        <path d="M40 12 q7 8 0 14 q-7 -6 0 -14z" fill="#ffc23d" />
      </g>
    ),
    plants: (
      <g>
        <path d="M24 46 h32 l-4 24 h-24 z" fill={color} stroke={deep} strokeWidth="2" strokeLinejoin="round" />
        <rect x="22" y="42" width="36" height="8" rx="3" fill={soft} stroke={deep} strokeWidth="2" />
        <path d="M40 42 V24" stroke="#5a9a5f" strokeWidth="3" />
        <path d="M40 30 q-12 -8 -14 -16 q12 0 14 16 M40 26 q10 -10 16 -12 q-2 12 -16 12" fill="#8cc08f" />
      </g>
    ),
    keepsakes: (
      <g>
        <circle cx="40" cy="20" r="7" fill="none" stroke={deep} strokeWidth="3" />
        <path d="M40 27 V34" stroke={deep} strokeWidth="2.5" />
        <path d="M26 34 h28 l4 8 v18 a8 8 0 0 1 -8 8 h-20 a8 8 0 0 1 -8 -8 v-18 z" fill={color} stroke={deep} strokeWidth="2" />
        <path d="M40 60 c-10 -7 -8 -14 0 -10 c8 -4 10 3 0 10z" fill="#fff" />
      </g>
    ),
    care: (
      <g>
        <rect x="18" y="38" width="44" height="28" rx="12" fill={color} stroke={deep} strokeWidth="2" />
        <rect x="26" y="46" width="28" height="12" rx="6" fill="#fff" opacity=".6" />
        <circle cx="24" cy="28" r="5" fill="none" stroke={deep} strokeWidth="1.8" /><circle cx="36" cy="22" r="3.5" fill="none" stroke={deep} strokeWidth="1.8" /><circle cx="50" cy="28" r="4" fill="none" stroke={deep} strokeWidth="1.8" />
      </g>
    ),
    drinks: (
      <g>
        <path d="M22 30 h36 l-4 38 h-28 z" fill={soft} stroke={deep} strokeWidth="2" strokeLinejoin="round" />
        <rect x="20" y="24" width="40" height="8" rx="3" fill={color} stroke={deep} strokeWidth="2" />
        <rect x="26" y="44" width="28" height="12" rx="3" fill={color} />
        <path d="M34 18 q3 -5 0 -10 M44 18 q3 -5 0 -10" stroke={deep} strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
    ),
    paper: (
      <g>
        <rect x="14" y="26" width="52" height="38" rx="5" fill="#fff" stroke={deep} strokeWidth="2" />
        <path d="M14 28 L40 48 L66 28" fill="none" stroke={deep} strokeWidth="2" />
        <circle cx="40" cy="48" r="7" fill={color} />
        <path d="M40 51 c-4 -3 -3 -6 0 -4 c3 -2 4 1 0 4z" fill="#fff" />
      </g>
    ),
    kids: (
      <g>
        <rect x="16" y="44" width="22" height="22" rx="4" fill={color} stroke={deep} strokeWidth="2" />
        <rect x="42" y="44" width="22" height="22" rx="4" fill={soft} stroke={deep} strokeWidth="2" />
        <rect x="29" y="20" width="22" height="22" rx="4" fill="#ffd36b" stroke={deep} strokeWidth="2" />
        <text x="27" y="60" fontSize="12" fontWeight="700" fill="#fff" fontFamily="sans-serif">A</text>
        <text x="53" y="60" fontSize="12" fontWeight="700" fill={deep} fontFamily="sans-serif">B</text>
      </g>
    ),
    healthy: (
      <g>
        <rect x="24" y="30" width="32" height="40" rx="8" fill={soft} stroke={deep} strokeWidth="2" />
        <rect x="22" y="22" width="36" height="10" rx="4" fill={color} stroke={deep} strokeWidth="2" />
        {[[32, 44], [44, 48], [36, 56], [48, 60], [32, 62]].map(([cx, cy]) => <ellipse key={`${cx}${cy}`} cx={cx} cy={cy} rx="4" ry="3" fill="#c89a6a" />)}
      </g>
    ),
    heritage: (
      <g>
        <path d="M30 66 h20 l-3 -8 h-14 z" fill={deep} />
        <path d="M26 58 h28 q2 -14 -6 -20 h-16 q-8 6 -6 20z" fill={color} stroke={deep} strokeWidth="2" />
        <path d="M33 38 q7 -10 14 0" fill={soft} stroke={deep} strokeWidth="2" />
        <path d="M38 24 q4 -6 0 -10 M44 24 q4 -6 0 -10" stroke={INK} strokeOpacity=".4" strokeWidth="2" fill="none" />
        {[30, 38, 46].map((x) => <path key={x} d={`M${x} 52 l3 -5 l3 5 z`} fill="#fff" />)}
      </g>
    ),
  };
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden="true">
      <circle cx="40" cy="42" r="36" fill={`color-mix(in oklab, ${color} 14%, #fff)`} />
      {shapes[cat]}
    </svg>
  );
}
