// src/main/types/session.ts
// Purpose: Type definitions for session data structures

import { type GoalType } from '../../shared/types/validation';

export { type GoalType };

export interface Session {
  id: string;
  name: string;
  title?: string;
  content?: string;
  goalType: GoalType;
  goalValue: number;
  startTime: number;
  endTime?: number;
  status: 'active' | 'stopped' | 'abandoned';
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  currentWords?: number;
  timeElapsed?: number;
  progressThresholds?: {
    33: boolean;
    67: boolean;
    100: boolean;
  };
  isPaused?: boolean;
  pauseStartTime?: number;
  totalPauseTime?: number; // accumulated pause time in ms
  distractionCount?: number;
  isAbandoned?: boolean;
}
