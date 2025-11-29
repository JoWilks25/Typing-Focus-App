import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/fonts.css';
import { DistractionWarningWindow } from './screens/SessionModals/DistractionWarningWindow';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DistractionWarningWindow />
  </StrictMode>
);

