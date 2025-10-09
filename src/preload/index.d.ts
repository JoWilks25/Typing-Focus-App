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
    incrementDistraction: (sessionId: string) => Promise<Session>;
    abandon: (sessionId: string) => Promise<Session>;
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

  // Activity API
  activity: {
    recordTyping: () => Promise<void>;
  };

  // Floating Modal API
  floatingModal: {
    create: (options?: {
      width?: number;
      height?: number;
      x?: number;
      y?: number;
      alwaysOnTop?: boolean;
      resizable?: boolean;
      minimizable?: boolean;
      closable?: boolean;
      title?: string;
      content?: string;
    }) => Promise<string>;
    close: (id?: string) => Promise<boolean>;
    closeAll: () => Promise<void>;
    minimize: (id?: string) => Promise<boolean>;
    move: (id: string | undefined, x: number, y: number) => Promise<boolean>;
    resize: (id: string, width: number, height: number) => Promise<boolean>;
    get: (id: string) => Promise<{
      id: string;
      options: Record<string, unknown>;
      isVisible: boolean;
      isMinimized: boolean;
      position: [number, number];
      size: [number, number];
    } | null>;
    getAll: () => Promise<Array<{
      id: string;
      options: Record<string, unknown>;
      isVisible: boolean;
      isMinimized: boolean;
      position: [number, number];
      size: [number, number];
    }>>;
    has: (id: string) => Promise<boolean>;
    updateContent: (id: string, content: string) => Promise<boolean>;
  };

  // Window Focus API
  windowFocus: {
    focusMainWindow: () => Promise<void>;
  };

  // Event listeners
  on: (channel: string, callback: (...args: unknown[]) => void) => void;
  removeListener: (channel: string, callback: (...args: unknown[]) => void) => void;
  send: (channel: string, ...args: unknown[]) => void;
}

declare global {
  interface Window {
    api: ElectronAPI;
  }
}
