import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { useSessionStore } from '@renderer/stores/SessionStore';
import { useEffect, useState, useRef, useCallback } from 'react';

dayjs.extend(duration);

export const useSessionTimer = () => {
  const sessionActive = useSessionStore(state => state.sessionActive);
  const startTime = useSessionStore(state => state.startTime);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start the timer
  const startTimer = useCallback(() => {
    if (intervalRef.current) return; // Already running

    intervalRef.current = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
  }, []);

  // Stop the timer
  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Reset to zero
  const resetTimer = useCallback(() => {
    stopTimer();
    setElapsedSeconds(0);
  }, [stopTimer]);

  // Auto-start/stop based on sessionActive
  useEffect(() => {
    if (sessionActive) {
      startTimer();
    } else {
      stopTimer();
    }

    return () => stopTimer();
  }, [sessionActive, startTimer, stopTimer]);

  // Reset when session ends (startTime becomes null)
  useEffect(() => {
    if (!startTime) {
      console.log('Session ended - resetting timer to 0');
      resetTimer();
    }
  }, [startTime, resetTimer]);

  // Calculate formatted values
  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;

  const formattedTime = dayjs.duration({ hours, minutes, seconds }).format('HH:mm:ss');

  return {
    seconds,
    minutes,
    hours,
    elapsedSeconds,
    formattedTime,
    isRunning: !!intervalRef.current,
    reset: resetTimer,
  };
};