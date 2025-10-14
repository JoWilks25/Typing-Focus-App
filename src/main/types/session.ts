// src/main/types/session.ts
// Purpose: Type definitions for session data structures

import { type GoalType } from '../../shared/types/validation';

export { type GoalType };

export interface Session {
  id: string;
  name: string;
  title?: string;
  content?: string;
  filePath: string;           // Required - path to .txt file
  lastSavedToFile?: string;   // ISO timestamp of last file save
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
  initialWordCount?: number; // Word count of loaded file (baseline)
}
