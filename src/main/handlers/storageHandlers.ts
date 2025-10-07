import { ipcMain } from 'electron';
import { StorageService } from '../services/storageService';
import { 
  StorageGetRequest, 
  StorageGetResponse,
  StorageSetRequest, 
  StorageSetResponse,
  StorageRemoveRequest, 
  StorageRemoveResponse,
  StorageClearResponse,
  IPC_CHANNELS,
  ERROR_CODES,
  createSuccessResult,
  createErrorResult,
  toStructuredError
} from '../types/ipc';

let storageService: StorageService;

/**
 * Initialize storage service with the app data directory
 */
export function initializeStorageService(appDataPath: string): void {
  storageService = new StorageService(appDataPath);
}

/**
 * Handle storage get operation
 */
export async function handleStorageGet(request: StorageGetRequest) {
  try {
    // Validate input
    if (!request.key || request.key.trim() === '') {
      return createErrorResult(toStructuredError(
        new Error('Key is required'),
        ERROR_CODES.VALIDATION_ERROR
      ));
    }

    const value = await storageService.get(request.key);
    const response: StorageGetResponse = { value };
    
    return createSuccessResult(response);
  } catch (error) {
    const structuredError = toStructuredError(error, ERROR_CODES.STORAGE_READ_ERROR);
    return createErrorResult(structuredError);
  }
}

/**
 * Handle storage set operation
 */
export async function handleStorageSet(request: StorageSetRequest) {
  try {
    // Validate input
    if (!request.key || request.key.trim() === '') {
      return createErrorResult(toStructuredError(
        new Error('Key is required'),
        ERROR_CODES.VALIDATION_ERROR
      ));
    }

    if (request.value === undefined) {
      return createErrorResult(toStructuredError(
        new Error('Value is required'),
        ERROR_CODES.VALIDATION_ERROR
      ));
    }

    await storageService.set(request.key, request.value);
    const response: StorageSetResponse = { success: true };
    
    return createSuccessResult(response);
  } catch (error) {
    const structuredError = toStructuredError(error, ERROR_CODES.STORAGE_WRITE_ERROR);
    return createErrorResult(structuredError);
  }
}

/**
 * Handle storage remove operation
 */
export async function handleStorageRemove(request: StorageRemoveRequest) {
  try {
    // Validate input
    if (!request.key || request.key.trim() === '') {
      return createErrorResult(toStructuredError(
        new Error('Key is required'),
        ERROR_CODES.VALIDATION_ERROR
      ));
    }

    await storageService.remove(request.key);
    const response: StorageRemoveResponse = { success: true };
    
    return createSuccessResult(response);
  } catch (error) {
    const structuredError = toStructuredError(error, ERROR_CODES.STORAGE_WRITE_ERROR);
    return createErrorResult(structuredError);
  }
}

/**
 * Handle storage clear operation
 */
export async function handleStorageClear() {
  try {
    await storageService.clear();
    const response: StorageClearResponse = { success: true };
    
    return createSuccessResult(response);
  } catch (error) {
    const structuredError = toStructuredError(error, ERROR_CODES.STORAGE_WRITE_ERROR);
    return createErrorResult(structuredError);
  }
}

/**
 * Register all storage IPC handlers
 */
export function registerStorageHandlers(): void {
  if (!storageService) {
    throw new Error('StorageService not initialized. Call initializeStorageService first.');
  }

  ipcMain.handle(IPC_CHANNELS.STORAGE_GET, async (_, request: StorageGetRequest) => {
    return await handleStorageGet(request);
  });

  ipcMain.handle(IPC_CHANNELS.STORAGE_SET, async (_, request: StorageSetRequest) => {
    return await handleStorageSet(request);
  });

  ipcMain.handle(IPC_CHANNELS.STORAGE_REMOVE, async (_, request: StorageRemoveRequest) => {
    return await handleStorageRemove(request);
  });

  ipcMain.handle(IPC_CHANNELS.STORAGE_CLEAR, async () => {
    return await handleStorageClear();
  });
}

/**
 * Unregister all storage IPC handlers
 */
export function unregisterStorageHandlers(): void {
  ipcMain.removeAllListeners(IPC_CHANNELS.STORAGE_GET);
  ipcMain.removeAllListeners(IPC_CHANNELS.STORAGE_SET);
  ipcMain.removeAllListeners(IPC_CHANNELS.STORAGE_REMOVE);
  ipcMain.removeAllListeners(IPC_CHANNELS.STORAGE_CLEAR);
}
