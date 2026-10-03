import { useRef, useState } from 'react'
import { motion } from 'motion/react'
import { centerOf } from '../components/fx'
import { ar } from '../lib/env'
import { useGame } from '../state/game'
import type { PlayApi } from './ActivityShell'

const PALETTE = ['#ff5f8f', '#ff9f2e', '#ffd23f', '#7be3b0', '#3cc46a', '#1fc8c0', '#5ec8ff', '#2f5bea', '#8e5bff', '#ff8fc7', '#a0522d', '#ffffff']
const NAMES = ['وردي', 'برتقالي', 'أصفر', 'نعناعي', 'أخضر', 'فيروزي', 'سماوي', 'أزرق', 'بنفسجي', 'زهري', 'بني', 'أبيض']

type Region = { id: string; el: 'path' | 'circle' | 'ellipse' | 'rect'; p: Record<string, string | number> }

function starPoints(cx: number, cy: number, r: number, inner = 0.45, n = 5) {
  return Array.from({ length: n * 2 }, (_, i) => {
    const a = (Math.PI / n) * i - Math.PI / 2
    const rr = i % 2 ? r * inner : r
    return `${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`
  }).join(' ')
}
const starPath = (cx: number, cy: number, r: number, inner?: number, n?: number) => `M${starPoints(cx, cy, r, inner, n).split(' ').join(' L')}Z`

const PAGES: { key: string; title: string; regions: Region[]; lines: Region[] }[] = [
  {
    key: 'kabsool',
    title: 'كبسول البطل',
    regions: [
      { id: 'bg', el: 'circle', p: { cx: 110, cy: 120, r: 106 } },
      { id: 'cape', el: 'path', p: { d: 'M72 92c-32 20-54 62-50 100 32-8 54-32 68-64Z' } },
      { id: 'legL', el: 'rect', p: { x: 82, y: 160, width: 12, height: 30, rx: 6 } },
      { id: 'legR', el: 'rect', p: { x: 126, y: 160, width: 12, height: 30, rx: 6 } },
      { id: 'shoeL', el: 'ellipse', p: { cx: 86, cy: 194, rx: 18, ry: 10 } },
      { id: 'shoeR', el: 'ellipse', p: { cx: 134, cy: 194, rx: 18, ry: 10 } },
      { id: 'top', el: 'path', p: { d: 'M60 110V80a50 50 0 0 1 100 0v30Z' } },
      { id: 'bottom', el: 'path', p: { d: 'M60 110v30a50 50 0 0 0 100 0v-30Z' } },
      { id: 'badge', el: 'path', p: { d: starPath(110, 62, 14) } },
      { id: 'gloveR', el: 'circle', p: { cx: 194, cy: 92, r: 14 } },
      { id: 'gloveL', el: 'circle', p: { cx: 28, cy: 156, r: 14 } },
      { id: 'cheekL', el: 'ellipse', p: { cx: 80, cy: 132, rx: 7, ry: 4.5 } },
      { id: 'cheekR', el: 'ellipse', p: { cx: 140, cy: 132, rx: 7, ry: 4.5 } },
    ],
    lines: [
      { id: 'armR', el: 'path', p: { d: 'M160 120c18 0 26-10 30-24' } },
      { id: 'armL', el: 'path', p: { d: 'M60 124c-18 4-26 14-30 28' } },
    ],
  },
  {
    key: 'shield',
    title: 'درع الحماية',
    regions: [
      { id: 'bg', el: 'circle', p: { cx: 110, cy: 120, r: 106 } },
      { id: 'outer', el: 'path', p: { d: 'M110 22 182 48v60c0 52-32 88-72 106-40-18-72-54-72-106V48Z' } },
      { id: 'inner', el: 'path', p: { d: 'M110 42 164 62v46c0 40-24 68-54 84-30-16-54-44-54-84V62Z' } },
      { id: 'star', el: 'path', p: { d: starPath(110, 112, 32) } },
      { id: 'ribbon', el: 'path', p: { d: 'M30 196h160l-12 16 12 16H30l12-16Z' } },
      { id: 'sp1', el: 'path', p: { d: starPath(30, 40, 12, 0.35, 4) } },
      { id: 'sp2', el: 'path', p: { d: starPath(192, 32, 10, 0.35, 4) } },
      { id: 'sp3', el: 'path', p: { d: starPath(196, 150, 9, 0.35, 4) } },
      { id: 'sp4', el: 'path', p: { d: starPath(22, 130, 9, 0.35, 4) } },
    ],
    lines: [],
  },
]

