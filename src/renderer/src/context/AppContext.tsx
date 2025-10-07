// src/renderer/src/context/AppContext.tsx
// Purpose: App state management with localStorage persistence

import { Component, createContext, useEffect, useMemo, useState } from 'react';
import type { AppState, View } from '@renderer/types/app';

const STORAGE_KEY = 'tfa:appState:v1';

export interface AppContextValue extends AppState {
    setView: (view: View) => void;
    setTheme: (theme: AppState['theme']) => void;
}

export const AppContext = createContext<AppContextValue | undefined>(undefined);

function load(): AppState {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return { currentView: 'dashboard', theme: 'dark' };
        const parsed = JSON.parse(raw);
        return {
            currentView: parsed?.currentView === 'editor' ? 'editor' : 'dashboard',
            theme: parsed?.theme === 'light' || parsed?.theme === 'system' ? parsed.theme : 'dark'
        };
    } catch {
        return { currentView: 'dashboard', theme: 'dark' };
    }
}

function save(state: AppState) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
        // ignore
    }
}

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
    const [state, setState] = useState<AppState>(() => load());

    useEffect(() => {
        save(state);
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

