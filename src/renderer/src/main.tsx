import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/fonts.css';
import App from './App';
import { useSessionStore } from './stores/SessionStore';
import { useAppStore } from './stores/AppStore';

// Set up listener for distraction warning check
if (window.api?.onShouldShowDistractionWarning) {
  window.api.onShouldShowDistractionWarning((respond) => {
    const sessionActive = useSessionStore.getState().sessionActive;
    const currentView = useAppStore.getState().currentView;
    const shouldShow = sessionActive && currentView === 'editor';
    respond(shouldShow);
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
