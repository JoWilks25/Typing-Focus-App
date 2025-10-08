// src/renderer/src/hooks/useWordCount.ts
// Purpose: Hook for goal tracking and typing activity IPC integration (debounced)

import { useEffect, useState } from 'react';
import { calculateWordCount } from '../utils/wordCount';
import { useDebounce } from './useDebounce';

export function useWordCount(text: string, sessionId?: string): number {
  const [wordCount, setWordCount] = useState(0);
  
  // Debounced word count update for goal tracking (500ms)
  const debouncedUpdateWordCount = useDebounce(() => {
    setWordCount(calculateWordCount(text));
  }, 500);
  
  useEffect(() => {
    if (text) {
      debouncedUpdateWordCount();
    }
  }, [text, debouncedUpdateWordCount]);
  
  // Debounced typing activity IPC (500ms)
  const debouncedRecordActivity = useDebounce(() => {
    if (sessionId && text) {
      // Use the existing activity.record IPC to track typing activity
      window.api.activity.record({
        sessionId,
        activity: { 
          type: 'typing', 
          timestamp: Date.now(),
          data: { wordCount: calculateWordCount(text) }
        }
      }).catch((error) => {
        // Silently handle IPC errors to avoid disrupting the user experience
        console.warn('Failed to record typing activity:', error);
      });
    }
  }, 500);
  
  useEffect(() => {
    if (text) {
      debouncedRecordActivity();
    }
  }, [text, debouncedRecordActivity]);
  
  return wordCount;
}
