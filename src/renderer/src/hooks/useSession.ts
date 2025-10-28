// src/renderer/src/hooks/useSession.ts
// Purpose: Custom hook for session state management

import { useContext } from 'react';
import { AppContext } from '@renderer/context/AppContextDef';

export function useSession() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useSession must be used within AppProvider');
  }
  
  // Return only session-related properties
  return {
    sessions: ctx.sessions,
    activeSessionId: ctx.activeSessionId,
    activeSession: ctx.activeSession,
    setActiveSession: ctx.setActiveSession,
    addSession: ctx.addSession,
    updateSession: ctx.updateSession,
    removeSession: ctx.removeSession,
    resetSessions: ctx.resetSessions,
    updateProgress: ctx.updateProgress,
    incrementDistraction: ctx.incrementDistraction,
    endSession: ctx.endSession,
    abandonSession: ctx.abandonSession,
    markSessionIncomplete: ctx.markSessionIncomplete,
    pauseSession: ctx.pauseSession,
    resumeSession: ctx.resumeSession
  };
}
