import { GameProvider, useGame } from './state/game'
import { ParallaxRoot } from './components/Parallax'
import { CursorSparkles, FlyingStars, TransitionOverlay } from './components/fx'
import { Landing } from './screens/Landing'
import { MissionMap } from './screens/MissionMap'
import { MissionScreen } from './screens/MissionScreen'
import { Final } from './screens/Final'
import { Film } from './screens/Film'
import { Activities } from './screens/Activities'
import { ActivityScreen } from './screens/ActivityScreen'
import type { ActivityId } from './data/activities'

function Screens() {
  const { screen, env } = useGame()
  const parallax = env.finePointer && !env.reducedMotion && !env.lowPower
  return (
    <ParallaxRoot enabled={parallax}>
      <div className={`app ${env.reducedMotion ? 'reduced' : ''}`}>
        {screen.name === 'landing' && <Landing />}
        {screen.name === 'map' && <MissionMap />}
        {screen.name === 'mission' && <MissionScreen key={screen.id} id={screen.id} />}
        {screen.name === 'final' && <Final />}
        {screen.name === 'film' && <Film />}
        {screen.name === 'activities' && <Activities />}
        {screen.name === 'activity' && <ActivityScreen key={screen.id} id={screen.id as ActivityId} />}
      </div>
      <FlyingStars />
      <TransitionOverlay />
      <CursorSparkles />
    </ParallaxRoot>
  )
}

export default function App() {
  return (
    <GameProvider>
      <Screens />
    </GameProvider>
  )
}
