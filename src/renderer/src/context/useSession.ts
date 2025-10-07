// src/renderer/src/context/useSession.ts
// Purpose: Session context hook

import { useContext } from 'react';
import { SessionContext, type SessionContextValue } from './SessionContextDef';

export function useSession(): SessionContextValue {
    const context = useContext(SessionContext);
    if (context === undefined) {
        throw new Error('useSession must be used within a SessionProvider');
    }
    return context;
}
