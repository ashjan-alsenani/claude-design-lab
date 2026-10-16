import { lazy } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Layout } from './components/Layout'
import { NotFound } from './pages/NotFound'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const Journey = lazy(() => import('./pages/Journey'))
const Lessons = lazy(() => import('./pages/Lessons'))
const LessonReader = lazy(() => import('./pages/LessonReader'))
const Labs = lazy(() => import('./pages/Labs'))
const LabPage = lazy(() => import('./pages/LabPage'))
const Formulas = lazy(() => import('./pages/Formulas'))
const FormulaScreen = lazy(() => import('./pages/FormulaScreen'))
const Traps = lazy(() => import('./pages/Traps'))
const Practice = lazy(() => import('./pages/Practice'))
const QuestionPage = lazy(() => import('./pages/QuestionPage'))
const Mock = lazy(() => import('./pages/Mock'))
const Flashcards = lazy(() => import('./pages/Flashcards'))
const Glossary = lazy(() => import('./pages/Glossary'))
const Notes = lazy(() => import('./pages/Notes'))
const Progress = lazy(() => import('./pages/Progress'))
const Library = lazy(() => import('./pages/Library'))
const Settings = lazy(() => import('./pages/Settings'))

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'journey', element: <Journey /> },
      { path: 'lessons', element: <Lessons /> },
      { path: 'lessons/:id', element: <LessonReader /> },
      { path: 'labs', element: <Labs /> },
      { path: 'labs/:key', element: <LabPage /> },
      { path: 'formulas', element: <Formulas /> },
      { path: 'formulas/:id', element: <FormulaScreen /> },
      { path: 'traps', element: <Traps /> },
      { path: 'practice', element: <Practice /> },
      { path: 'practice/question/:id', element: <QuestionPage /> },
      { path: 'mock', element: <Mock /> },
      { path: 'flashcards', element: <Flashcards /> },
      { path: 'glossary', element: <Glossary /> },
      { path: 'notes', element: <Notes /> },
      { path: 'progress', element: <Progress /> },
      { path: 'library', element: <Library /> },
      { path: 'settings', element: <Settings /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])

export function App() {
  return <RouterProvider router={router} />
}
