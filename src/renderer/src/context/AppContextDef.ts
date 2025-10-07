// src/renderer/src/context/AppContext.ts
// Purpose: App context definition and types

import { createContext } from 'react';
import type { AppState, View } from '@renderer/types/app';

export interface AppContextValue extends AppState {
    setView: (view: View) => void;
    setTheme: (theme: AppState['theme']) => void;
}

export const AppContext = createContext<AppContextValue | undefined>(undefined);
