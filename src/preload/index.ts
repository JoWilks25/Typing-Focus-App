import { contextBridge, ipcRenderer } from 'electron';
import type {
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
  SessionUpdateProgressRequest,
  SessionUpdateProgressResponse,
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
  Result,
  StructuredError
} from '../main/types/ipc';

// File API
const fileAPI = {
  read: (request: FileReadRequest): Promise<Result<FileReadResponse, StructuredError>> => {
    return ipcRenderer.invoke('file:read', request);
  },
  write: (request: FileWriteRequest): Promise<Result<FileWriteResponse, StructuredError>> => {
    return ipcRenderer.invoke('file:write', request);
  },
  list: (request: FileListRequest): Promise<Result<FileListResponse, StructuredError>> => {
    return ipcRenderer.invoke('file:list', request);
  },
  exists: (request: FileExistsRequest): Promise<Result<FileExistsResponse, StructuredError>> => {
    return ipcRenderer.invoke('file:exists', request);
  }
};

// Storage API (placeholder - will be implemented next)
const storageAPI = {
  get: (request: StorageGetRequest): Promise<Result<StorageGetResponse, StructuredError>> => {
    return ipcRenderer.invoke('storage:get', request);
  },
  set: (request: StorageSetRequest): Promise<Result<StorageSetResponse, StructuredError>> => {
    return ipcRenderer.invoke('storage:set', request);
  },
  remove: (request: StorageRemoveRequest): Promise<Result<StorageRemoveResponse, StructuredError>> => {
    return ipcRenderer.invoke('storage:remove', request);
  },
  clear: (): Promise<Result<StorageClearResponse, StructuredError>> => {
    return ipcRenderer.invoke('storage:clear');
  }
};

// Session API (placeholder - will be implemented next)
const sessionAPI = {
  start: (request: SessionStartRequest): Promise<Result<SessionStartResponse, StructuredError>> => {
    return ipcRenderer.invoke('session:start', request);
  },
  stop: (request: SessionStopRequest): Promise<Result<SessionStopResponse, StructuredError>> => {
    return ipcRenderer.invoke('session:stop', request);
  },
  get: (request: SessionGetRequest): Promise<Result<SessionGetResponse, StructuredError>> => {
    return ipcRenderer.invoke('session:get', request);
  },
  list: (): Promise<Result<SessionListResponse, StructuredError>> => {
    return ipcRenderer.invoke('session:list');
  },
  updateProgress: (request: SessionUpdateProgressRequest): Promise<Result<SessionUpdateProgressResponse, StructuredError>> => {
    return ipcRenderer.invoke('session:updateProgress', request);
  }
};

// Focus API (placeholder - will be implemented next)
const focusAPI = {
  start: (request: FocusStartRequest): Promise<Result<FocusStartResponse, StructuredError>> => {
    return ipcRenderer.invoke('focus:start', request);
  },
  stop: (request: FocusStopRequest): Promise<Result<FocusStopResponse, StructuredError>> => {
    return ipcRenderer.invoke('focus:stop', request);
  },
  status: (request: FocusStatusRequest): Promise<Result<FocusStatusResponse, StructuredError>> => {
    return ipcRenderer.invoke('focus:status', request);
  }
};

// Activity API (placeholder - will be implemented next)
const activityAPI = {
  record: (request: ActivityRecordRequest): Promise<Result<ActivityRecordResponse, StructuredError>> => {
    return ipcRenderer.invoke('activity:record', request);
  },
  stats: (request: ActivityStatsRequest): Promise<Result<ActivityStatsResponse, StructuredError>> => {
    return ipcRenderer.invoke('activity:stats', request);
  },
  reset: (request: ActivityResetRequest): Promise<Result<ActivityResetResponse, StructuredError>> => {
    return ipcRenderer.invoke('activity:reset', request);
  }
};

// Main API object
const electronAPI = {
  // New typed API
  file: fileAPI,
  storage: storageAPI,
  session: sessionAPI,
  focus: focusAPI,
  activity: activityAPI,
  
  // Process versions
  process: {
    versions: process.versions
  },

  // Legacy API for backward compatibility (to be removed)
  saveSession: (sessionData: unknown) => {
    console.log('saveSession - deprecated, use session API instead', sessionData);
    return Promise.resolve({ success: false, message: 'Use session API instead' });
  },

  loadSession: (sessionId: string) => {
    console.log('loadSession - deprecated, use session API instead', sessionId);
    return Promise.resolve(null);
  },

  deleteSession: (sessionId: string) => {
    console.log('deleteSession - deprecated, use session API instead', sessionId);
    return Promise.resolve({ success: false, message: 'Use session API instead' });
  },

  listSessions: () => {
    console.log('listSessions - deprecated, use session API instead');
    return Promise.resolve([]);
  },

  saveFile: (filePath: string, _content: string) => {
    console.log('saveFile - deprecated, use file API instead', filePath);
    return Promise.resolve({ success: false, message: 'Use file API instead' });
  },

  loadFile: (filePath: string) => {
    console.log('loadFile - deprecated, use file API instead', filePath);
    return Promise.resolve(null);
  }
};

// Expose the API to the renderer process
if (process.contextIsolated) {
  try {
    // Expose the new typed API
    contextBridge.exposeInMainWorld('api', electronAPI);
    // Also expose the legacy API for backward compatibility
    contextBridge.exposeInMainWorld('electronAPI', electronAPI);
  } catch (error) {
    console.error('Failed to expose API:', error);
  }
} else {
  // @ts-expect-error (for non-sandboxed environments)
  window.api = electronAPI;
  // @ts-expect-error (for non-sandboxed environments)
  window.electronAPI = electronAPI;
}
