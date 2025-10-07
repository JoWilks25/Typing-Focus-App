// src/renderer/src/types/session.ts
// Purpose: Type definitions for session data structures (renderer)

export interface Session {
  id: string;
  title: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  content: string;
}

export interface SessionState {
  sessions: Session[];
  activeSessionId: string | null;
}
