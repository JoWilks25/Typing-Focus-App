// Ambient type declarations for window.api
// This file provides type safety for the renderer process

import type {
  Result,
  StructuredError,
  FileReadRequest,
  FileReadResponse,
  FileWriteRequest,
  FileWriteResponse,
  FileListRequest,
  FileListResponse,
  FileExistsRequest,
  FileExistsResponse,
  StorageGetRequest,
  StorageGetResponse,
  StorageSetRequest,
  StorageSetResponse,
  StorageRemoveRequest,
  StorageRemoveResponse,
  StorageClearResponse,
  SessionStartRequest,
  SessionStartResponse,
  SessionStopRequest,
  SessionStopResponse,
  SessionGetRequest,
  SessionGetResponse,
  SessionListResponse,
  FocusStartRequest,
  FocusStartResponse,
  FocusStopRequest,
  FocusStopResponse,
  FocusStatusRequest,
  FocusStatusResponse,
  ActivityRecordRequest,
  ActivityRecordResponse,
  ActivityStatsRequest,
  ActivityStatsResponse,
  ActivityResetRequest,
  ActivityResetResponse,
} from '../main/types/ipc';

// File API
interface FileAPI {
  read(request: FileReadRequest): Promise<Result<FileReadResponse, StructuredError>>;
  write(request: FileWriteRequest): Promise<Result<FileWriteResponse, StructuredError>>;
  list(request: FileListRequest): Promise<Result<FileListResponse, StructuredError>>;
  exists(request: FileExistsRequest): Promise<Result<FileExistsResponse, StructuredError>>;
}

// Storage API
interface StorageAPI {
  get(request: StorageGetRequest): Promise<Result<StorageGetResponse, StructuredError>>;
  set(request: StorageSetRequest): Promise<Result<StorageSetResponse, StructuredError>>;
  remove(request: StorageRemoveRequest): Promise<Result<StorageRemoveResponse, StructuredError>>;
  clear(): Promise<Result<StorageClearResponse, StructuredError>>;
}

// Session API
interface SessionAPI {
  start(request: SessionStartRequest): Promise<Result<SessionStartResponse, StructuredError>>;
  stop(request: SessionStopRequest): Promise<Result<SessionStopResponse, StructuredError>>;
  get(request: SessionGetRequest): Promise<Result<SessionGetResponse, StructuredError>>;
  list(): Promise<Result<SessionListResponse, StructuredError>>;
}

// Focus API
interface FocusAPI {
  start(request: FocusStartRequest): Promise<Result<FocusStartResponse, StructuredError>>;
  stop(request: FocusStopRequest): Promise<Result<FocusStopResponse, StructuredError>>;
  status(request: FocusStatusRequest): Promise<Result<FocusStatusResponse, StructuredError>>;
}

// Activity API
interface ActivityAPI {
  record(request: ActivityRecordRequest): Promise<Result<ActivityRecordResponse, StructuredError>>;
  stats(request: ActivityStatsRequest): Promise<Result<ActivityStatsResponse, StructuredError>>;
  reset(request: ActivityResetRequest): Promise<Result<ActivityResetResponse, StructuredError>>;
}

// Main API interface
interface ElectronAPI {
  file: FileAPI;
  storage: StorageAPI;
  session: SessionAPI;
  focus: FocusAPI;
  activity: ActivityAPI;
  
  // Legacy API for backward compatibility (to be removed)
  process: {
    versions: NodeJS.ProcessVersions;
  };
  saveSession: (sessionData: unknown) => Promise<{ success: boolean; message: string }>;
  loadSession: (sessionId: string) => Promise<unknown>;
  deleteSession: (sessionId: string) => Promise<{ success: boolean; message: string }>;
  listSessions: () => Promise<unknown[]>;
  saveFile: (filePath: string, content: string) => Promise<{ success: boolean; message: string }>;
  loadFile: (filePath: string) => Promise<unknown>;
}

// Extend the global Window interface
declare global {
  interface Window {
    api: ElectronAPI;
    electronAPI: ElectronAPI; // Legacy name for backward compatibility
  }
}

export {};
