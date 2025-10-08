// src/renderer/src/hooks/useAnimation.ts
// Purpose: Custom hook for animation state and controls

import { useContext } from 'react';
import { AnimationContext, type AnimationContextValue } from '../context/AnimationContext';

export function useAnimation(): AnimationContextValue {
  const context = useContext(AnimationContext);
  
  if (context === undefined) {
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  
  return context;
}
