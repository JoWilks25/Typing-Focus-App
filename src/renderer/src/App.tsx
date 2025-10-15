// import { Dashboard } from './components/Dashboard/Dashboard';
import { Editor } from './components/Editor/Editor';
import { SessionSetup } from './components/Session/SessionSetup';
import { SessionSummary } from './components/Session/SessionSummary';
import Versions from './components/Versions';
import { AppProvider, ErrorBoundary } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import { useAppState } from './hooks/useAppState';
import { useSession } from './hooks/useSession';
import styles from './App.module.css';

function AppContent(): React.JSX.Element {
  const { currentView, setView } = useAppState();
  const { activeSession } = useSession();

  const handleViewChange = (view: 'dashboard' | 'editor' | 'session-setup' | 'session-summary') => {
    console.log(`Switching to ${view} view`);
    setView(view);
  };

  // Check if user is in an active session in the editor
  const isInActiveEditorSession = currentView === 'editor' && !!activeSession;

  return (
    <div className={styles['app-container']}>
      {/* Navigation with integrated title */}
      <nav className={styles['navigation']}>
        <div className={styles['nav-content']}>
          {/* Title on the left */}
          <div className={styles['app-title-container']}>
            <h1 className={styles['app-title']}>
              Draft Tree
            </h1>
            <span className={styles['mvp-badge']}>MVP</span>
          </div>

          {/* Navigation buttons on the right */}
          <div className={styles['nav-buttons']}>
            <button
              onClick={() => !isInActiveEditorSession && handleViewChange('session-setup')}
              disabled={isInActiveEditorSession}
              className={`${styles['nav-button']} ${isInActiveEditorSession
                ? styles['nav-button-disabled']
                : currentView === 'session-setup'
                  ? styles['nav-button-active']
                  : styles['nav-button-inactive']
                }`}
              title={isInActiveEditorSession ? 'Finish your session to start a new one' : 'New Session'}
            >
              New Session
            </button>
            <button
              onClick={() => activeSession && handleViewChange('editor')}
              disabled={!activeSession}
              className={`${styles['nav-button']} ${!activeSession
                ? styles['nav-button-disabled']
                : currentView === 'editor'
                  ? styles['nav-button-active']
                  : styles['nav-button-inactive']
                }`}
              title={!activeSession ? 'Start a session to access the editor' : 'Editor View'}
            >
              Editor View
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className={styles['main-content']}>
        {/* {currentView === 'dashboard' && <Dashboard />} */}
        {currentView === 'session-setup' && <SessionSetup />}
        {currentView === 'editor' && <Editor />}
        {currentView === 'session-summary' && <SessionSummary />}
      </main>

      {/* Footer with Versions */}
      <footer className={styles['footer']}>
        <Versions />
      </footer>
    </div>
  );
}

function App(): React.JSX.Element {
  return (
    <AppProvider>
      <ErrorBoundary>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </ErrorBoundary>
    </AppProvider>
  );
}

export default App;
