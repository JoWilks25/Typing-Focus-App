import { ipcMain } from 'electron';
import { ActivityService } from '../services/activityService';
import { 
  ActivityRecordRequest, 
  ActivityRecordResponse,
  ActivityStatsRequest, 
  ActivityStatsResponse,
  ActivityResetRequest, 
  ActivityResetResponse,
  IPC_CHANNELS,
  ERROR_CODES,
  createSuccessResult,
  createErrorResult,
  toStructuredError
} from '../types/ipc';

let activityService: ActivityService;

/**
 * Initialize activity service
 */
export function initializeActivityService(): void {
  activityService = new ActivityService();
}

/**
 * Handle activity record operation
 */
export async function handleActivityRecord(request: ActivityRecordRequest) {
  try {
    // Validate input
    if (!request.sessionId || request.sessionId.trim() === '') {
      return createErrorResult(toStructuredError(
        new Error('Session ID is required'),
        ERROR_CODES.VALIDATION_ERROR
      ));
    }

    if (!request.activity) {
      return createErrorResult(toStructuredError(
        new Error('Activity is required'),
        ERROR_CODES.VALIDATION_ERROR
      ));
    }

    const result = activityService.recordActivity(request.sessionId, request.activity);
    const response: ActivityRecordResponse = { success: result.success };
    
    return createSuccessResult(response);
  } catch (error) {
    // Map specific error codes
    let errorCode: string = ERROR_CODES.ACTIVITY_RECORD_ERROR;
    if (error instanceof Error) {
      if (error.message.includes('required')) {
        errorCode = ERROR_CODES.VALIDATION_ERROR;
      } else if (error.message.includes('Invalid activity type')) {
        errorCode = ERROR_CODES.VALIDATION_ERROR;
      } else if (error.message.includes('Timestamp must be')) {
        errorCode = ERROR_CODES.VALIDATION_ERROR;
      }
    }
    
    const structuredError = toStructuredError(error, errorCode);
    return createErrorResult(structuredError);
  }
}

/**
 * Handle activity stats operation
 */
export async function handleActivityStats(request: ActivityStatsRequest) {
  try {
    // Validate input
    if (!request.sessionId || request.sessionId.trim() === '') {
      return createErrorResult(toStructuredError(
        new Error('Session ID is required'),
        ERROR_CODES.VALIDATION_ERROR
      ));
    }

    const result = activityService.getActivityStats(request.sessionId);
    const response: ActivityStatsResponse = { stats: result.stats };
    
    return createSuccessResult(response);
  } catch (error) {
    const structuredError = toStructuredError(error, ERROR_CODES.ACTIVITY_STATS_ERROR);
    return createErrorResult(structuredError);
  }
}

/**
 * Handle activity reset operation
 */
export async function handleActivityReset(request: ActivityResetRequest) {
  try {
    // Validate input
    if (!request.sessionId || request.sessionId.trim() === '') {
      return createErrorResult(toStructuredError(
        new Error('Session ID is required'),
        ERROR_CODES.VALIDATION_ERROR
      ));
    }

    const result = activityService.resetActivity(request.sessionId);
    const response: ActivityResetResponse = { success: result.success };
    
    return createSuccessResult(response);
  } catch (error) {
    const structuredError = toStructuredError(error, ERROR_CODES.ACTIVITY_RECORD_ERROR);
    return createErrorResult(structuredError);
  }
}

/**
 * Register all activity IPC handlers
 */
export function registerActivityHandlers(): void {
  if (!activityService) {
    throw new Error('ActivityService not initialized. Call initializeActivityService first.');
  }

  ipcMain.handle(IPC_CHANNELS.ACTIVITY_RECORD, async (_, request: ActivityRecordRequest) => {
    return await handleActivityRecord(request);
  });

  ipcMain.handle(IPC_CHANNELS.ACTIVITY_STATS, async (_, request: ActivityStatsRequest) => {
    return await handleActivityStats(request);
  });

  ipcMain.handle(IPC_CHANNELS.ACTIVITY_RESET, async (_, request: ActivityResetRequest) => {
    return await handleActivityReset(request);
  });
}

/**
 * Unregister all activity IPC handlers
 */
export function unregisterActivityHandlers(): void {
  ipcMain.removeAllListeners(IPC_CHANNELS.ACTIVITY_RECORD);
  ipcMain.removeAllListeners(IPC_CHANNELS.ACTIVITY_STATS);
  ipcMain.removeAllListeners(IPC_CHANNELS.ACTIVITY_RESET);
}
