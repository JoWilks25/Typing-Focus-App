// src/renderer/src/context/SessionContext.tsx
// Purpose: Session state management components

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Session } from '@renderer/types/session';
import { SessionContext, type SessionContextValue } from './SessionContextDef';
import { loadSessionState, saveSessionState } from './sessionStorage';

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
            reset
        }),
        [sessions, activeSessionId, activeSession, setActiveSession, addSession, updateSession, removeSession, reset]
    );

    return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
