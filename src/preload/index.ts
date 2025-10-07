import { contextBridge, ipcRenderer } from 'electron';
import type {
  FileReadRequest,
  FileWriteRequest,
  FileListRequest,
  FileExistsRequest,
  StorageGetRequest,
  StorageSetRequest,
  StorageRemoveRequest,
  SessionStartRequest,
  SessionStopRequest,
  SessionGetRequest,
  FocusStartRequest,
  FocusStopRequest,
  FocusStatusRequest,
  ActivityRecordRequest,
  ActivityStatsRequest,
  ActivityResetRequest,
  Result,
  StructuredError
} from '../main/types/ipc';

// File API
const fileAPI = {
  read: (request: FileReadRequest): Promise<Result<any, StructuredError>> => {
    return ipcRenderer.invoke('file:read', request);
  },
  write: (request: FileWriteRequest): Promise<Result<any, StructuredError>> => {
    return ipcRenderer.invoke('file:write', request);
  },
  list: (request: FileListRequest): Promise<Result<any, StructuredError>> => {
    return ipcRenderer.invoke('file:list', request);
  },
  exists: (request: FileExistsRequest): Promise<Result<any, StructuredError>> => {
    return ipcRenderer.invoke('file:exists', request);
  }
};

// Storage API (placeholder - will be implemented next)
const storageAPI = {
  get: (request: StorageGetRequest): Promise<Result<any, StructuredError>> => {
    return ipcRenderer.invoke('storage:get', request);
  },
  set: (request: StorageSetRequest): Promise<Result<any, StructuredError>> => {
    return ipcRenderer.invoke('storage:set', request);
  },
  remove: (request: StorageRemoveRequest): Promise<Result<any, StructuredError>> => {
    return ipcRenderer.invoke('storage:remove', request);
  },
  clear: (): Promise<Result<any, StructuredError>> => {
    return ipcRenderer.invoke('storage:clear');
  }
};

// Session API (placeholder - will be implemented next)
const sessionAPI = {
  start: (request: SessionStartRequest): Promise<Result<any, StructuredError>> => {
    return ipcRenderer.invoke('session:start', request);
  },
  stop: (request: SessionStopRequest): Promise<Result<any, StructuredError>> => {
    return ipcRenderer.invoke('session:stop', request);
  },
  get: (request: SessionGetRequest): Promise<Result<any, StructuredError>> => {
    return ipcRenderer.invoke('session:get', request);
  },
  list: (): Promise<Result<any, StructuredError>> => {
    return ipcRenderer.invoke('session:list');
  }
};

// Focus API (placeholder - will be implemented next)
const focusAPI = {
  start: (request: FocusStartRequest): Promise<Result<any, StructuredError>> => {
    return ipcRenderer.invoke('focus:start', request);
  },
  stop: (request: FocusStopRequest): Promise<Result<any, StructuredError>> => {
    return ipcRenderer.invoke('focus:stop', request);
  },
  status: (request: FocusStatusRequest): Promise<Result<any, StructuredError>> => {
    return ipcRenderer.invoke('focus:status', request);
  }
};

// Activity API (placeholder - will be implemented next)
const activityAPI = {
  record: (request: ActivityRecordRequest): Promise<Result<any, StructuredError>> => {
    return ipcRenderer.invoke('activity:record', request);
  },
  stats: (request: ActivityStatsRequest): Promise<Result<any, StructuredError>> => {
    return ipcRenderer.invoke('activity:stats', request);
  },
  reset: (request: ActivityResetRequest): Promise<Result<any, StructuredError>> => {
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
  // @ts-ignore (for non-sandboxed environments)
  window.api = electronAPI;
  // @ts-ignore (for non-sandboxed environments)
  window.electronAPI = electronAPI;
}
