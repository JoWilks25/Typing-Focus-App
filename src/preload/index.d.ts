// Preload script type definitions
import type { Result, StructuredError } from '../main/types/ipc';

export interface SessionUpdateProgressRequest {
  sessionId: string;
  currentWords: number;
  timeElapsed: number;
  progressThresholds: {
    33: boolean;
    67: boolean;
    100: boolean;
  };
}

export interface SessionUpdateProgressResponse {
  success: boolean;
}

export interface ElectronAPI {
  // Process info
  process: {
    versions: NodeJS.ProcessVersions;
  };

  // New typed API
  session: {
    updateProgress: (request: SessionUpdateProgressRequest) => Promise<Result<SessionUpdateProgressResponse, StructuredError>>;
  };

  // Legacy API for backward compatibility
  saveSession: (sessionData: unknown) => Promise<{ success: boolean; message: string }>;
  loadSession: (sessionId: string) => Promise<unknown | null>;
  deleteSession: (sessionId: string) => Promise<{ success: boolean; message: string }>;
  listSessions: () => Promise<unknown[]>;

  // File operations
  saveFile: (filePath: string, content: string) => Promise<{ success: boolean; message: string }>;
  loadFile: (filePath: string) => Promise<unknown | null>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
    api: ElectronAPI;
  }
}
