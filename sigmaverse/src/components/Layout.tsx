import { AnimatePresence, motion, MotionConfig } from 'motion/react'
import {
  BookOpen, BookMarked, Calculator, ChartNoAxesColumn, FlaskConical, GraduationCap, Layers, LayoutDashboard,
  Library, Map, Menu, NotebookPen, PanelLeftClose, PanelLeftOpen, Search, Settings, ShieldAlert, Swords, Timer, X,
} from 'lucide-react'
import { Suspense, useEffect, useState, type ReactNode } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useReduced } from '../lib/motion'
import { setSettings, useProfile, update, touch } from '../lib/store'
import { CommandPalette } from './CommandPalette'
import { Celebrations } from './Celebrations'
import { Logo } from './Logo'
import { Kbd } from './ui'

type NavItem = { to: string; label: string; icon: ReactNode; end?: boolean }
const NAV: { group: string; items: NavItem[] }[] = [
  { group: 'Learn', items: [
    { to: '/', label: 'Dashboard', icon: <LayoutDashboard />, end: true },
    { to: '/journey', label: 'Learning Journey', icon: <Map /> },
    { to: '/lessons', label: 'Lessons', icon: <BookOpen /> },
    { to: '/labs', label: 'Interactive Labs', icon: <FlaskConical /> },
    { to: '/formulas', label: 'Formula Master', icon: <Calculator /> },
  ] },
  { group: 'Practise', items: [
    { to: '/traps', label: 'Exam Trap Detector', icon: <ShieldAlert /> },
    { to: '/practice', label: 'Practice Arena', icon: <Swords /> },
    { to: '/mock', label: 'Mock Exam', icon: <Timer /> },
    { to: '/flashcards', label: 'Flashcard Studio', icon: <Layers /> },
    { to: '/glossary', label: 'Glossary', icon: <BookMarked /> },
  ] },
  { group: 'You', items: [
    { to: '/notes', label: 'My Notes', icon: <NotebookPen /> },
    { to: '/progress', label: 'Progress & Analytics', icon: <ChartNoAxesColumn /> },
    { to: '/library', label: 'Reference Library', icon: <Library /> },
    { to: '/settings', label: 'Settings', icon: <Settings /> },
  ] },
]

const MOBILE_TABS: NavItem[] = [
  { to: '/', label: 'Home', icon: <LayoutDashboard />, end: true },
  { to: '/lessons', label: 'Lessons', icon: <BookOpen /> },
  { to: '/practice', label: 'Practice', icon: <Swords /> },
  { to: '/formulas', label: 'Formulas', icon: <Calculator /> },
]

function useThemeClass() {
  const theme = useProfile(p => p.settings.theme)
  const scale = useProfile(p => p.settings.fontScale)
  const reduced = useReduced()
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && mq.matches)
      document.documentElement.classList.toggle('dark', dark)
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0e0d20' : '#f6f5fb')
    }
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [theme])
  useEffect(() => { document.documentElement.style.setProperty('--reading-scale', String(scale)) }, [scale])
  useEffect(() => { document.documentElement.classList.toggle('reduce-motion', reduced) }, [reduced])
}

/** Adds one active minute while the tab is visible and the learner has interacted recently. */
function useActivityClock() {
  useEffect(() => {
    let lastInput = Date.now()
    const mark = () => { lastInput = Date.now() }
    const evs = ['pointerdown', 'keydown', 'scroll', 'wheel'] as const
    evs.forEach(e => window.addEventListener(e, mark, { passive: true }))
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible' && Date.now() - lastInput < 2 * 60 * 1000) update(p => touch(p, 1))
    }, 60_000)
    return () => {
      window.clearInterval(id)
      evs.forEach(e => window.removeEventListener(e, mark))
    }
  }, [])
}

