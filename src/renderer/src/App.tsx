// import { Dashboard } from './components/Dashboard/Dashboard';
import { Editor } from './components/Editor/Editor';
import { SessionSummary } from './components/Session/SessionSummary';
import Versions from './components/Versions';
import { AppProvider, ErrorBoundary } from './context/AppContext';
import { useAppState } from './hooks/useAppState';
import { useSession } from './hooks/useSession';
import styles from './App.module.css';

function AppContent(): React.JSX.Element {
  const { currentView, setView } = useAppState();
  const { activeSession } = useSession();

  const handleViewChange = (view: 'dashboard' | 'editor' | 'session-summary') => {
    console.log(`Switching to ${view} view`);
    setView(view);
  };


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
              onClick={() => handleViewChange('editor')}
              className={`${styles['nav-button']} ${currentView === 'editor'
                ? styles['nav-button-active']
                : styles['nav-button-inactive']
                }`}
              title="Editor View"
            >
              Editor View
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className={styles['main-content']}>
        {/* {currentView === 'dashboard' && <Dashboard />} */}
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
        <AppContent />
      </ErrorBoundary>
    </AppProvider>
  );
}

export default App;
