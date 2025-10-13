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

    // Session state
    const [sessions, setSessions] = useState<Session[]>(() => loadSessionState().sessions);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null); // Start with null, will be set after validation

    // Persist app state
    useEffect(() => {
        saveAppState(appState);
    }, [appState]);

    // Validate active session on startup
    useEffect(() => {
        const validateActiveSession = async () => {
            const storedState = loadSessionState();
            console.log('App startup - checking stored session state:', {
                hasActiveSessionId: !!storedState.activeSessionId,
                activeSessionId: storedState.activeSessionId,
                sessionCount: storedState.sessions.length
            });

            if (storedState.activeSessionId) {
                try {
                    // Check if the stored active session is actually still active in the backend
                    const backendActiveSession = await window.api.session.getActive();
                    console.log('Backend active session check:', {
                        hasBackendSession: !!backendActiveSession,
                        backendSessionId: backendActiveSession?.id,
                        storedSessionId: storedState.activeSessionId,
                        matches: backendActiveSession?.id === storedState.activeSessionId
                    });

                    if (backendActiveSession && backendActiveSession.id === storedState.activeSessionId) {
                        // Backend confirms this session is still active
                        setActiveSessionId(storedState.activeSessionId);
                        console.log('✅ Validated active session from storage:', storedState.activeSessionId);
                    } else {
                        // Backend says no active session, clear localStorage
                        console.log('❌ Stored active session is no longer active in backend, clearing state');
                        setActiveSessionId(null);
                        saveSessionState({ sessions: storedState.sessions, activeSessionId: null });
                    }
                } catch (error) {
                    console.warn('Failed to validate active session:', error);
                    // On error, clear the active session to be safe
                    setActiveSessionId(null);
                    saveSessionState({ sessions: storedState.sessions, activeSessionId: null });
                }
            } else {
                console.log('No stored active session found');
            }
        };

        validateActiveSession();
    }, []); // Run once on mount

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

    const endSession = useCallback(async (sessionId: string, finalContent: string, finalWordCount: number): Promise<Session> => {
        try {
            if (window.api?.session) {
                // Just persist to backend and clear active session - NO React state update
                const endedSession = await (window.api.session as unknown as { end: (id: string, content: string, wordCount: number) => Promise<Session> }).end(sessionId, finalContent, finalWordCount);
                setActiveSessionId(null); // Clear active session only
                // NO updateSession() call - backend persisted, SessionSummary will fetch
                return endedSession;
            }
            throw new Error('Session API not available');
        } catch (error) {
            console.warn('Failed to end session:', error);
            throw error;
        }
    }, []); // Remove updateSession dependency

    const abandonSession = useCallback(async (sessionId: string): Promise<Session> => {
        try {
            if (window.api?.session) {
                // Abandon session and clear active session state
                const abandonedSession = await (window.api.session as unknown as { abandon: (id: string) => Promise<Session> }).abandon(sessionId);
                setActiveSessionId(null); // Clear active session only
                return abandonedSession;
            }
            throw new Error('Session API not available');
        } catch (error) {
            console.warn('Failed to abandon session:', error);
            throw error;
        }
    }, []);

    // Debounced progress update for IPC persistence (30s)
    const debouncedPersistProgress = useDebounce(
        useCallback(async (...args: unknown[]) => {
            const [sessionId, currentWords, timeElapsed, progressPercentage] = args as [string, number, number, number];
            try {
                if (window.api?.session?.updateProgress) {
                    await window.api.session.updateProgress(sessionId, currentWords, timeElapsed, progressPercentage);
                } else {
                    console.log('Progress update:', { sessionId, currentWords, timeElapsed, progressPercentage });
                }
            } catch (error) {
                console.warn('Failed to persist progress:', error);
            }
        }, []),
        30000 // 30 seconds
    );

    // Update progress with debounced persistence
    const updateProgress = useCallback((currentWords: number, timeElapsed: number, progressPercentage: number) => {
        if (!activeSessionId) return;

        // Update local state immediately
        setSessions(prev => prev.map(session =>
            session.id === activeSessionId
                ? {
                    ...session,
                    currentWords,
                    timeElapsed,
                    progressPercentage,
                    updatedAt: new Date().toISOString()
                }
                : session
        ));

        // Debounced persistence to backend
        debouncedPersistProgress(activeSessionId, currentWords, timeElapsed, progressPercentage);
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
            incrementDistraction,
            endSession,
            abandonSession
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
            incrementDistraction,
            endSession,
            abandonSession
        ]
    );

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}