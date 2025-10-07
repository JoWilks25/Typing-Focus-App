import { ipcMain } from 'electron';
import { FocusService } from '../services/focusService';
import { 
  FocusStartRequest, 
  FocusStartResponse,
  FocusStopRequest, 
  FocusStopResponse,
  FocusStatusRequest, 
  FocusStatusResponse,
  IPC_CHANNELS,
  ERROR_CODES,
  createSuccessResult,
  createErrorResult,
  toStructuredError
} from '../types/ipc';

let focusService: FocusService;

/**
 * Initialize focus service
 */
export function initializeFocusService(): void {
  focusService = new FocusService();
}

/**
 * Handle focus start operation
 */
export async function handleFocusStart(request: FocusStartRequest) {
  try {
    // Validate input
    if (!request.sessionId || request.sessionId.trim() === '') {
      return createErrorResult(toStructuredError(
        new Error('Session ID is required'),
        ERROR_CODES.VALIDATION_ERROR
      ));
    }

    const result = focusService.startFocus(request.sessionId);
    const response: FocusStartResponse = { success: result.success };
    
    return createSuccessResult(response);
  } catch (error) {
    // Map specific error codes
    let errorCode: string = ERROR_CODES.FOCUS_ALREADY_ACTIVE;
    if (error instanceof Error) {
      if (error.message.includes('already active')) {
        errorCode = ERROR_CODES.FOCUS_ALREADY_ACTIVE;
      } else if (error.message.includes('required')) {
        errorCode = ERROR_CODES.VALIDATION_ERROR;
      }
    }
    
    const structuredError = toStructuredError(error, errorCode);
    return createErrorResult(structuredError);
  }
}

/**
 * Handle focus stop operation
 */
export async function handleFocusStop(request: FocusStopRequest) {
  try {
    // Validate input
    if (!request.sessionId || request.sessionId.trim() === '') {
      return createErrorResult(toStructuredError(
        new Error('Session ID is required'),
        ERROR_CODES.VALIDATION_ERROR
      ));
    }

    const result = focusService.stopFocus(request.sessionId);
    const response: FocusStopResponse = { success: result.success };
    
    return createSuccessResult(response);
  } catch (error) {
    // Map specific error codes
    let errorCode: string = ERROR_CODES.FOCUS_NOT_ACTIVE;
    if (error instanceof Error) {
      if (error.message.includes('not active')) {
        errorCode = ERROR_CODES.FOCUS_NOT_ACTIVE;
      } else if (error.message.includes('required')) {
        errorCode = ERROR_CODES.VALIDATION_ERROR;
      }
    }
    
    const structuredError = toStructuredError(error, errorCode);
    return createErrorResult(structuredError);
  }
}

/**
 * Handle focus status operation
 */
export async function handleFocusStatus(request: FocusStatusRequest) {
  try {
    // Validate input
    if (!request.sessionId || request.sessionId.trim() === '') {
      return createErrorResult(toStructuredError(
        new Error('Session ID is required'),
        ERROR_CODES.VALIDATION_ERROR
      ));
    }

    const status = focusService.getFocusStatus(request.sessionId);
    const response: FocusStatusResponse = { 
      isActive: status.isActive,
      startTime: status.startTime
    };
    
    return createSuccessResult(response);
  } catch (error) {
    const structuredError = toStructuredError(error, ERROR_CODES.VALIDATION_ERROR);
    return createErrorResult(structuredError);
  }
}

/**
 * Register all focus IPC handlers
 */
export function registerFocusHandlers(): void {
  if (!focusService) {
    throw new Error('FocusService not initialized. Call initializeFocusService first.');
  }

  ipcMain.handle(IPC_CHANNELS.FOCUS_START, async (_, request: FocusStartRequest) => {
    return await handleFocusStart(request);
  });

  ipcMain.handle(IPC_CHANNELS.FOCUS_STOP, async (_, request: FocusStopRequest) => {
    return await handleFocusStop(request);
  });

  ipcMain.handle(IPC_CHANNELS.FOCUS_STATUS, async (_, request: FocusStatusRequest) => {
    return await handleFocusStatus(request);
  });
}

/**
 * Unregister all focus IPC handlers
 */
export function unregisterFocusHandlers(): void {
  ipcMain.removeAllListeners(IPC_CHANNELS.FOCUS_START);
  ipcMain.removeAllListeners(IPC_CHANNELS.FOCUS_STOP);
  ipcMain.removeAllListeners(IPC_CHANNELS.FOCUS_STATUS);
}
