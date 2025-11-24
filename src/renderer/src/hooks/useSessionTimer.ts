import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { useStopwatch } from 'react-timer-hook';
import { useSessionStore } from '@renderer/stores/SessionStore';
import { useEffect } from 'react';

// Format time as HH:MM:SS
dayjs.extend(duration);

export const useSessionTimer = () => {
  const sessionActive = useSessionStore(state => state.sessionActive);
  const startTime = useSessionStore(state => state.startTime);

  const {
    seconds,
    minutes,
    hours,
    isRunning,
    start,
    pause,
    reset,
  } = useStopwatch({ autoStart: false });

  useEffect(() => {
    if (!startTime) {
      reset();
    }
  }, [startTime, reset]);

  // Auto-start/pause timer based on session state
  useEffect(() => {
    if (sessionActive && !isRunning) {
      start();
    } else if (!sessionActive && isRunning) {
      pause();
    }
  }, [sessionActive, isRunning, start, pause]);

  const formattedTime = dayjs.duration({ hours, minutes, seconds }).format('HH:mm:ss');

  return {
    seconds,
    minutes,
    hours,
    formattedTime,
    isRunning,
    reset,
  };
};