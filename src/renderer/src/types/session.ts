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
  status: 'active' | 'stopped';
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  currentWords?: number;
  timeElapsed?: number;
  progressThresholds?: {
    33: boolean;
    67: boolean;
    100: boolean;
  };
}

export interface SessionState {
  sessions: Session[];
  activeSessionId: string | null;
}
