// src/renderer/src/context/SessionContext.tsx
// Purpose: Session state management with localStorage persistence

import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import type { SessionState, Session } from '@renderer/types/session';

const STORAGE_KEY = 'tfa:sessionState:v1';

export interface SessionContextValue extends SessionState {
    setActiveSession: (id: string | null) => void;
    addSession: (session: Session) => void;
    updateSession: (session: Session) => void;
    removeSession: (id: string) => void;
    reset: () => void;
}

export const SessionContext = createContext<SessionContextValue | undefined>(undefined);

function load(): SessionState {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return { sessions: [], activeSessionId: null };
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return { sessions: [], activeSessionId: null };
        return {
            sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
            activeSessionId:
                typeof parsed.activeSessionId === 'string' || parsed.activeSessionId === null
                    ? parsed.activeSessionId
                    : null
        };
    } catch {
        return { sessions: [], activeSessionId: null };
    }
}

function save(state: SessionState) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
        // ignore write errors
    }
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
    const [sessions, setSessions] = useState<Session[]>(() => load().sessions);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(
        () => load().activeSessionId
    );

    useEffect(() => {
        save({ sessions, activeSessionId });
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

    const value = useMemo<SessionContextValue>(
        () => ({
            sessions,
            activeSessionId,
            setActiveSession,
            addSession,
            updateSession,
            removeSession,
            reset
        }),
        [sessions, activeSessionId, setActiveSession, addSession, updateSession, removeSession, reset]
    );

    return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

