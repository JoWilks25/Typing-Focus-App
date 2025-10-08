import { ipcMain } from 'electron';
import { SessionManager } from './services/sessionManager';
import { FileManager } from './services/fileManager';
import { inactivityService } from './services/InactivityService';
import { isValidGoal } from './utils/validation';
import type { Session } from './types/session';
// import type { GoalType } from '../../shared/types/validation';
type GoalType = 'word' | 'time';

// Simple IPC channels
export const IPC_CHANNELS = {
  // Session operations
  SESSION_START: 'session:start',
  SESSION_STOP: 'session:stop',
  SESSION_GET: 'session:get',
  SESSION_GET_ACTIVE: 'session:get-active',
  SESSION_LIST: 'session:list',
  SESSION_UPDATE_CONTENT: 'session:update-content',
  SESSION_UPDATE_PROGRESS: 'session:update-progress',
  SESSION_STATS: 'session:stats',
  
  // File operations
  FILE_READ: 'file:read',
  FILE_WRITE: 'file:write',
  FILE_EXISTS: 'file:exists',
  FILE_AUTOSAVE: 'file:autosave',
  
  // Storage operations
  STORAGE_SET: 'storage:set',
  STORAGE_GET: 'storage:get',
  STORAGE_REMOVE: 'storage:remove',
  
  // Activity operations
  ACTIVITY_TYPING: 'activity:typing'
} as const;

let sessionManager: SessionManager;
let fileManager: FileManager;

/**
 * Initialize services
 */
export function initializeServices(appDataPath: string): void {
  sessionManager = new SessionManager();
  fileManager = new FileManager(appDataPath);
}

/**
 * Session Handlers
 */

async function handleSessionStart(
  name?: string,
  title?: string,
  goalType: GoalType = 'word',
  goalValue: number = 500
): Promise<Session> {
  if (!isValidGoal(goalType, goalValue)) {
    throw new Error(`Invalid goal: ${goalType} goal value ${goalValue} is out of range`);
  }

  const session = await sessionManager.startSession(name, title, goalType, goalValue);
  
  // Start inactivity tracking for the new session
  inactivityService.startTracking();
  
  return session;
}

async function handleSessionStop(sessionId: string): Promise<Session> {
  if (!sessionId || sessionId.trim() === '') {
    throw new Error('Session ID is required');
  }

  const session = await sessionManager.stopSession(sessionId);
  
  // Stop inactivity tracking when session ends
  inactivityService.stopTracking();
  
  return session;
}

async function handleSessionGet(sessionId: string): Promise<Session> {
  if (!sessionId || sessionId.trim() === '') {
    throw new Error('Session ID is required');
  }

  const session = sessionManager.getSession(sessionId);
  if (!session) {
    throw new Error(`Session not found: ${sessionId}`);
  }

  return session;
}

async function handleSessionGetActive(): Promise<Session | undefined> {
  return sessionManager.getActiveSession();
}

async function handleSessionList(): Promise<Session[]> {
  return sessionManager.listSessions();
}

async function handleSessionUpdateContent(sessionId: string, content: string): Promise<Session> {
  if (!sessionId || sessionId.trim() === '') {
    throw new Error('Session ID is required');
  }

  return await sessionManager.updateSessionContent(sessionId, content);
}

async function handleSessionUpdateProgress(
  sessionId: string,
  currentWords: number,
  timeElapsed: number,
  progressThresholds: { 33: boolean; 67: boolean; 100: boolean }
): Promise<Session> {
  if (!sessionId || sessionId.trim() === '') {
    throw new Error('Session ID is required');
  }

  if (typeof currentWords !== 'number' || currentWords < 0) {
    throw new Error('Current words must be a non-negative number');
  }

  if (typeof timeElapsed !== 'number' || timeElapsed < 0) {
    throw new Error('Time elapsed must be a non-negative number');
  }

  return await sessionManager.updateProgress(sessionId, currentWords, timeElapsed, progressThresholds);
}

async function handleSessionStats(sessionId: string) {
  if (!sessionId || sessionId.trim() === '') {
    throw new Error('Session ID is required');
  }

  return sessionManager.getSessionStats(sessionId);
}

/**
 * File Handlers
 */

async function handleFileRead(path: string): Promise<string> {
  if (!path || path.trim() === '') {
    throw new Error('Path is required');
  }

  return await fileManager.readFile(path);
}

