// src/renderer/src/context/sessionStorage.ts
// Purpose: Session state storage utilities

import type { SessionState } from '@renderer/types/session';

const STORAGE_KEY = 'tfa:sessionState:v1';

export function loadSessionState(): SessionState {
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

export function saveSessionState(state: SessionState) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
        // ignore write errors
    }
}
