// Preload script type definitions
import type { Session } from '../main/types/session';
import type { GoalType } from '../shared/types/validation';

export interface ElectronAPI {
  // Process info
  process: {
    versions: NodeJS.ProcessVersions;
  };

  // Session API
  session: {
    start: (name?: string, title?: string, goalType?: GoalType, goalValue?: number) => Promise<Session>;
    stop: (sessionId: string) => Promise<Session>;
    get: (sessionId: string) => Promise<Session>;
    getActive: () => Promise<Session | undefined>;
    list: () => Promise<Session[]>;
    updateContent: (sessionId: string, content: string) => Promise<Session>;
    updateProgress: (sessionId: string, currentWords: number, timeElapsed: number, progressThresholds: { 33: boolean; 67: boolean; 100: boolean }) => Promise<Session>;
    getStats: (sessionId: string) => Promise<{
      sessionId: string;
      isCompleted: boolean;
      progressPercentage: number;
      currentWords: number;
      timeElapsed: number;
      goalType: GoalType;
      goalValue: number;
    }>;
  };

  // File API
  file: {
    read: (path: string) => Promise<string>;
    write: (path: string, content: string) => Promise<void>;
    exists: (path: string) => Promise<boolean>;
    autosave: (path: string, content: string) => Promise<void>;
  };

  // Storage API
  storage: {
    get: (key: string) => Promise<unknown>;
    set: (key: string, value: unknown) => Promise<void>;
    remove: (key: string) => Promise<void>;
  };
}

declare global {
  interface Window {
    api: ElectronAPI;
  }
}
