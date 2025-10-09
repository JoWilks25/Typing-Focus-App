import { Dashboard } from './components/Dashboard/Dashboard';
import { Editor } from './components/Editor/Editor';
import { SessionSetup } from './components/Session/SessionSetup';
import { SessionSummary } from './components/Session/SessionSummary';
import { TreeAnimation } from './components/Animation/TreeAnimation';
import Versions from './components/Versions';
import { AppProvider, ErrorBoundary } from './context/AppContext';
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

  // Calculate tree animation progress from active session
  const calculateTreeProgress = (): { progress: number; isWilting: boolean } => {
    if (!activeSession) {
      return { progress: 0, isWilting: false };
    }

    const isWilting = activeSession.isAbandoned || activeSession.status === 'abandoned';

    if (isWilting) {
      // For abandoned sessions, show wilting state
      return { progress: 0, isWilting: true };
    }

    // Calculate progress based on goal type
    if (activeSession.goalType === 'word' && activeSession.goalValue > 0) {
      const currentWords = activeSession.currentWords || 0;
      const progress = Math.min((currentWords / activeSession.goalValue) * 100, 100);
      return { progress, isWilting: false };
    } else if (activeSession.goalType === 'time' && activeSession.goalValue > 0) {
      const timeElapsed = activeSession.timeElapsed || 0;
      const progress = Math.min((timeElapsed / activeSession.goalValue) * 100, 100);
      return { progress, isWilting: false };
    }

    return { progress: 0, isWilting: false };
  };

  const { progress, isWilting } = calculateTreeProgress();

  return (
    <div className={styles['app-container']}>
      {/* Header */}
      <header className={styles['header']}>
        <div className={styles['header-content']}>
          <h1 className={styles['app-title']}>
            Focus Writer
          </h1>
        </div>
      </header>

      {/* Navigation */}
      <nav className={styles['navigation']}>
        <div className={styles['nav-content']}>
          <button
            onClick={() => handleViewChange('dashboard')}
            className={`${styles['nav-button']} ${currentView === 'dashboard'
              ? styles['nav-button-active']
              : styles['nav-button-inactive']
              }`}
          >
            Dashboard View
          </button>
          <button
            onClick={() => handleViewChange('session-setup')}
            className={`${styles['nav-button']} ${currentView === 'session-setup'
              ? styles['nav-button-active']
              : styles['nav-button-inactive']
              }`}
          >
            New Session
          </button>
          <button
            onClick={() => handleViewChange('editor')}
            className={`${styles['nav-button']} ${currentView === 'editor'
              ? styles['nav-button-active']
              : styles['nav-button-inactive']
              }`}
          >
            Editor View
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className={styles['main-content']}>
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'session-setup' && <SessionSetup />}
        {currentView === 'editor' && <Editor />}
        {currentView === 'session-summary' && activeSession && <SessionSummary session={activeSession} />}
      </main>

      {/* Footer with Versions */}
      <footer className={styles['footer']}>
        <Versions />
      </footer>

      {/* Tree Animation - only show when there's an active session */}
      {activeSession && (
        <TreeAnimation
          progress={progress}
          isWilting={isWilting}
        />
      )}
    </div>
  );
}

function App(): React.JSX.Element {
  return (
    <AppProvider>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </AppProvider>
  );
}

export default App;
