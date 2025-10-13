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
  end: (sessionId: string, finalContent: string, finalWordCount: number): Promise<Session> => {
    return ipcRenderer.invoke('session:end', sessionId, finalContent, finalWordCount);
  },
  get: (sessionId: string): Promise<Session> => {
    return ipcRenderer.invoke('session:get', sessionId);
  },
  getActive: (): Promise<Session | undefined> => {
    return ipcRenderer.invoke('session:get-active');
  },
  getLastEnded: (): Promise<Session | null> => {
    return ipcRenderer.invoke('session:get-last-ended');
  },
  list: (): Promise<Session[]> => {
    return ipcRenderer.invoke('session:list');
  },
  updateContent: (sessionId: string, content: string): Promise<Session> => {
    return ipcRenderer.invoke('session:update-content', sessionId, content);
  },
  updateProgress: (sessionId: string, currentWords: number, timeElapsed: number, progressPercentage: number): Promise<Session> => {
    return ipcRenderer.invoke('session:update-progress', sessionId, currentWords, timeElapsed, progressPercentage);
  },
  getStats: (sessionId: string) => {
    return ipcRenderer.invoke('session:stats', sessionId);
  },
  incrementDistraction: (sessionId: string): Promise<Session> => {
    return ipcRenderer.invoke('session:increment-distraction', sessionId);
  },
  abandon: (sessionId: string): Promise<Session> => {
    return ipcRenderer.invoke('session:abandon', sessionId);
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

// Floating Modal API - simplified function-style interface
const floatingModalAPI = {
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
  }): Promise<string> => {
    return ipcRenderer.invoke('floating-modal:create', options);
  },
  close: (id?: string): Promise<boolean> => {
    return ipcRenderer.invoke('floating-modal:close', id);
  },
  closeAll: (): Promise<void> => {
    return ipcRenderer.invoke('floating-modal:close-all');
  },
  minimize: (id?: string): Promise<boolean> => {
    return ipcRenderer.invoke('floating-modal:minimize', id);
  },
  move: (id: string | undefined, x: number, y: number): Promise<boolean> => {
    return ipcRenderer.invoke('floating-modal:move', id, x, y);
  },
  resize: (id: string, width: number, height: number): Promise<boolean> => {
    return ipcRenderer.invoke('floating-modal:resize', id, width, height);
  },
  get: (id: string): Promise<{
    id: string;
    options: Record<string, unknown>;
    isVisible: boolean;
    isMinimized: boolean;
    position: [number, number];
    size: [number, number];
  } | null> => {
    return ipcRenderer.invoke('floating-modal:get', id);
  },
  getAll: (): Promise<Array<{
    id: string;
    options: Record<string, unknown>;
    isVisible: boolean;
    isMinimized: boolean;
    position: [number, number];
    size: [number, number];
  }>> => {
    return ipcRenderer.invoke('floating-modal:get-all');
  },
  has: (id: string): Promise<boolean> => {
    return ipcRenderer.invoke('floating-modal:has', id);
  },
  updateContent: (id: string, content: string): Promise<boolean> => {
    return ipcRenderer.invoke('floating-modal:update-content', id, content);
  },
  executeJavaScript: (id: string, script: string): Promise<void> => {
    return ipcRenderer.invoke('floating-modal:execute-javascript', id, script);
  }
};

// Window Focus API
const windowFocusAPI = {
  focusMainWindow: (): Promise<void> => {
    return ipcRenderer.invoke('focus:main-window');
  }
};

// Main API object - simplified
const electronAPI = {
  // Simplified APIs
  session: sessionAPI,
  file: fileAPI,
  storage: storageAPI,
  activity: activityAPI,
  floatingModal: floatingModalAPI,
  windowFocus: windowFocusAPI,
  
  // Event listener for main→renderer events
  on: (channel: string, callback: (...args: unknown[]) => void) => {
    ipcRenderer.on(channel, callback);
  },
  
  // Send events from renderer→main
  send: (channel: string, ...args: unknown[]) => {
    ipcRenderer.send(channel, ...args);
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