function SideLink({ item, collapsed, onClick }: { item: NavItem; collapsed: boolean; onClick?: () => void }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 rounded-xl px-3 py-2 text-[0.92rem] font-medium transition-colors duration-150 ${
          isActive ? 'bg-surface text-ink shadow-sm' : 'text-ink-2 hover:bg-surface/70 hover:text-ink'
        } ${collapsed ? 'justify-center px-0' : ''}`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-violet" aria-hidden />}
          <span className={`[&>svg]:size-[18px] ${isActive ? 'text-violet' : 'text-ink-3 group-hover:text-ink-2'}`}>{item.icon}</span>
          {!collapsed && <span className="truncate">{item.label}</span>}
        </>
      )}
    </NavLink>
  )
}

export function Layout() {
  useThemeClass()
  useActivityClock()
  const collapsed = useProfile(p => p.settings.sidebarCollapsed)
  const reduced = useReduced()
  const speed = useProfile(p => p.settings.speed)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const loc = useLocation()

  useEffect(() => { setMobileOpen(false); window.scrollTo({ top: 0 }) }, [loc.pathname])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPaletteOpen(o => !o) }
      if (e.key === '/' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) && !(e.target as HTMLElement)?.isContentEditable) { e.preventDefault(); setPaletteOpen(true) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <MotionConfig reducedMotion={reduced ? 'always' : 'never'} transition={{ duration: 0.35 / speed, ease: [0.23, 1, 0.32, 1] }}>
      <a href="#main" className="sr-only z-[100] rounded-lg bg-surface px-3 py-2 focus:not-sr-only focus:fixed focus:left-3 focus:top-3">Skip to content</a>
      <div className="flex min-h-dvh">
        {/* Desktop sidebar */}
        <aside className={`app-sidebar no-print sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-line bg-surface-2/60 backdrop-blur-sm lg:flex ${collapsed ? 'w-[76px]' : 'w-[264px]'} transition-[width] duration-300 ease-[var(--ease-out)]`}>
          <div className={`flex items-center gap-2 px-4 pb-2 pt-5 ${collapsed ? 'justify-center px-2' : ''}`}>
            <Logo compact={collapsed} />
          </div>
          <button onClick={() => setPaletteOpen(true)} className={`mx-3 mt-3 flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink-3 shadow-sm hover:text-ink ${collapsed ? 'justify-center px-0' : ''}`} aria-label="Search lessons, terms and questions">
            <Search className="size-4" />
            {!collapsed && <><span className="flex-1 text-left">Search</span><Kbd>Ctrl K</Kbd></>}
          </button>
          <nav className="mt-3 flex-1 overflow-y-auto px-3 pb-4" aria-label="Main">
            {NAV.map(g => (
              <div key={g.group} className="mt-4 first:mt-1">
                {!collapsed && <div className="px-3 pb-1.5 text-xs font-semibold text-ink-3">{g.group}</div>}
                <div className="flex flex-col gap-0.5">{g.items.map(i => <SideLink key={i.to} item={i} collapsed={collapsed} />)}</div>
              </div>
            ))}
          </nav>
          <div className="border-t border-line p-3">
            <button className={`btn btn-ghost btn-sm w-full ${collapsed ? 'px-0' : 'justify-start'}`} onClick={() => setSettings({ sidebarCollapsed: !collapsed })} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
              {collapsed ? <PanelLeftOpen className="size-4" /> : <><PanelLeftClose className="size-4" /> Collapse</>}
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Mobile top bar */}
          <header className="no-print sticky top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-bg/85 px-4 backdrop-blur-md lg:hidden">
            <button className="btn btn-ghost btn-icon" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu className="size-5" /></button>
            <Logo />
            <button className="btn btn-ghost btn-icon" onClick={() => setPaletteOpen(true)} aria-label="Search"><Search className="size-5" /></button>
          </header>

          <main id="main" className="min-w-0 flex-1 px-4 pb-28 pt-6 sm:px-6 md:px-10 lg:pb-16 lg:pt-10">
            <Suspense fallback={<PageSkeleton />}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={loc.pathname} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: 0.12 } }} className="mx-auto w-full max-w-[1240px]">
                  <Outlet />
                </motion.div>
              </AnimatePresence>
            </Suspense>
          </main>

          {/* Mobile tab bar */}
          <nav className="no-print fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden" aria-label="Quick">
            {MOBILE_TABS.map(t => (
              <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => `flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold ${isActive ? 'text-violet' : 'text-ink-3'}`}>
                <span className="[&>svg]:size-5">{t.icon}</span>{t.label}
              </NavLink>
            ))}
            <button onClick={() => setMobileOpen(true)} className="flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold text-ink-3"><GraduationCap className="size-5" />More</button>
          </nav>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-[2px] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} />
            <motion.aside role="dialog" aria-modal="true" aria-label="Menu" className="fixed inset-y-0 left-0 z-50 flex w-[86vw] max-w-[320px] flex-col bg-bg shadow-lg lg:hidden" initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 32, stiffness: 340 }}>
              <div className="flex items-center justify-between px-4 pt-4">
                <Logo />
                <button className="btn btn-ghost btn-icon" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X className="size-5" /></button>
              </div>
              <nav className="flex-1 overflow-y-auto px-3 pb-6" aria-label="Main mobile">
                {NAV.map(g => (
                  <div key={g.group} className="mt-5">
                    <div className="px-3 pb-1.5 text-xs font-semibold text-ink-3">{g.group}</div>
                    <div className="flex flex-col gap-0.5">{g.items.map(i => <SideLink key={i.to} item={i} collapsed={false} onClick={() => setMobileOpen(false)} />)}</div>
                  </div>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <Celebrations />
    </MotionConfig>
  )
}

export function PageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1240px] animate-pulse" aria-busy="true" aria-label="Loading">
      <div className="h-9 w-72 rounded-xl bg-surface-3" />
      <div className="mt-4 h-4 w-[28rem] max-w-full rounded bg-surface-3" />
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        <div className="h-40 rounded-2xl bg-surface-3" /><div className="h-40 rounded-2xl bg-surface-3" /><div className="h-40 rounded-2xl bg-surface-3" />
      </div>
    </div>
  )
}
