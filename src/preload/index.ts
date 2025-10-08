import { contextBridge, ipcRenderer } from 'electron';
import type { Session } from '../main/types/session';
import type { GoalType } from '../shared/types/validation';

// Session API - simplified function-style interface
const sessionAPI = {
  start: (name?: string, title?: string, goalType: GoalType = 'word', goalValue: number = 500): Promise<Session> => {
    return ipcRenderer.invoke('session:start', name, title, goalType, goalValue);
  },
  stop: (sessionId: string): Promise<Session> => {
    return ipcRenderer.invoke('session:stop', sessionId);
  },
  get: (sessionId: string): Promise<Session> => {
    return ipcRenderer.invoke('session:get', sessionId);
  },
  getActive: (): Promise<Session | undefined> => {
    return ipcRenderer.invoke('session:get-active');
  },
  list: (): Promise<Session[]> => {
    return ipcRenderer.invoke('session:list');
  },
  updateContent: (sessionId: string, content: string): Promise<Session> => {
    return ipcRenderer.invoke('session:update-content', sessionId, content);
  },
  updateProgress: (sessionId: string, currentWords: number, timeElapsed: number, progressThresholds: { 33: boolean; 67: boolean; 100: boolean }): Promise<Session> => {
    return ipcRenderer.invoke('session:update-progress', sessionId, currentWords, timeElapsed, progressThresholds);
  },
  getStats: (sessionId: string) => {
    return ipcRenderer.invoke('session:stats', sessionId);
  }
};

// File API - simplified function-style interface
const fileAPI = {
  read: (path: string): Promise<string> => {
    return ipcRenderer.invoke('file:read', path);
  },
  write: (path: string, content: string): Promise<void> => {
    return ipcRenderer.invoke('file:write', path, content);
  },
  exists: (path: string): Promise<boolean> => {
    return ipcRenderer.invoke('file:exists', path);
  },
  autosave: (path: string, content: string): Promise<void> => {
    return ipcRenderer.invoke('file:autosave', path, content);
  }
};

// Storage API - simplified function-style interface
const storageAPI = {
  get: (key: string): Promise<unknown> => {
    return ipcRenderer.invoke('storage:get', key);
  },
  set: (key: string, value: unknown): Promise<void> => {
    return ipcRenderer.invoke('storage:set', key, value);
  },
  remove: (key: string): Promise<void> => {
    return ipcRenderer.invoke('storage:remove', key);
  }
};

// Activity API - simplified function-style interface
const activityAPI = {
  recordTyping: (): Promise<void> => {
    return ipcRenderer.invoke('activity:typing');
  }
};

// Main API object - simplified
const electronAPI = {
  // Simplified APIs
  session: sessionAPI,
  file: fileAPI,
  storage: storageAPI,
  activity: activityAPI,
  
  // Event listener for main→renderer events
  on: (channel: string, callback: (...args: unknown[]) => void) => {
    ipcRenderer.on(channel, callback);
  },
  
  // Remove event listener
  removeListener: (channel: string, callback: (...args: unknown[]) => void) => {
    ipcRenderer.removeListener(channel, callback);
  },
  
  // Process versions
  process: {
    versions: process.versions
  }
};

// Expose the API to the renderer process
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', electronAPI);
  } catch (error) {
    console.error('Failed to expose API:', error);
  }
} else {
  // @ts-expect-error (for non-sandboxed environments)
  window.api = electronAPI;
}
