// Type definitions for Electron API exposed to renderer process

import type { 
  SessionStartRequest, 
  SessionStartResponse,
  SessionStopRequest, 
  SessionStopResponse,
  SessionGetRequest, 
  SessionGetResponse,
  SessionListResponse,
  StorageGetRequest,
  StorageGetResponse,
  StorageSetRequest,
  StorageSetResponse,
  StorageRemoveRequest,
  StorageRemoveResponse,
  StorageClearResponse,
  Result,
  StructuredError
} from '../../../main/types/ipc';

export interface ElectronAPI {
  // Process info
  process: {
    versions: NodeJS.ProcessVersions;
  };

  // New typed API
  session: {
    start: (request: SessionStartRequest) => Promise<Result<SessionStartResponse, StructuredError>>;
    stop: (request: SessionStopRequest) => Promise<Result<SessionStopResponse, StructuredError>>;
    get: (request: SessionGetRequest) => Promise<Result<SessionGetResponse, StructuredError>>;
    list: () => Promise<Result<SessionListResponse, StructuredError>>;
  };

  storage: {
    get: (request: StorageGetRequest) => Promise<Result<StorageGetResponse, StructuredError>>;
    set: (request: StorageSetRequest) => Promise<Result<StorageSetResponse, StructuredError>>;
    remove: (request: StorageRemoveRequest) => Promise<Result<StorageRemoveResponse, StructuredError>>;
    clear: () => Promise<Result<StorageClearResponse, StructuredError>>;
  };

  // Legacy API for backward compatibility (to be removed)
  saveSession: (sessionData: unknown) => Promise<{ success: boolean; message: string }>;
  loadSession: (sessionId: string) => Promise<unknown | null>;
  deleteSession: (sessionId: string) => Promise<{ success: boolean; message: string }>;
  listSessions: () => Promise<unknown[]>;
  saveFile: (filePath: string, content: string) => Promise<{ success: boolean; message: string }>;
  loadFile: (filePath: string) => Promise<unknown | null>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

// This allows importing from this file
export {};