async function handleFileWrite(path: string, content: string): Promise<void> {
  if (!path || path.trim() === '') {
    throw new Error('Path is required');
  }

  if (content === undefined || content === null) {
    throw new Error('Content is required');
  }

  return await fileManager.writeFile(path, content);
}

async function handleFileExists(path: string): Promise<boolean> {
  if (!path || path.trim() === '') {
    throw new Error('Path is required');
  }

  return await fileManager.fileExists(path);
}

async function handleFileAutosave(path: string, content: string): Promise<void> {
  if (!path || path.trim() === '') {
    throw new Error('Path is required');
  }

  return await fileManager.autosave(path, content);
}

/**
 * Storage Handlers
 */

async function handleStorageSet(key: string, value: unknown): Promise<void> {
  if (!key || key.trim() === '') {
    throw new Error('Key is required');
  }

  return await fileManager.set(key, value);
}

async function handleStorageGet(key: string): Promise<unknown> {
  if (!key || key.trim() === '') {
    throw new Error('Key is required');
  }

  return await fileManager.get(key);
}

async function handleStorageRemove(key: string): Promise<void> {
  if (!key || key.trim() === '') {
    throw new Error('Key is required');
  }

  return await fileManager.remove(key);
}

/**
 * Activity Handlers
 */

async function handleActivityTyping(): Promise<void> {
  // Reset the inactivity timer when typing activity is detected
  inactivityService.resetInactivityTimer();
}

/**
 * Register all IPC handlers
 */
export function registerHandlers(): void {
  if (!sessionManager || !fileManager) {
    throw new Error('Services not initialized. Call initializeServices first.');
  }

  // Session handlers
  ipcMain.handle(IPC_CHANNELS.SESSION_START, async (_, name, title, goalType, goalValue) => {
    return await handleSessionStart(name, title, goalType, goalValue);
  });

  ipcMain.handle(IPC_CHANNELS.SESSION_STOP, async (_, sessionId) => {
    return await handleSessionStop(sessionId);
  });

  ipcMain.handle(IPC_CHANNELS.SESSION_GET, async (_, sessionId) => {
    return await handleSessionGet(sessionId);
  });

  ipcMain.handle(IPC_CHANNELS.SESSION_GET_ACTIVE, async () => {
    return await handleSessionGetActive();
  });

  ipcMain.handle(IPC_CHANNELS.SESSION_LIST, async () => {
    return await handleSessionList();
  });

  ipcMain.handle(IPC_CHANNELS.SESSION_UPDATE_CONTENT, async (_, sessionId, content) => {
    return await handleSessionUpdateContent(sessionId, content);
  });

  ipcMain.handle(IPC_CHANNELS.SESSION_UPDATE_PROGRESS, async (_, sessionId, currentWords, timeElapsed, progressThresholds) => {
    return await handleSessionUpdateProgress(sessionId, currentWords, timeElapsed, progressThresholds);
  });

  ipcMain.handle(IPC_CHANNELS.SESSION_STATS, async (_, sessionId) => {
    return await handleSessionStats(sessionId);
  });

  // File handlers
  ipcMain.handle(IPC_CHANNELS.FILE_READ, async (_, path) => {
    return await handleFileRead(path);
  });

  ipcMain.handle(IPC_CHANNELS.FILE_WRITE, async (_, path, content) => {
    return await handleFileWrite(path, content);
  });

  ipcMain.handle(IPC_CHANNELS.FILE_EXISTS, async (_, path) => {
    return await handleFileExists(path);
  });

  ipcMain.handle(IPC_CHANNELS.FILE_AUTOSAVE, async (_, path, content) => {
    return await handleFileAutosave(path, content);
  });

  // Storage handlers
  ipcMain.handle(IPC_CHANNELS.STORAGE_SET, async (_, key, value) => {
    return await handleStorageSet(key, value);
  });

  ipcMain.handle(IPC_CHANNELS.STORAGE_GET, async (_, key) => {
    return await handleStorageGet(key);
  });

  ipcMain.handle(IPC_CHANNELS.STORAGE_REMOVE, async (_, key) => {
    return await handleStorageRemove(key);
  });

  // Activity handlers
  ipcMain.handle(IPC_CHANNELS.ACTIVITY_TYPING, async () => {
    return await handleActivityTyping();
  });
}

/**
 * Unregister all IPC handlers
 */
export function unregisterHandlers(): void {
  Object.values(IPC_CHANNELS).forEach(channel => {
    ipcMain.removeAllListeners(channel);
  });
}
