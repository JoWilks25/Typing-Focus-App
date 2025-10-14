import { ipcMain, BrowserWindow, dialog, app, shell } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import { SessionManager } from './services/sessionManager';
import { FileManager } from './services/fileManager';
import { inactivityService } from './services/InactivityService';
import { focusMonitorService } from './services/FocusMonitorService';
import { floatingModalService, type FloatingModalOptions } from './services/FloatingModalService';
import { isValidGoal } from './utils/validation';
import type { Session } from './types/session';
// import type { GoalType } from '../../shared/types/validation';
type GoalType = 'word' | 'time';

// Simple IPC channels
export const IPC_CHANNELS = {
  // Session operations
  SESSION_START: 'session:start',
  SESSION_STOP: 'session:stop',
  SESSION_END: 'session:end',
  SESSION_GET: 'session:get',
  SESSION_GET_ACTIVE: 'session:get-active',
  SESSION_GET_LAST_ENDED: 'session:get-last-ended',
  SESSION_LIST: 'session:list',
  SESSION_UPDATE_CONTENT: 'session:update-content',
  SESSION_UPDATE_PROGRESS: 'session:update-progress',
  SESSION_STATS: 'session:stats',
  
  // File operations
  FILE_READ: 'file:read',
  FILE_READ_EXTERNAL: 'file:read-external',
  FILE_WRITE: 'file:write',
  FILE_EXISTS: 'file:exists',
  FILE_AUTOSAVE: 'file:autosave',
  
  // Storage operations
  STORAGE_SET: 'storage:set',
  STORAGE_GET: 'storage:get',
  STORAGE_REMOVE: 'storage:remove',
  
  // Activity operations
  ACTIVITY_TYPING: 'activity:typing',
  
  // Distraction operations
  SESSION_INCREMENT_DISTRACTION: 'session:increment-distraction',
  SESSION_ABANDON: 'session:abandon',
  
  // Session pause operations
  SESSION_PAUSE: 'session:pause',
  SESSION_RESUME: 'session:resume',
  
  // Floating modal operations
  FLOATING_MODAL_CREATE: 'floating-modal:create',
  FLOATING_MODAL_CLOSE: 'floating-modal:close',
  FLOATING_MODAL_CLOSE_ALL: 'floating-modal:close-all',
  FLOATING_MODAL_MINIMIZE: 'floating-modal:minimize',
  FLOATING_MODAL_MOVE: 'floating-modal:move',
  FLOATING_MODAL_RESIZE: 'floating-modal:resize',
  FLOATING_MODAL_GET: 'floating-modal:get',
  FLOATING_MODAL_GET_ALL: 'floating-modal:get-all',
  FLOATING_MODAL_HAS: 'floating-modal:has',
  FLOATING_MODAL_UPDATE_CONTENT: 'floating-modal:update-content',
  FLOATING_MODAL_EXECUTE_JAVASCRIPT: 'floating-modal:execute-javascript',
  
  // Window focus operations
  FOCUS_MAIN_WINDOW: 'focus:main-window',
  
  // Distraction warning operations
  DISTRACTION_WARNING_RETURN: 'distraction-warning:return',
  DISTRACTION_WARNING_END_SESSION: 'distraction-warning:end-session',
  
  // Dialog operations
  DIALOG_SHOW_OPEN_DIRECTORY: 'dialog:show-open-directory',
  DIALOG_GET_DEFAULT_SAVE_DIRECTORY: 'dialog:get-default-save-directory',
  DIALOG_OPEN_FOLDER: 'dialog:open-folder',
  DIALOG_SHOW_OPEN_FILE: 'dialog:show-open-file'
} as const;

let sessionManager: SessionManager;
let fileManager: FileManager;

// Export sessionManager for use in main process
export function getSessionManager(): SessionManager | undefined {
  return sessionManager;
}

/**
 * Initialize services
 */
