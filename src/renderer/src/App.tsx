import { Dashboard } from './components/Dashboard/Dashboard';
import { Editor } from './components/Editor/Editor';
import { SessionSetup } from './components/Session/SessionSetup';
import Versions from './components/Versions';
import { AppProvider, ErrorBoundary } from './context/AppContext';
import { SessionProvider } from './context/SessionContext';
import { AnimationProvider } from './context/AnimationContext';
import { useAppState } from './hooks/useAppState';

function AppContent(): React.JSX.Element {
  const { currentView, setView } = useAppState();

  const handleViewChange = (view: 'dashboard' | 'editor' | 'session-setup') => {
    console.log(`Switching to ${view} view`);
    setView(view);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 py-4 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Focus Writer
          </h1>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700 py-3 px-6">
        <div className="max-w-7xl mx-auto flex justify-center gap-4">
          <button
            onClick={() => handleViewChange('dashboard')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${currentView === 'dashboard'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
          >
            Dashboard View
          </button>
          <button
            onClick={() => handleViewChange('session-setup')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${currentView === 'session-setup'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
          >
            New Session
          </button>
          <button
            onClick={() => handleViewChange('editor')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${currentView === 'editor'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
          >
            Editor View
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-6">
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'session-setup' && <SessionSetup />}
        {currentView === 'editor' && <Editor />}
      </main>

      {/* Footer with Versions */}
      <footer className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 py-2">
        <Versions />
      </footer>
    </div>
  );
}

function App(): React.JSX.Element {
  return (
    <AppProvider>
      <SessionProvider>
        <AnimationProvider>
          <ErrorBoundary>
            <AppContent />
          </ErrorBoundary>
        </AnimationProvider>
      </SessionProvider>
    </AppProvider>
  );
}

export default App;
