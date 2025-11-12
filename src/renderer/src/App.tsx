// import { Dashboard } from './components/Dashboard/Dashboard';
import { Editor } from './components/Editor/Editor';
import { SessionSummary } from './components/Session/SessionSummary';
import Versions from './components/Versions';
import { AppProvider, ErrorBoundary } from './context/AppContext';
import { useAppState } from './hooks/useAppState';
import { useSession } from './hooks/useSession';
import styles from './App.module.css';
import { useEffect, useState } from 'react';
import logoLight from './assets/logo_light.svg';
import logoDark from './assets/logo_dark.svg';

function AppContent(): React.JSX.Element {
  const { currentView, setView, theme, setTheme } = useAppState();
  const { activeSession } = useSession();
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('dark');

  // Apply theme to root element
  useEffect(() => {
    const root = document.documentElement;
    const getEffectiveTheme = (): 'light' | 'dark' => {
      if (theme === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return theme;
    };

    const currentEffectiveTheme = getEffectiveTheme();
    setEffectiveTheme(currentEffectiveTheme);
    root.setAttribute('data-theme', currentEffectiveTheme);

    // Listen for system theme changes when theme is set to 'system'
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        const newTheme = mediaQuery.matches ? 'dark' : 'light';
        setEffectiveTheme(newTheme);
        root.setAttribute('data-theme', newTheme);
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const handleViewChange = (view: 'dashboard' | 'editor' | 'session-summary') => {
    console.log(`Switching to ${view} view`);
    setView(view);
  };

  const handleThemeToggle = () => {
    if (theme === 'dark') {
      setTheme('light');
    } else if (theme === 'light') {
      setTheme('system');
    } else {
      setTheme('dark');
    }
  };

  const getThemeIcon = () => {
    if (theme === 'dark') return '🌙';
    if (theme === 'light') return '☀️';
    return '💻';
  };

  const getThemeLabel = () => {
    if (theme === 'dark') return 'Dark';
    if (theme === 'light') return 'Light';
    return 'System';
  };


  return (
    <div className={styles['app-container']}>
      {/* Navigation with integrated title */}
      <nav className={styles['navigation']}>
        <div className={styles['nav-content']}>
          {/* Title on the left */}
          <div className={styles['app-title-container']}>
            <img
              src={effectiveTheme === 'dark' ? logoDark : logoLight}
              alt="Draft Tree Logo"
              className={styles['app-logo']}
            />
            <h1 className={styles['app-title']}>
              Draft Tree
            </h1>
            <span className={styles['mvp-badge']}>MVP</span>
          </div>

          {/* Navigation buttons on the right */}
          <div className={styles['nav-buttons']}>
            <button
              onClick={handleThemeToggle}
              className={`${styles['nav-button']} ${styles['nav-button-inactive']}`}
              title={`Theme: ${getThemeLabel()}`}
            >
              <span className={styles['theme-icon']}>{getThemeIcon()}</span>
              <span className={styles['theme-label']}>{getThemeLabel()}</span>
            </button>
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
