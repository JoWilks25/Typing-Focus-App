// src/main/utils/calculateSessionStats.ts
// Purpose: Calculate final session statistics and completion status

import type { Session } from '../types/session';

export interface SessionStats {
  isCompleted: boolean;
  progressPercentage: number;
  duration: number; // Total time elapsed in ms
  wordsPerMinute: number;
  finalStatus: 'completed' | 'incomplete' | 'abandoned';
  goalType: 'word' | 'time';
  goalValue: number;
  currentWords: number;
  timeElapsed: number;
  distractionCount: number;
}

/**
 * Calculate final session statistics and completion status
 */
export function calculateSessionStats(session: Session): SessionStats {
  const currentWords = session.currentWords || 0;
  const timeElapsed = session.timeElapsed || 0;
  const distractionCount = session.distractionCount || 0;

  // Calculate if goal was met
  let isCompleted = false;
  if (session.goalType === 'word') {
    isCompleted = currentWords >= session.goalValue;
  } else if (session.goalType === 'time') {
    const goalTimeMs = session.goalValue * 60 * 1000; // Convert minutes to milliseconds
    isCompleted = timeElapsed >= goalTimeMs;
  }

  // Calculate progress percentage
  let progressPercentage = 0;
  if (session.goalType === 'word') {
    progressPercentage = Math.min((currentWords / session.goalValue) * 100, 100);
  } else if (session.goalType === 'time') {
    const goalTimeMs = session.goalValue * 60 * 1000;
    progressPercentage = Math.min((timeElapsed / goalTimeMs) * 100, 100);
  }

  // Calculate words per minute
  const durationMinutes = timeElapsed / (1000 * 60);
  const wordsPerMinute = durationMinutes > 0 ? Math.round(currentWords / durationMinutes) : 0;

  // Determine final status
  let finalStatus: 'completed' | 'incomplete' | 'abandoned';
  if (session.status === 'abandoned') {
    finalStatus = 'abandoned';
  } else if (isCompleted) {
    finalStatus = 'completed';
  } else {
    finalStatus = 'incomplete';
  }

  return {
    isCompleted,
    progressPercentage: Math.round(progressPercentage),
    duration: timeElapsed,
    wordsPerMinute,
    finalStatus,
    goalType: session.goalType,
    goalValue: session.goalValue,
    currentWords,
    timeElapsed,
    distractionCount
  };
}
