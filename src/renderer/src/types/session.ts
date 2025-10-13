// src/renderer/src/types/session.ts
// Purpose: Type definitions for session data structures (renderer)

import { type GoalType } from '../../../shared/types/validation';

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
  status: 'active' | 'stopped' | 'abandoned' | 'completed' | 'incomplete';
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  currentWords?: number;
  timeElapsed?: number;
  progressPercentage?: number;
  isPaused?: boolean;
  pauseStartTime?: number;
  totalPauseTime?: number; // accumulated pause time in ms
  distractionCount?: number;
  isAbandoned?: boolean;
}

export interface SessionState {
  sessions: Session[];
  activeSessionId: string | null;
}
