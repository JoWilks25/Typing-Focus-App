// src/main/types/session.ts
// Purpose: Type definitions for session data structures

export type GoalType = 'word' | 'time';

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
}
