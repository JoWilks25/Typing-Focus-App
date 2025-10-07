// src/renderer/src/hooks/useSession.ts
// Purpose: Custom hook for session state management

import { useContext } from 'react';
import { SessionContext } from '@renderer/context/SessionContextDef';

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return ctx;
}
