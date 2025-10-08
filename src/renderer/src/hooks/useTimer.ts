// src/renderer/src/hooks/useTimer.ts
// Purpose: Hook for tracking active typing time with focus awareness

import { useCallback, useEffect, useRef, useState } from 'react';

export interface TimerState {
  timeElapsed: number; // in milliseconds
  formattedTime: string; // formatted as MM:SS
  isRunning: boolean;
}

export interface UseTimerOptions {
  sessionStartTime?: number;
  isSessionActive?: boolean;
  isFocused?: boolean;
  onTimeUpdate?: (timeElapsed: number) => void;
}

/**
 * Hook for tracking active typing time accounting for focus changes
 * @param options Configuration options for the timer
 * @returns Timer state and controls
 */
export function useTimer(options: UseTimerOptions = {}): TimerState {
  const {
    sessionStartTime = 0,
    isSessionActive = false,
    isFocused = true,
    onTimeUpdate
  } = options;

  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof globalThis.setInterval> | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());
  const totalPauseTimeRef = useRef<number>(0);
  const pauseStartRef = useRef<number | null>(null);

  // Format time as MM:SS
  const formatTime = useCallback((milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // Calculate elapsed time accounting for pauses
  const calculateElapsedTime = useCallback((): number => {
    if (!sessionStartTime || !isSessionActive) {
      return 0;
    }

    const now = Date.now();
    const totalElapsed = now - sessionStartTime;
    const currentPauseTime = pauseStartRef.current ? now - pauseStartRef.current : 0;
    
    return Math.max(0, totalElapsed - totalPauseTimeRef.current - currentPauseTime);
  }, [sessionStartTime, isSessionActive]);

  // Start the timer
  const startTimer = useCallback(() => {
    if (intervalRef.current) return;
    
    setIsRunning(true);
    lastUpdateRef.current = Date.now();
    
    intervalRef.current = globalThis.setInterval(() => {
      const elapsed = calculateElapsedTime();
      setTimeElapsed(elapsed);
      onTimeUpdate?.(elapsed);
    }, 1000); // Update every second
  }, [calculateElapsedTime, onTimeUpdate]);

  // Stop the timer
  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      globalThis.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  // Handle focus changes
  useEffect(() => {
    if (!isSessionActive) {
      stopTimer();
      return;
    }

    if (isFocused && !isRunning) {
      // Resume timer
      if (pauseStartRef.current) {
        totalPauseTimeRef.current += Date.now() - pauseStartRef.current;
        pauseStartRef.current = null;
      }
      startTimer();
    } else if (!isFocused && isRunning) {
      // Pause timer
      pauseStartRef.current = Date.now();
      stopTimer();
    }
  }, [isFocused, isSessionActive, isRunning, startTimer, stopTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        globalThis.clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Reset when session changes
  useEffect(() => {
    if (sessionStartTime) {
      totalPauseTimeRef.current = 0;
      pauseStartRef.current = null;
      setTimeElapsed(calculateElapsedTime());
    }
  }, [sessionStartTime, calculateElapsedTime]);

  return {
    timeElapsed,
    formattedTime: formatTime(timeElapsed),
    isRunning
  };
}