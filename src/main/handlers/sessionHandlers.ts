import { ipcMain } from 'electron';
import { SessionService } from '../services/sessionService';
import { StorageService } from '../services/storageService';
import { isValidGoal } from '../utils/validation';
import { 
  SessionStartRequest, 
  SessionStartResponse,
  SessionStopRequest, 
  SessionStopResponse,
  SessionGetRequest, 
  SessionGetResponse,
  SessionListResponse,
  IPC_CHANNELS,
  ERROR_CODES,
  createSuccessResult,
  createErrorResult,
  toStructuredError
} from '../types/ipc';

let sessionService: SessionService;

/**
 * Initialize session service
 */
export function initializeSessionService(storageService: StorageService): void {
  sessionService = new SessionService(storageService);
}

/**
 * Handle session start operation
 */
export async function handleSessionStart(request: SessionStartRequest) {
  try {
    // Validate goal before starting session
    if (!isValidGoal(request.goalType, request.goalValue)) {
      return createErrorResult(toStructuredError(
        new Error(`Invalid goal: ${request.goalType} goal value ${request.goalValue} is out of range`),
        ERROR_CODES.VALIDATION_ERROR
      ));
    }

    const session = await sessionService.startSession(
      request.name,
      request.title,
      request.goalType,
      request.goalValue
    );
    
    const response: SessionStartResponse = { session };
    
    return createSuccessResult(response);
  } catch (error) {
    const structuredError = toStructuredError(error, ERROR_CODES.SESSION_NOT_ACTIVE);
    return createErrorResult(structuredError);
  }
}

/**
 * Handle session stop operation
 */
export async function handleSessionStop(request: SessionStopRequest) {
  try {
    // Validate input
    if (!request.sessionId || request.sessionId.trim() === '') {
      return createErrorResult(toStructuredError(
        new Error('Session ID is required'),
        ERROR_CODES.VALIDATION_ERROR
      ));
    }

    await sessionService.stopSession(request.sessionId);
    const response: SessionStopResponse = { success: true };
    
    return createSuccessResult(response);
  } catch (error) {
    // Map specific error codes
    let errorCode: string = ERROR_CODES.SESSION_NOT_ACTIVE;
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        errorCode = ERROR_CODES.SESSION_NOT_FOUND;
      } else if (error.message.includes('already stopped')) {
        errorCode = ERROR_CODES.SESSION_NOT_ACTIVE;
      }
    }
    
    const structuredError = toStructuredError(error, errorCode);
    return createErrorResult(structuredError);
  }
}

/**
 * Handle session get operation
 */
export async function handleSessionGet(request: SessionGetRequest) {
  try {
    // Validate input
    if (!request.sessionId || request.sessionId.trim() === '') {
      return createErrorResult(toStructuredError(
        new Error('Session ID is required'),
        ERROR_CODES.VALIDATION_ERROR
      ));
    }

    const session = sessionService.getSession(request.sessionId);
    if (!session) {
      return createErrorResult(toStructuredError(
        new Error(`Session not found: ${request.sessionId}`),
        ERROR_CODES.SESSION_NOT_FOUND
      ));
    }

    const response: SessionGetResponse = { session };
    
    return createSuccessResult(response);
  } catch (error) {
    const structuredError = toStructuredError(error, ERROR_CODES.SESSION_NOT_FOUND);
    return createErrorResult(structuredError);
  }
}

/**
 * Handle session list operation
 */
export async function handleSessionList() {
  try {
    const sessions = sessionService.listSessions();
    const response: SessionListResponse = { sessions };
    
    return createSuccessResult(response);
  } catch (error) {
    const structuredError = toStructuredError(error, ERROR_CODES.UNKNOWN_ERROR);
    return createErrorResult(structuredError);
  }
}

/**
 * Register all session IPC handlers
 */
export function registerSessionHandlers(): void {
  if (!sessionService) {
    throw new Error('SessionService not initialized. Call initializeSessionService first.');
  }

  ipcMain.handle(IPC_CHANNELS.SESSION_START, async (_, request: SessionStartRequest) => {
    return await handleSessionStart(request);
  });

  ipcMain.handle(IPC_CHANNELS.SESSION_STOP, async (_, request: SessionStopRequest) => {
    return await handleSessionStop(request);
  });

  ipcMain.handle(IPC_CHANNELS.SESSION_GET, async (_, request: SessionGetRequest) => {
    return await handleSessionGet(request);
  });

  ipcMain.handle(IPC_CHANNELS.SESSION_LIST, async () => {
    return await handleSessionList();
  });
}

/**
 * Unregister all session IPC handlers
 */
export function unregisterSessionHandlers(): void {
  ipcMain.removeAllListeners(IPC_CHANNELS.SESSION_START);
  ipcMain.removeAllListeners(IPC_CHANNELS.SESSION_STOP);
  ipcMain.removeAllListeners(IPC_CHANNELS.SESSION_GET);
  ipcMain.removeAllListeners(IPC_CHANNELS.SESSION_LIST);
}
