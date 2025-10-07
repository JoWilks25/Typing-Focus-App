// src/renderer/src/hooks/useAppState.ts
// Purpose: Custom hook for app state management

import { useContext } from 'react';
import { AppContext } from '@renderer/context/AppContext';

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppState must be used within AppProvider');
  }
  return ctx;
}