/** Pick a colour, tap a part. Saves the picture as an image. */
export function Coloring({ api }: { api: PlayApi }) {
  const { sfx } = useGame()
  const [page, setPage] = useState(0)
  const [color, setColor] = useState(0)
  const [fills, setFills] = useState<Record<string, Record<string, string>>>({})
  const svgRef = useRef<SVGSVGElement>(null)
  const pg = PAGES[page]
  const mine = fills[pg.key] ?? {}
  const coloredCount = Object.keys(mine).length
  const need = Math.min(5, pg.regions.length)

  const paint = (id: string, e: React.PointerEvent | React.KeyboardEvent) => {
    sfx('pop')
    setFills((f) => ({ ...f, [pg.key]: { ...(f[pg.key] ?? {}), [id]: PALETTE[color] } }))
    api.progress(Math.min(1, (coloredCount + (mine[id] ? 0 : 1)) / pg.regions.length))
    if (coloredCount + 1 === need && !mine[id]) api.say('جميل جدًا! 🌈 احفظ لوحتك 💾 ثم اضغط «انتهيت»، أو تابع التلوين.', 'happy')
    if ('clientX' in e && e.clientX) api.burst({ x: e.clientX, y: e.clientY }, 'sparkles', 5)
  }

  const save = async () => {
    const svg = svgRef.current
    if (!svg) return
    const xml = new XMLSerializer().serializeToString(svg)
    const img = new Image()
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml)
    await img.decode().catch(() => undefined)
    const c = document.createElement('canvas')
    c.width = 880
    c.height = 960
    const ctx = c.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, c.width, c.height)
    ctx.drawImage(img, 0, 0, c.width, c.height)
    const a = document.createElement('a')
    a.download = `${pg.key}-coloring.png`
    a.href = c.toDataURL('image/png')
    a.click()
    sfx('star')
    api.say('حُفظت لوحتك! 🖼️ يمكنك طباعتها أو إهداؤها.', 'happy')
  }

  const shape = (r: Region, fill: string, interactive: boolean) => {
    const El = r.el
    const props = {
      ...r.p,
      fill,
      stroke: '#17206b',
      strokeWidth: 3.5,
      strokeLinejoin: 'round' as const,
      ...(interactive
        ? {
            className: 'paint-region',
            tabIndex: 0,
            role: 'button',
            'aria-label': `لوّن هذا الجزء`,
            onPointerDown: (e: React.PointerEvent) => paint(r.id, e),
            onKeyDown: (e: React.KeyboardEvent) => {
              if (e.key !== 'Enter' && e.key !== ' ') return
              e.preventDefault()
              paint(r.id, e)
            },
          }
        : {}),
    }
    return <El key={r.id} {...props} />
  }

  return (
    <div className="coloring">
      <div className="col-pages" role="tablist" aria-label="اختر الصورة">
        {PAGES.map((p, i) => (
          <button key={p.key} type="button" role="tab" aria-selected={i === page} className={`col-tab ${i === page ? 'on' : ''}`} onClick={() => setPage(i)}>
            {i === 0 ? '💊' : '🛡️'} {p.title}
          </button>
        ))}
      </div>
      <div className="col-body">
        <div className="col-canvas">
          <svg ref={svgRef} viewBox="0 0 220 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label={pg.title}>
            {pg.regions.map((r) => shape(r, mine[r.id] ?? '#ffffff', true))}
            {pg.lines.map((r) => (
              <path key={r.id} d={String(r.p.d)} stroke="#17206b" strokeWidth={7} strokeLinecap="round" fill="none" />
            ))}
            {pg.key === 'kabsool' && (
              <g pointerEvents="none">
                <ellipse cx="94" cy="112" rx="11" ry="13" fill="#fff" stroke="#17206b" strokeWidth="2.5" />
                <ellipse cx="126" cy="112" rx="11" ry="13" fill="#fff" stroke="#17206b" strokeWidth="2.5" />
                <circle cx="96" cy="114" r="6" fill="#17206b" />
                <circle cx="128" cy="114" r="6" fill="#17206b" />
                <circle cx="98" cy="111" r="2" fill="#fff" />
                <circle cx="130" cy="111" r="2" fill="#fff" />
                <path d="M98 138q12 14 24 0" stroke="#17206b" strokeWidth="4" fill="none" strokeLinecap="round" />
              </g>
            )}
          </svg>
        </div>
        <div className="col-palette" role="radiogroup" aria-label="الألوان">
          {PALETTE.map((c, i) => (
            <motion.button
              key={c}
              type="button"
              role="radio"
              aria-checked={i === color}
              aria-label={NAMES[i]}
              className={`swatch ${i === color ? 'on' : ''}`}
              style={{ background: c }}
              onClick={() => {
                setColor(i)
                sfx('click')
              }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>
      </div>
      <div className="col-actions">
        <span className="game-hint">
          لوّنت <b>{ar(coloredCount)}</b> من <b>{ar(pg.regions.length)}</b> أجزاء
        </span>
        <button type="button" className="btn3d small blue" onClick={() => setFills((f) => ({ ...f, [pg.key]: {} }))} disabled={!coloredCount}>
          🧽 امسح
        </button>
        <button type="button" className="btn3d small purple" onClick={save} disabled={!coloredCount}>
          💾 احفظ صورتي
        </button>
        <button
          type="button"
          className="btn3d green ready"
          disabled={coloredCount < need}
          onClick={(e) => {
            api.correct(centerOf(e.currentTarget), { points: 10, say: 'يا لها من لوحة رائعة! 🎨' })
            api.finish(3, 'أنت فنان رائع! 🎨 العب مرة أخرى لتلوّن صورة جديدة.')
          }}
        >
          🎉 انتهيت!
        </button>
      </div>
    </div>
  )
}
