// src/renderer/src/hooks/useSessionProgress.ts
// Purpose: Comprehensive hook that combines word count, timer, and progress tracking

import { useEffect, useMemo } from 'react';
import { useSession } from '../context/useSession';
import { useAnimation } from './useAnimation';
import { useTimer } from './useTimer';
import { useProgress } from './useProgress';
import { calculateWordCount } from '../utils/wordCount';

export interface SessionProgressState {
  // Word count
  currentWords: number;
  
  // Timer
  timeElapsed: number;
  formattedTime: string;
  isTimerRunning: boolean;
  
  // Progress
  progress: number;
  hasReached33: boolean;
  hasReached67: boolean;
  hasReached100: boolean;
  
  // Animation
  animationState: 'idle' | 'low' | 'medium' | 'high' | 'complete';
  
  // Session info
  goalType: 'word' | 'time';
  goalValue: number;
  sessionId: string | null;
}

export interface UseSessionProgressOptions {
  text: string;
  isFocused?: boolean;
}

/**
 * Comprehensive hook that manages session progress tracking
 * Combines word count, timer, progress calculation, and animation state
 */
export function useSessionProgress(options: UseSessionProgressOptions): SessionProgressState {
  const { text, isFocused = true } = options;
  const { activeSession } = useSession();
  const { onThresholdCrossed, setProgressThresholds } = useAnimation();

  // Calculate current word count
  const currentWords = useMemo(() => calculateWordCount(text), [text]);

  // Timer hook
  const timerState = useTimer({
    sessionStartTime: activeSession?.startTime,
    isSessionActive: activeSession?.status === 'active',
    isFocused,
  });

  // Progress calculation
  const progressState = useProgress({
    currentWords,
    timeElapsed: timerState.timeElapsed,
    goalType: activeSession?.goalType || 'word',
    goalValue: activeSession?.goalValue || 500,
    progressThresholds: activeSession?.progressThresholds || { 33: false, 67: false, 100: false },
    onThresholdCrossed: (threshold) => {
      // Update animation context only - no session updates to avoid editor interference
      onThresholdCrossed(threshold);
      
      // Log threshold crossing for debugging
      console.log(`Threshold ${threshold}% crossed!`, {
        currentWords,
        timeElapsed: timerState.timeElapsed,
        progress: progressState.progress
      });
    }
  });

  // Initialize animation thresholds from session
  useEffect(() => {
    if (activeSession?.progressThresholds) {
      setProgressThresholds(activeSession.progressThresholds);
    }
  }, [activeSession?.progressThresholds, setProgressThresholds]);

  // Debounced progress update (2000ms for local state updates)
  // Progress updates are now handled separately via intervals in the Editor component
  // This hook is now focused on providing real-time display data only

  return {
    currentWords,
    timeElapsed: timerState.timeElapsed,
    formattedTime: timerState.formattedTime,
    isTimerRunning: timerState.isRunning,
    progress: progressState.progress,
    hasReached33: progressState.hasReached33,
    hasReached67: progressState.hasReached67,
    hasReached100: progressState.hasReached100,
    animationState: useAnimation().animationState,
    goalType: activeSession?.goalType || 'word',
    goalValue: activeSession?.goalValue || 500,
    sessionId: activeSession?.id || null
  };
}
