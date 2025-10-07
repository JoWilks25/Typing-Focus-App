// src/main/types/session.ts
// Purpose: Type definitions for session data structures

export interface Session {
  id: string;
  name: string;
  startTime: number;
  endTime?: number;
  status: 'active' | 'stopped';
}
