// src/renderer/src/context/AppContextDef.ts
// Purpose: Consolidated app and session context definition and types

import { createContext } from 'react';
import type { AppState, View } from '@renderer/types/app';
import type { Session } from '@renderer/types/session';

export interface AppContextValue extends AppState {
    // App state setters
    setView: (view: View) => void;
    setTheme: (theme: AppState['theme']) => void;
    
    // Session state
    sessions: Session[];
    activeSessionId: string | null;
    activeSession: Session | null;
    
    // Session state setters
    setActiveSession: (id: string | null) => void;
    addSession: (session: Session) => void;
    updateSession: (session: Session) => void;
    removeSession: (id: string) => void;
    resetSessions: () => void;
    updateProgress: (currentWords: number, timeElapsed: number, progressThresholds: { 33: boolean; 67: boolean; 100: boolean }) => void;
}

export const AppContext = createContext<AppContextValue | undefined>(undefined);
