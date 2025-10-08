// src/renderer/src/hooks/useProgress.ts
// Purpose: Hook for calculating progress and detecting threshold crossings

import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { GoalType } from '../../../shared/types/validation';

export interface ProgressState {
  progress: number; // 0-100
  hasReached33: boolean;
  hasReached67: boolean;
  hasReached100: boolean;
  thresholdCrossed: number | null; // Latest threshold that was crossed
}

export interface UseProgressOptions {
  currentWords: number;
  timeElapsed: number; // in milliseconds
  goalType: GoalType;
  goalValue: number;
  progressThresholds?: {
    33: boolean;
    67: boolean;
    100: boolean;
  };
  onThresholdCrossed?: (threshold: number) => void;
}

/**
 * Hook for calculating progress and detecting threshold crossings
 * @param options Configuration options for progress calculation
 * @returns Progress state and threshold information
 */
export function useProgress(options: UseProgressOptions): ProgressState {
  const {
    currentWords,
    timeElapsed,
    goalType,
    goalValue,
    progressThresholds = { 33: false, 67: false, 100: false },
    onThresholdCrossed
  } = options;

  const lastThresholdRef = useRef<number | null>(null);

  // Calculate progress percentage based on goal type
  const progress = useMemo(() => {
    if (goalValue <= 0) return 0;

    let calculatedProgress: number;

    if (goalType === 'word') {
      calculatedProgress = (currentWords / goalValue) * 100;
    } else {
      // Time goal: goalValue is in minutes, timeElapsed is in milliseconds
      const goalTimeMs = goalValue * 60 * 1000;
      calculatedProgress = (timeElapsed / goalTimeMs) * 100;
    }

    // Clamp to 0-100 range
    return Math.min(100, Math.max(0, calculatedProgress));
  }, [currentWords, timeElapsed, goalType, goalValue]);

  // Detect threshold crossings
  const detectThresholdCrossings = useCallback(() => {
    const thresholds = [33, 67, 100];
    let crossedThreshold: number | null = null;

    for (const threshold of thresholds) {
      if (progress >= threshold && !progressThresholds[threshold as keyof typeof progressThresholds]) {
        crossedThreshold = threshold;
        break; // Only trigger the first uncrossed threshold
      }
    }

    if (crossedThreshold && crossedThreshold !== lastThresholdRef.current) {
      lastThresholdRef.current = crossedThreshold;
      onThresholdCrossed?.(crossedThreshold);
    }
  }, [progress, progressThresholds, onThresholdCrossed]);

  // Check for threshold crossings on progress changes
  useEffect(() => {
    detectThresholdCrossings();
  }, [detectThresholdCrossings]);

  // Determine which thresholds have been reached
  const hasReached33 = progress >= 33 || progressThresholds[33];
  const hasReached67 = progress >= 67 || progressThresholds[67];
  const hasReached100 = progress >= 100 || progressThresholds[100];

  return {
    progress: Math.round(progress * 100) / 100, // Round to 2 decimal places
    hasReached33,
    hasReached67,
    hasReached100,
    thresholdCrossed: lastThresholdRef.current
  };
}
