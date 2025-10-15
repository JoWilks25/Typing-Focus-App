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
  start(filePath: string, name?: string, title?: string, goalType?: 'word' | 'time', goalValue?: number): Promise<any>;
  stop(sessionId: string): Promise<any>;
  end(sessionId: string, finalContent: string, finalWordCount: number): Promise<any>;
  get(sessionId: string): Promise<any>;
  getActive(): Promise<any>;
  getLastEnded(): Promise<any>;
  list(): Promise<any[]>;
  updateContent(sessionId: string, content: string): Promise<any>;
  updateProgress(sessionId: string, currentWords: number, timeElapsed: number, progressPercentage: number): Promise<any>;
  getStats(sessionId: string): Promise<any>;
  incrementDistraction(sessionId: string): Promise<any>;
  abandon(sessionId: string): Promise<any>;
  markIncomplete(sessionId: string): Promise<any>;
  pause(sessionId: string): Promise<any>;
  resume(sessionId: string): Promise<any>;
}

// Focus API
interface FocusAPI {
  start(request: FocusStartRequest): Promise<Result<FocusStartResponse, StructuredError>>;
  stop(request: FocusStopRequest): Promise<Result<FocusStopResponse, StructuredError>>;
  status(request: FocusStatusRequest): Promise<Result<FocusStatusResponse, StructuredError>>;
}

// Activity API
interface ActivityAPI {
  recordTyping(): Promise<void>;
  record(request: ActivityRecordRequest): Promise<Result<ActivityRecordResponse, StructuredError>>;
  stats(request: ActivityStatsRequest): Promise<Result<ActivityStatsResponse, StructuredError>>;
  reset(request: ActivityResetRequest): Promise<Result<ActivityResetResponse, StructuredError>>;
}

// Dialog API
interface DialogAPI {
  showOpenDirectory(): Promise<{ directoryPath?: string; canceled: boolean }>;
  getDefaultSaveDirectory(): Promise<string>;
  openFolder(filePath: string): Promise<void>;
}

// Floating Modal API
interface FloatingModalAPI {
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
    onClose?: () => void;
    onMove?: (x: number, y: number) => void;
    onMinimize?: () => void;
  }) => Promise<string>;
  close: (id: string) => Promise<boolean>;
  closeAll: () => Promise<void>;
  minimize: (id: string) => Promise<boolean>;
  move: (id: string, x: number, y: number) => Promise<boolean>;
  resize: (id: string, width: number, height: number) => Promise<boolean>;
  get: (id: string) => Promise<{
    id: string;
    options: any;
    isVisible: boolean;
    isMinimized: boolean;
    position: [number, number];
    size: [number, number];
  } | null>;
  getAll: () => Promise<Array<{
    id: string;
    options: any;
    isVisible: boolean;
    isMinimized: boolean;
    position: [number, number];
    size: [number, number];
  }>>;
  has: (id: string) => Promise<boolean>;
  updateContent: (id: string, content: string) => Promise<boolean>;
}

// Main API interface
interface ElectronAPI {
  dialog: DialogAPI;
  file: FileAPI;
  storage: StorageAPI;
  session: SessionAPI;
  focus: FocusAPI;
  activity: ActivityAPI;
  floatingModal: FloatingModalAPI;
  
  // Event listeners
  on: (channel: string, callback: (...args: any[]) => void) => void;
  removeListener: (channel: string, callback: (...args: any[]) => void) => void;
  
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