export function initializeServices(appDataPath: string): void {
  sessionManager = new SessionManager();
  fileManager = new FileManager(appDataPath);
  
  // Set file manager reference in session manager
  sessionManager.setFileManager(fileManager);
  
  // Set session manager reference in focus monitor service
  focusMonitorService.setSessionManager(sessionManager);
}

/**
 * Session Handlers
 */

async function handleSessionStart(
  filePath: string,
  name?: string,
  title?: string,
  goalType: GoalType = 'word',
  goalValue: number = 500,
  initialContent?: string
): Promise<Session> {
  if (!filePath || filePath.trim() === '') {
    throw new Error('File path is required');
  }
  
  if (!isValidGoal(goalType, goalValue)) {
    throw new Error(`Invalid goal: ${goalType} goal value ${goalValue} is out of range`);
  }

  const session = await sessionManager.startSession(filePath, name, title, goalType, goalValue, initialContent);
  
  // Start tracking services for the new session
  inactivityService.startTracking();
  focusMonitorService.startMonitoring();
  
  return session;
}

async function handleSessionStop(sessionId: string): Promise<Session> {
  if (!sessionId || sessionId.trim() === '') {
    throw new Error('Session ID is required');
  }

  const session = await sessionManager.stopSession(sessionId);
  
  // Stop tracking services when session ends
  inactivityService.stopTracking();
  focusMonitorService.stopMonitoring();
  
  return session;
}

