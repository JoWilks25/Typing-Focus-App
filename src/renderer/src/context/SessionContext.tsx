// src/renderer/src/context/SessionContext.tsx
// Purpose: Session state management components

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Session } from '@renderer/types/session';
import { SessionContext, type SessionContextValue } from './SessionContextDef';
import { loadSessionState, saveSessionState } from './sessionStorage';
import { useDebounce } from '../hooks/useDebounce';

export function SessionProvider({ children }: { children: React.ReactNode }) {
    const [sessions, setSessions] = useState<Session[]>(() => loadSessionState().sessions);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(
        () => loadSessionState().activeSessionId
    );

    useEffect(() => {
        saveSessionState({ sessions, activeSessionId });
    }, [sessions, activeSessionId]);

    const setActiveSession = useCallback((id: string | null) => setActiveSessionId(id), []);

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

    const reset = useCallback(() => {
        setSessions([]);
        setActiveSessionId(null);
    }, []);

    // Debounced progress update for IPC persistence (30s)
    const debouncedPersistProgress = useDebounce(
        useCallback(async (...args: unknown[]) => {
            const [sessionId, currentWords, timeElapsed, progressThresholds] = args as [string, number, number, { 33: boolean; 67: boolean; 100: boolean }];
            try {
                // Use the new session API if available, otherwise fall back to legacy
                if ((window.api?.session as any)?.updateProgress) {
                    await (window.api.session as any).updateProgress({
                        sessionId,
                        currentWords,
                        timeElapsed,
                        progressThresholds
                    });
                } else {
                    // Fallback: just log for now until the API is fully implemented
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

    const activeSession = useMemo(() => {
        return sessions.find(session => session.id === activeSessionId) || null;
    }, [sessions, activeSessionId]);

    const value = useMemo<SessionContextValue>(
        () => ({
            sessions,
            activeSessionId,
            activeSession,
            setActiveSession,
            addSession,
            updateSession,
            removeSession,
            reset,
            updateProgress
        }),
        [sessions, activeSessionId, activeSession, setActiveSession, addSession, updateSession, removeSession, reset, updateProgress]
    );

    return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
