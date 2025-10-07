// src/renderer/src/hooks/useDebounce.ts
// Purpose: Debounce hook for performance optimization

import { useCallback, useRef } from 'react';

// Declare global timer functions for TypeScript
declare const clearTimeout: (id: NodeJS.Timeout) => void;
declare const setTimeout: (callback: () => void, delay: number) => NodeJS.Timeout;

export function useDebounce<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;

  return debouncedCallback;
}