async function handleSessionEnd(sessionId: string, finalContent: string, finalWordCount: number): Promise<Session> {
  if (!sessionId || sessionId.trim() === '') {
    throw new Error('Session ID is required');
  }

  if (typeof finalWordCount !== 'number' || finalWordCount < 0) {
    throw new Error('Final word count must be a non-negative number');
  }

  // End the session with final data
  const session = await sessionManager.endSession(sessionId, finalContent, finalWordCount);
  
  // Write session to history file
  await fileManager.appendSessionHistory(session);
  
  // Clear active session from storage
  await fileManager.remove('active-session');
  
  // Stop tracking services when session ends
  inactivityService.stopTracking();
  focusMonitorService.stopMonitoring();
  
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

async function handleSessionGetLastEnded(): Promise<Session | null> {
  return await fileManager.getLastEndedSession();
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
  progressPercentage: number
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

  return await sessionManager.updateProgress(sessionId, currentWords, timeElapsed, progressPercentage);
}

async function handleSessionStats(sessionId: string) {
  if (!sessionId || sessionId.trim() === '') {
    throw new Error('Session ID is required');
  }

  return sessionManager.getSessionStats(sessionId);
}

async function handleSessionPause(sessionId: string): Promise<Session> {
  if (!sessionId || sessionId.trim() === '') {
    throw new Error('Session ID is required');
  }
  return await sessionManager.pauseSession(sessionId);
}

async function handleSessionResume(sessionId: string): Promise<Session> {
  if (!sessionId || sessionId.trim() === '') {
    throw new Error('Session ID is required');
  }
  return await sessionManager.resumeSession(sessionId);
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

async function handleFileReadExternal(path: string): Promise<string> {
  if (!path || path.trim() === '') {
    throw new Error('Path is required');
  }

  return await fileManager.readFileExternal(path);
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
 * Distraction Handlers
 */

async function handleSessionIncrementDistraction(sessionId: string): Promise<Session> {
  if (!sessionId || sessionId.trim() === '') {
    throw new Error('Session ID is required');
  }

  return sessionManager.incrementDistractionCount(sessionId);
}

async function handleSessionAbandon(sessionId: string): Promise<Session> {
  if (!sessionId || sessionId.trim() === '') {
    throw new Error('Session ID is required');
  }

  const session = sessionManager.abandonSession(sessionId);
  
  // Write abandoned session to history file
  await fileManager.appendSessionHistory(session);
  
  // Clear active session from storage
  await fileManager.remove('active-session');
  
  return session;
}

/**
 * Floating Modal Handlers
 */

async function handleFloatingModalCreate(options: FloatingModalOptions = {}): Promise<string> {
  return floatingModalService.createModal(options);
}

async function handleFloatingModalClose(id: string): Promise<boolean> {
  if (!id || id.trim() === '') {
    throw new Error('Modal ID is required');
  }

  return floatingModalService.closeModal(id);
}

async function handleFloatingModalCloseAll(): Promise<void> {
  floatingModalService.closeAllModals();
}

async function handleFloatingModalMinimize(id: string): Promise<boolean> {
  if (!id || id.trim() === '') {
    throw new Error('Modal ID is required');
  }

  return floatingModalService.minimizeModal(id);
}

async function handleFloatingModalMove(id: string, x: number, y: number): Promise<boolean> {
  if (!id || id.trim() === '') {
    throw new Error('Modal ID is required');
  }

  if (typeof x !== 'number' || typeof y !== 'number') {
    throw new Error('X and Y coordinates must be numbers');
  }

  return floatingModalService.moveModal(id, x, y);
}

async function handleFloatingModalResize(id: string, width: number, height: number): Promise<boolean> {
  if (!id || id.trim() === '') {
    throw new Error('Modal ID is required');
  }

  if (typeof width !== 'number' || typeof height !== 'number') {
    throw new Error('Width and height must be numbers');
  }

  if (width < 200 || height < 150) {
    throw new Error('Minimum size is 200x150 pixels');
  }

  return floatingModalService.resizeModal(id, width, height);
}

async function handleFloatingModalGet(id: string) {
  if (!id || id.trim() === '') {
    throw new Error('Modal ID is required');
  }

  const modal = floatingModalService.getModal(id);
  if (!modal) {
    return null;
  }

  return {
    id: modal.id,
    options: modal.options,
    isVisible: !modal.window.isDestroyed() && modal.window.isVisible(),
    isMinimized: modal.window.isMinimized(),
    position: modal.window.getPosition(),
    size: modal.window.getSize()
  };
}

async function handleFloatingModalGetAll() {
  return floatingModalService.getAllModals().map(modal => ({
    id: modal.id,
    options: modal.options,
    isVisible: !modal.window.isDestroyed() && modal.window.isVisible(),
    isMinimized: modal.window.isMinimized(),
    position: modal.window.getPosition(),
    size: modal.window.getSize()
  }));
}

async function handleFloatingModalHas(id: string): Promise<boolean> {
  if (!id || id.trim() === '') {
    throw new Error('Modal ID is required');
  }

  return floatingModalService.hasModal(id);
}

async function handleFloatingModalUpdateContent(id: string, content: string): Promise<boolean> {
  if (!id || id.trim() === '') {
    throw new Error('Modal ID is required');
  }

  const modal = floatingModalService.getModal(id);
  if (!modal) {
    return false;
  }

  modal.window.webContents.executeJavaScript(`
    const contentDiv = document.getElementById('modal-content');
    if (contentDiv) {
      contentDiv.innerHTML = \`${content.replace(/`/g, '\\`')}\`;
    }
  `);

  return true;
}

async function handleFloatingModalExecuteJavaScript(id: string, script: string): Promise<void> {
  if (!id || id.trim() === '') {
    throw new Error('Modal ID is required');
  }

  return floatingModalService.executeJavaScript(id, script);
}

/**
 * Dialog Handlers
 */

async function handleDialogShowOpenDirectory(): Promise<{ directoryPath?: string; canceled: boolean }> {
  const result = await dialog.showOpenDialog({
    title: 'Choose Save Directory',
    properties: ['openDirectory', 'createDirectory'],
    defaultPath: await handleDialogGetDefaultSaveDirectory()
  });
  return { 
    directoryPath: result.filePaths[0], 
    canceled: result.canceled 
  };
}

async function handleDialogGetDefaultSaveDirectory(): Promise<string> {
  // Default to ~/Documents/Writing
  const documentsPath = app.getPath('documents');
  const defaultPath = path.join(documentsPath, 'Writing');
  
  // Ensure directory exists
  await fs.mkdir(defaultPath, { recursive: true });
  
  return defaultPath;
}

async function handleDialogOpenFolder(filePath: string): Promise<void> {
  try {
    // Get the directory containing the file
    const directoryPath = path.dirname(filePath);
    
    console.log('Opening folder:', directoryPath);
    
    // Open the folder in the system's default file manager
    await shell.openPath(directoryPath);
    
    console.log('Successfully opened folder');
  } catch (error) {
    console.error('Error opening folder:', error);
    throw error;
  }
}

async function handleDialogShowOpenFile(): Promise<{ filePath?: string; canceled: boolean }> {
  const result = await dialog.showOpenDialog({
    title: 'Open Existing File',
    properties: ['openFile'],
    filters: [
      { name: 'Text Files', extensions: ['txt'] },
      { name: 'All Files', extensions: ['*'] }
    ],
    defaultPath: await handleDialogGetDefaultSaveDirectory()
  });
  return { 
    filePath: result.filePaths[0], 
    canceled: result.canceled 
  };
}

/**
 * Window Focus Handlers
 */

async function handleFocusMainWindow(): Promise<void> {
  const mainWindow = BrowserWindow.getAllWindows().find(window => !window.isDestroyed());
  if (mainWindow) {
    mainWindow.focus();
    mainWindow.show();
    mainWindow.moveTop();
  }
}

/**
 * Register all IPC handlers
 */
export function registerHandlers(): void {
  if (!sessionManager || !fileManager) {
    throw new Error('Services not initialized. Call initializeServices first.');
  }
  
  console.log('Registering IPC handlers...');
  console.log('sessionManager:', !!sessionManager);
  console.log('fileManager:', !!fileManager);

  // Session handlers
  ipcMain.handle(IPC_CHANNELS.SESSION_START, async (_, filePath, name, title, goalType, goalValue, initialContent) => {
    return await handleSessionStart(filePath, name, title, goalType, goalValue, initialContent);
  });

  ipcMain.handle(IPC_CHANNELS.SESSION_STOP, async (_, sessionId) => {
    return await handleSessionStop(sessionId);
  });

  ipcMain.handle(IPC_CHANNELS.SESSION_END, async (_, sessionId, finalContent, finalWordCount) => {
    return await handleSessionEnd(sessionId, finalContent, finalWordCount);
  });

  ipcMain.handle(IPC_CHANNELS.SESSION_GET, async (_, sessionId) => {
    return await handleSessionGet(sessionId);
  });

  ipcMain.handle(IPC_CHANNELS.SESSION_GET_ACTIVE, async () => {
    return await handleSessionGetActive();
  });

  ipcMain.handle(IPC_CHANNELS.SESSION_GET_LAST_ENDED, async () => {
    return await handleSessionGetLastEnded();
  });

  ipcMain.handle(IPC_CHANNELS.SESSION_LIST, async () => {
    return await handleSessionList();
  });

  ipcMain.handle(IPC_CHANNELS.SESSION_UPDATE_CONTENT, async (_, sessionId, content) => {
    return await handleSessionUpdateContent(sessionId, content);
  });

  ipcMain.handle(IPC_CHANNELS.SESSION_UPDATE_PROGRESS, async (_, sessionId, currentWords, timeElapsed, progressPercentage) => {
    return await handleSessionUpdateProgress(sessionId, currentWords, timeElapsed, progressPercentage);
  });

  ipcMain.handle(IPC_CHANNELS.SESSION_STATS, async (_, sessionId) => {
    return await handleSessionStats(sessionId);
  });

  // File handlers
  ipcMain.handle(IPC_CHANNELS.FILE_READ, async (_, path) => {
    return await handleFileRead(path);
  });

  ipcMain.handle(IPC_CHANNELS.FILE_READ_EXTERNAL, async (_, path) => {
    return await handleFileReadExternal(path);
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

  // Distraction handlers
  ipcMain.handle(IPC_CHANNELS.SESSION_INCREMENT_DISTRACTION, async (_, sessionId) => {
    return await handleSessionIncrementDistraction(sessionId);
  });

  ipcMain.handle(IPC_CHANNELS.SESSION_ABANDON, async (_, sessionId) => {
    return await handleSessionAbandon(sessionId);
  });

  // Session pause handlers
  ipcMain.handle(IPC_CHANNELS.SESSION_PAUSE, async (_, sessionId) => {
    return await handleSessionPause(sessionId);
  });

  ipcMain.handle(IPC_CHANNELS.SESSION_RESUME, async (_, sessionId) => {
    return await handleSessionResume(sessionId);
  });

  // Floating modal handlers
  ipcMain.handle(IPC_CHANNELS.FLOATING_MODAL_CREATE, async (_, options) => {
    return await handleFloatingModalCreate(options);
  });

  ipcMain.handle(IPC_CHANNELS.FLOATING_MODAL_CLOSE, async (event, id) => {
    // If no ID provided, try to find modal by window
    if (!id) {
      const window = BrowserWindow.fromWebContents(event.sender);
      if (window) {
        const modal = Array.from(floatingModalService.getAllModals()).find(m => m.window === window);
        if (modal) {
          return await handleFloatingModalClose(modal.id);
        }
      }
      return false;
    }
    return await handleFloatingModalClose(id);
  });

  ipcMain.handle(IPC_CHANNELS.FLOATING_MODAL_CLOSE_ALL, async () => {
    return await handleFloatingModalCloseAll();
  });

  ipcMain.handle(IPC_CHANNELS.FLOATING_MODAL_MINIMIZE, async (event, id) => {
    // If no ID provided, try to find modal by window
    if (!id) {
      const window = BrowserWindow.fromWebContents(event.sender);
      if (window) {
        const modal = Array.from(floatingModalService.getAllModals()).find(m => m.window === window);
        if (modal) {
          return await handleFloatingModalMinimize(modal.id);
        }
      }
      return false;
    }
    return await handleFloatingModalMinimize(id);
  });

  ipcMain.handle(IPC_CHANNELS.FLOATING_MODAL_MOVE, async (event, id, x, y) => {
    // If no ID provided, try to find modal by window
    if (!id) {
      const window = BrowserWindow.fromWebContents(event.sender);
      if (window) {
        const modal = Array.from(floatingModalService.getAllModals()).find(m => m.window === window);
        if (modal) {
          return await handleFloatingModalMove(modal.id, x, y);
        }
      }
      return false;
    }
    return await handleFloatingModalMove(id, x, y);
  });

  ipcMain.handle(IPC_CHANNELS.FLOATING_MODAL_RESIZE, async (_, id, width, height) => {
    return await handleFloatingModalResize(id, width, height);
  });

  ipcMain.handle(IPC_CHANNELS.FLOATING_MODAL_GET, async (_, id) => {
    return await handleFloatingModalGet(id);
  });

  ipcMain.handle(IPC_CHANNELS.FLOATING_MODAL_GET_ALL, async () => {
    return await handleFloatingModalGetAll();
  });

  ipcMain.handle(IPC_CHANNELS.FLOATING_MODAL_HAS, async (_, id) => {
    return await handleFloatingModalHas(id);
  });

  ipcMain.handle(IPC_CHANNELS.FLOATING_MODAL_UPDATE_CONTENT, async (_, id, content) => {
    return await handleFloatingModalUpdateContent(id, content);
  });

  ipcMain.handle(IPC_CHANNELS.FLOATING_MODAL_EXECUTE_JAVASCRIPT, async (_, id, script) => {
    return await handleFloatingModalExecuteJavaScript(id, script);
  });

  // Dialog handlers
  ipcMain.handle(IPC_CHANNELS.DIALOG_SHOW_OPEN_DIRECTORY, async () => {
    return await handleDialogShowOpenDirectory();
  });

  ipcMain.handle(IPC_CHANNELS.DIALOG_GET_DEFAULT_SAVE_DIRECTORY, async () => {
    return await handleDialogGetDefaultSaveDirectory();
  });

  try {
    ipcMain.handle(IPC_CHANNELS.DIALOG_OPEN_FOLDER, async (_, filePath) => {
      console.log('IPC: dialog:open-folder handler called with filePath:', filePath);
      return await handleDialogOpenFolder(filePath);
    });
    console.log('Successfully registered dialog:open-folder handler');
  } catch (error) {
    console.error('Error registering dialog:open-folder handler:', error);
  }

  ipcMain.handle(IPC_CHANNELS.DIALOG_SHOW_OPEN_FILE, async () => {
    return await handleDialogShowOpenFile();
  });

  console.log('Dialog handlers registered, including dialog:open-folder');

  // Window focus handlers
  ipcMain.handle(IPC_CHANNELS.FOCUS_MAIN_WINDOW, async () => {
    return await handleFocusMainWindow();
  });

  // Distraction warning handlers
  ipcMain.on(IPC_CHANNELS.DISTRACTION_WARNING_RETURN, async (event, modalId) => {
    console.log('IPC: Received distraction-warning:return with modalId:', modalId);
    
    // Focus the main window first
    await handleFocusMainWindow();
    
    // Try to close the floating modal by ID first, then by window
    let closed = floatingModalService.closeModal(modalId);
    if (!closed && modalId && modalId.startsWith('temp-modal-')) {
      // If it's a temp ID, find the modal by the window that sent the message
      const modalWindow = BrowserWindow.fromWebContents(event.sender);
      if (modalWindow) {
        const modal = Array.from(floatingModalService.getAllModals()).find(m => m.window === modalWindow);
        if (modal) {
          console.log('IPC: Found modal by window, closing with ID:', modal.id);
          closed = floatingModalService.closeModal(modal.id);
        }
      }
    }
    console.log('IPC: Modal closed:', closed);
    
    // Send event to renderer to handle return action
    const mainWindow = BrowserWindow.getAllWindows().find(window => !window.isDestroyed());
    if (mainWindow) {
      console.log('IPC: Sending distraction-warning:return to main window');
      mainWindow.webContents.send('distraction-warning:return');
    } else {
      console.error('IPC: No main window found to send return event');
    }
  });

  ipcMain.on(IPC_CHANNELS.DISTRACTION_WARNING_END_SESSION, async (event, modalId) => {
    console.log('IPC: Received distraction-warning:end-session with modalId:', modalId);
    
    // Focus the main window first
    await handleFocusMainWindow();
    
    // Try to close the floating modal by ID first, then by window
    let closed = floatingModalService.closeModal(modalId);
    if (!closed && modalId && modalId.startsWith('temp-modal-')) {
      // If it's a temp ID, find the modal by the window that sent the message
      const modalWindow = BrowserWindow.fromWebContents(event.sender);
      if (modalWindow) {
        const modal = Array.from(floatingModalService.getAllModals()).find(m => m.window === modalWindow);
        if (modal) {
          console.log('IPC: Found modal by window, closing with ID:', modal.id);
          closed = floatingModalService.closeModal(modal.id);
        }
      }
    }
    console.log('IPC: Modal closed:', closed);
    
    // Send event to renderer to handle end session action
    const mainWindow = BrowserWindow.getAllWindows().find(window => !window.isDestroyed());
    if (mainWindow) {
      console.log('IPC: Sending distraction-warning:end-session to main window');
      mainWindow.webContents.send('distraction-warning:end-session');
    } else {
      console.error('IPC: No main window found to send end-session event');
    }
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
