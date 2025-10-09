// src/renderer/src/context/AppContext.tsx
// Purpose: Consolidated app and session state management

import { Component, useCallback, useEffect, useMemo, useState } from 'react';
import type { AppState, View } from '@renderer/types/app';
import type { Session } from '@renderer/types/session';
import { AppContext, type AppContextValue } from './AppContextDef';
import { loadAppState, saveAppState } from './appStorage';
import { loadSessionState, saveSessionState } from './sessionStorage';
import { useDebounce } from '../hooks/useDebounce';
import styles from './ErrorBoundary.module.css';

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
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className={styles['error-container']}>
                    <div className={styles['error-content']}>
                        <h2 className={styles['error-title']}>Something went wrong</h2>
                        <p className={styles['error-message']}>Try reloading the app.</p>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
    // App state
    const [appState, setAppState] = useState<AppState>(() => loadAppState());

    // Session state - start with empty sessions, don't load from storage on startup
    const [sessions, setSessions] = useState<Session[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

    // Persist app state
    useEffect(() => {
        saveAppState(appState);
    }, [appState]);

    // Persist session state
    useEffect(() => {
        saveSessionState({ sessions, activeSessionId });
    }, [sessions, activeSessionId]);

    // App state setters
    const setView = useCallback((view: View) => {
        setAppState((prev) => ({ ...prev, currentView: view }));
    }, []);

    const setTheme = useCallback((theme: AppState['theme']) => {
        setAppState((prev) => ({ ...prev, theme }));
    }, []);

    // Session state setters
    const setActiveSession = useCallback((id: string | null) => {
        setActiveSessionId(id);
    }, []);

    const addSession = useCallback((session: Session) => {
        setSessions((prev) => {
            const exists = prev.some((s) => s.id === session.id);
            return exists ? prev : [session, ...prev];
        });
        setActiveSessionId(session.id);
    }, []);

    const updateSession = useCallback((session: Session) => {
        setSessions((prev) => prev.map((s) => (s.id === session.id ? session : s)));
    }, []);

    const removeSession = useCallback((id: string) => {
        setSessions((prev) => prev.filter((s) => s.id !== id));
        setActiveSessionId((prev) => (prev === id ? null : prev));
    }, []);

    const resetSessions = useCallback(() => {
        setSessions([]);
        setActiveSessionId(null);
    }, []);

    const incrementDistraction = useCallback(async (sessionId: string) => {
        try {
            if (window.api?.session) {
                const updatedSession = await window.api.session.incrementDistraction(sessionId);
                updateSession(updatedSession);
            }
        } catch (error) {
            console.warn('Failed to increment distraction count:', error);
        }
    }, [updateSession]);

    // Debounced progress update for IPC persistence (30s)
    const debouncedPersistProgress = useDebounce(
        useCallback(async (...args: unknown[]) => {
            const [sessionId, currentWords, timeElapsed, progressThresholds] = args as [string, number, number, { 33: boolean; 67: boolean; 100: boolean }];
            try {
                if (window.api?.session?.updateProgress) {
                    await window.api.session.updateProgress(sessionId, currentWords, timeElapsed, progressThresholds);
                } else {
                    console.log('Progress update:', { sessionId, currentWords, timeElapsed, progressThresholds });
                }
            } catch (error) {
                console.warn('Failed to persist progress:', error);
            }
        }, []),
        30000 // 30 seconds
    );

    // Update progress with debounced persistence
    const updateProgress = useCallback((currentWords: number, timeElapsed: number, progressThresholds: { 33: boolean; 67: boolean; 100: boolean }) => {
        if (!activeSessionId) return;

        // Update local state immediately
        setSessions(prev => prev.map(session =>
            session.id === activeSessionId
                ? {
                    ...session,
                    currentWords,
                    timeElapsed,
                    progressThresholds,
                    updatedAt: new Date().toISOString()
                }
                : session
        ));

        // Debounced persistence to backend
        debouncedPersistProgress(activeSessionId, currentWords, timeElapsed, progressThresholds);
    }, [activeSessionId, debouncedPersistProgress]);

    // Computed values
    const activeSession = useMemo(() => {
        return sessions.find(session => session.id === activeSessionId) || null;
    }, [sessions, activeSessionId]);

    const value = useMemo<AppContextValue>(
        () => ({
            // App state
            currentView: appState.currentView,
            theme: appState.theme,
            setView,
            setTheme,

            // Session state
            sessions,
            activeSessionId,
            activeSession,
            setActiveSession,
            addSession,
            updateSession,
            removeSession,
            resetSessions,
            updateProgress,
            incrementDistraction
        }),
        [
            appState.currentView,
            appState.theme,
            setView,
            setTheme,
            sessions,
            activeSessionId,
            activeSession,
            setActiveSession,
            addSession,
            updateSession,
            removeSession,
            resetSessions,
            updateProgress,
            incrementDistraction
        ]
    );

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}