import { Suspense, useEffect } from 'react';
import { HashRouter, Route, Routes, useLocation } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { ProgressProvider, useProgress } from './state/ProgressContext';
import { PracticeProvider } from './practice/store';
import { TopBar } from './components/TopBar';
import { Navigation } from './components/Navigation';
import { AchievementPopup } from './components/AchievementPopup';
import { SkyBackground } from './components/SkyBackground';
import { Mascot } from './components/Mascot';
import { HomePage } from './pages/HomePage';
import { PageErrorBoundary } from './components/PageErrorBoundary';
import { lazyPage, reloadOnStaleAssets } from './lib/lazyPage';

reloadOnStaleAssets();

// Pages beyond the home screen load on demand to keep the first visit fast.
const JourneyPage = lazyPage(() => import('./pages/JourneyPage').then((m) => ({ default: m.JourneyPage })));
const LessonsPage = lazyPage(() => import('./pages/LessonsPage').then((m) => ({ default: m.LessonsPage })));
const LessonPage = lazyPage(() => import('./pages/LessonPage').then((m) => ({ default: m.LessonPage })));
const UnitQuizPage = lazyPage(() => import('./pages/UnitQuizPage').then((m) => ({ default: m.UnitQuizPage })));
const BossPage = lazyPage(() => import('./pages/BossPage').then((m) => ({ default: m.BossPage })));
const UnitCompletePage = lazyPage(() => import('./pages/UnitCompletePage').then((m) => ({ default: m.UnitCompletePage })));
const GamesPage = lazyPage(() => import('./pages/GamesPage').then((m) => ({ default: m.GamesPage })));
const ChallengesPage = lazyPage(() => import('./pages/ChallengesPage').then((m) => ({ default: m.ChallengesPage })));
const RewardsPage = lazyPage(() => import('./pages/RewardsPage').then((m) => ({ default: m.RewardsPage })));
const ProgressPage = lazyPage(() => import('./pages/ProgressPage').then((m) => ({ default: m.ProgressPage })));
const PracticeHomePage = lazyPage(() => import('./pages/practice/PracticeHomePage').then((m) => ({ default: m.PracticeHomePage })));
const PracticeSubjectPage = lazyPage(() => import('./pages/practice/PracticeSubjectPage').then((m) => ({ default: m.PracticeSubjectPage })));
const PracticeUnitPage = lazyPage(() => import('./pages/practice/PracticeUnitPage').then((m) => ({ default: m.PracticeUnitPage })));
const PracticeRunPage = lazyPage(() => import('./pages/practice/PracticeRunPage').then((m) => ({ default: m.PracticeRunPage })));
const PracticeMistakesPage = lazyPage(() => import('./pages/practice/PracticeMistakesPage').then((m) => ({ default: m.PracticeMistakesPage })));
const PracticeWordsPage = lazyPage(() => import('./pages/practice/PracticeWordsPage').then((m) => ({ default: m.PracticeWordsPage })));
const ExplainPage = lazyPage(() => import('./pages/ExplainPage').then((m) => ({ default: m.ExplainPage })));
const GlossaryPage = lazyPage(() => import('./pages/GlossaryPage').then((m) => ({ default: m.GlossaryPage })));

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
}

function Loading() {
  return (
    <div className="loading" role="status">
      <Mascot mood="thinking" size={90} />
      <span>لحظة… نوري يجهّز المغامرة</span>
    </div>
  );
}

function Shell() {
  const location = useLocation();
  const { pathname } = location;
  // lesson & challenge screens are focused: no bottom navigation
  const focused = /^\/(lesson|quiz|boss|explain)\//.test(pathname) || /^\/practice\/(words$|[^/]+\/[^/]+\/run)/.test(pathname);
  const { state } = useProgress();
  return (
    <div className={`app ${focused ? 'app--focused' : ''}`} data-subject={state.subject}>
      <SkyBackground />
      {!focused && <TopBar />}
      <main id="main" className="app__main">
        <PageErrorBoundary key={location.key}>
        <Suspense fallback={<Loading />}>
          <Routes key={location.key}>
            <Route path="/" element={<HomePage />} />
            <Route path="/journey" element={<JourneyPage />} />
            <Route path="/lessons" element={<LessonsPage />} />
            <Route path="/lesson/:id" element={<LessonPage />} />
            <Route path="/quiz/:unitId" element={<UnitQuizPage />} />
            <Route path="/boss/:unitId" element={<BossPage />} />
            <Route path="/complete/:unitId" element={<UnitCompletePage />} />
            <Route path="/games" element={<GamesPage />} />
            <Route path="/games/glossary" element={<GlossaryPage />} />
            <Route path="/challenges" element={<ChallengesPage />} />
            <Route path="/rewards" element={<RewardsPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/explain/:lessonId" element={<ExplainPage />} />
            <Route path="/practice" element={<PracticeHomePage />} />
            <Route path="/practice/mistakes" element={<PracticeMistakesPage />} />
            <Route path="/practice/words" element={<PracticeWordsPage />} />
            <Route path="/practice/:subject" element={<PracticeSubjectPage />} />
            <Route path="/practice/:subject/:unit" element={<PracticeUnitPage />} />
            <Route path="/practice/:subject/:unit/run" element={<PracticeRunPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </Suspense>
        </PageErrorBoundary>
      </main>
      {!focused && <Navigation variant="bottom" />}
      <AchievementPopup />
    </div>
  );
}

export function App() {
  return (
    <ProgressProvider>
      <MotionConfig reducedMotion="user">
        <HashRouter>
          <ScrollTop />
          <PracticeProvider>
            <Shell />
          </PracticeProvider>
        </HashRouter>
      </MotionConfig>
    </ProgressProvider>
  );
}
