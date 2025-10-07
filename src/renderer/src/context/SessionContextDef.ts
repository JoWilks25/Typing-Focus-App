// src/renderer/src/context/SessionContext.ts
// Purpose: Session context definition and types

import { createContext } from 'react';
import type { SessionState, Session } from '@renderer/types/session';

export interface SessionContextValue extends SessionState {
    activeSession: Session | null;
    setActiveSession: (id: string | null) => void;
    addSession: (session: Session) => void;
    updateSession: (session: Session) => void;
    removeSession: (id: string) => void;
    reset: () => void;
}

export const SessionContext = createContext<SessionContextValue | undefined>(undefined);
