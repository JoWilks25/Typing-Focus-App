import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/fonts.css';
import App from './App';
import { useSessionStore } from './stores/SessionStore';
import { useAppStore } from './stores/AppStore';
import { useEditorStore } from './stores/EditorStore';

// Set up listener for distraction warning check
if (window.api?.onShouldShowDistractionWarning) {
  window.api.onShouldShowDistractionWarning((respond) => {
    const sessionActive = useSessionStore.getState().sessionActive;
    const currentView = useAppStore.getState().currentView;
    const shouldShow = sessionActive && currentView === 'editor';
    respond(shouldShow);
  });
}

// Set up listener for ending session from distraction window
if (window.api?.onEndSessionFromDistraction) {
  window.api.onEndSessionFromDistraction(() => {
    const sessionStore = useSessionStore.getState();
    const editorStore = useEditorStore.getState();
    const appStore = useAppStore.getState();

    if (sessionStore.sessionActive) {
      // Execute the full end session flow
      sessionStore.endSession();
      editorStore.resetEditor();
      appStore.setView('session-summary');
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
