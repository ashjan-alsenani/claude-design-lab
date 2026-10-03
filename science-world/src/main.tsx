import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { learner } from './data/learner';
import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/activities.css';
import './styles/pages.css';
import './styles/practice.css';
import './styles/explain.css';

document.title = `مغامرة ${learner.name} مع نوري`;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
