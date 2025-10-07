// src/renderer/src/context/AppContext.tsx
// Purpose: App state management components

import { Component, useEffect, useMemo, useState } from 'react';
import type { AppState, View } from '@renderer/types/app';
import { AppContext, type AppContextValue } from './AppContextDef';
import { loadAppState, saveAppState } from './appStorage';

export class ErrorBoundary extends Component<
    { children: React.ReactNode },
    { hasError: boolean }
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Optional: log error to a service
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex items-center justify-center min-h-screen bg-gray-900">
                    <div className="p-6 bg-gray-800 border border-red-500 rounded-lg">
                        <h2 className="text-xl font-bold text-red-400 mb-2">Something went wrong</h2>
                        <p className="text-gray-300">Try reloading the app.</p>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<AppState>(() => loadAppState());

    useEffect(() => {
        saveAppState(state);
    }, [state]);

    const setView = (view: View) => setState((prev) => ({ ...prev, currentView: view }));
    const setTheme = (theme: AppState['theme']) => setState((prev) => ({ ...prev, theme }));

    const value = useMemo<AppContextValue>(
        () => ({
            currentView: state.currentView,
            theme: state.theme,
            setView,
            setTheme
        }),
        [state.currentView, state.theme]
    );

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

