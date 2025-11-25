import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { useSessionStore } from '@renderer/stores/SessionStore';
import { useEffect, useMemo, useRef } from 'react';

dayjs.extend(duration);

export const useSessionTimer = () => {
  const sessionActive = useSessionStore(state => state.sessionActive);
  const startTime = useSessionStore(state => state.startTime);
  const goalType = useSessionStore(state => state.goalType);
  const goalMinutes = useSessionStore(state => state.goal);
  const elapsedSeconds = useSessionStore(state => state.elapsedSeconds);
  const updateElapsedTime = useSessionStore(state => state.updateElapsedTime);
  const resetElapsedTime = useSessionStore(state => state.resetElapsedTime);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update elapsed time periodically when session is active
  useEffect(() => {
    if (sessionActive && startTime) {
      // Update immediately
      updateElapsedTime();

      // Then update every second
      intervalRef.current = setInterval(() => {
        updateElapsedTime();
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [sessionActive, startTime, updateElapsedTime]);

  // Reset when session ends
  useEffect(() => {
    if (!startTime) {
      resetElapsedTime();
    }
  }, [startTime, resetElapsedTime]);

  // Calculate time-based progress if goal is time-based
  const timeProgress = useMemo(() => {
    if (goalType !== 'time' || goalMinutes === 0) return 0;
    const goalSeconds = goalMinutes * 60;
    return Math.min(Math.round((elapsedSeconds / goalSeconds) * 100), 100);
  }, [goalType, goalMinutes, elapsedSeconds]);

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
    isRunning: sessionActive && !!startTime,
    reset: resetElapsedTime,
    timeProgress,
    stop: () => {
      // Stop is handled by sessionActive changing
      // But we can clear the interval if needed
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    },
  };
};