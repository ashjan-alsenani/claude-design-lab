import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/baloo-bhaijaan-2/arabic-500.css'
import '@fontsource/baloo-bhaijaan-2/arabic-700.css'
import '@fontsource/baloo-bhaijaan-2/arabic-800.css'
import '@fontsource/baloo-bhaijaan-2/latin-700.css'
import './styles/global.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
