import { ipcMain } from 'electron';
import { FileService } from '../services/fileService';
import { 
  FileReadRequest, 
  FileReadResponse,
  FileWriteRequest, 
  FileWriteResponse,
  FileListRequest, 
  FileListResponse,
  FileExistsRequest, 
  FileExistsResponse,
  IPC_CHANNELS,
  ERROR_CODES,
  createSuccessResult,
  createErrorResult,
  toStructuredError
} from '../types/ipc';

let fileService: FileService;

/**
 * Initialize file service with the app data directory
 */
export function initializeFileService(appDataPath: string): void {
  fileService = new FileService(appDataPath);
}

/**
 * Handle file read operation
 */
export async function handleFileRead(request: FileReadRequest) {
  try {
    // Validate input
    if (!request.path || request.path.trim() === '') {
      return createErrorResult(toStructuredError(
        new Error('Path is required'),
        ERROR_CODES.VALIDATION_ERROR
      ));
    }

    const content = await fileService.readFile(request.path);
    const response: FileReadResponse = { content };
    
    return createSuccessResult(response);
  } catch (error) {
    // Map specific error codes
    const errorCode = (error as NodeJS.ErrnoException)?.code === 'ENOENT'
      ? ERROR_CODES.FILE_NOT_FOUND 
      : ERROR_CODES.FILE_READ_ERROR;
    
    const structuredError = toStructuredError(error, errorCode);
    return createErrorResult(structuredError);
  }
}

/**
 * Handle file write operation
 */
export async function handleFileWrite(request: FileWriteRequest) {
  try {
    // Validate input
    if (!request.path || request.path.trim() === '') {
      return createErrorResult(toStructuredError(
        new Error('Path is required'),
        ERROR_CODES.VALIDATION_ERROR
      ));
    }

    if (request.content === undefined || request.content === null || request.content === '') {
      return createErrorResult(toStructuredError(
        new Error('Content is required'),
        ERROR_CODES.VALIDATION_ERROR
      ));
    }

    await fileService.writeFile(request.path, request.content);
    const response: FileWriteResponse = { success: true };
    
    return createSuccessResult(response);
  } catch (error) {
    const structuredError = toStructuredError(error, ERROR_CODES.FILE_WRITE_ERROR);
    
    return createErrorResult(structuredError);
  }
}

/**
 * Handle file list operation
 */
export async function handleFileList(request: FileListRequest) {
  try {
    // Validate input
    if (!request.path || request.path.trim() === '') {
      return createErrorResult(toStructuredError(
        new Error('Path is required'),
        ERROR_CODES.VALIDATION_ERROR
      ));
    }

    const files = await fileService.listFiles(request.path);
    const response: FileListResponse = { files };
    
    return createSuccessResult(response);
  } catch (error) {
    // Map specific error codes
    const errorCode = (error as NodeJS.ErrnoException)?.code === 'ENOENT' 
      ? ERROR_CODES.FILE_NOT_FOUND 
      : ERROR_CODES.FILE_LIST_ERROR;
    
    const structuredError = toStructuredError(error, errorCode);
    return createErrorResult(structuredError);
  }
}

/**
 * Handle file exists check
 */
export async function handleFileExists(request: FileExistsRequest) {
  try {
    // Validate input
    if (!request.path || request.path.trim() === '') {
      return createErrorResult(toStructuredError(
        new Error('Path is required'),
        ERROR_CODES.VALIDATION_ERROR
      ));
    }

    const exists = await fileService.fileExists(request.path);
    const response: FileExistsResponse = { exists };
    
    return createSuccessResult(response);
  } catch (error) {
    const structuredError = toStructuredError(error, ERROR_CODES.UNKNOWN_ERROR);
    
    return createErrorResult(structuredError);
  }
}

/**
 * Register all file IPC handlers
 */
export function registerFileHandlers(): void {
  if (!fileService) {
    throw new Error('FileService not initialized. Call initializeFileService first.');
  }

  ipcMain.handle(IPC_CHANNELS.FILE_READ, async (_, request: FileReadRequest) => {
    return await handleFileRead(request);
  });

  ipcMain.handle(IPC_CHANNELS.FILE_WRITE, async (_, request: FileWriteRequest) => {
    return await handleFileWrite(request);
  });

  ipcMain.handle(IPC_CHANNELS.FILE_LIST, async (_, request: FileListRequest) => {
    return await handleFileList(request);
  });

  ipcMain.handle(IPC_CHANNELS.FILE_EXISTS, async (_, request: FileExistsRequest) => {
    return await handleFileExists(request);
  });
}

/**
 * Unregister all file IPC handlers
 */
export function unregisterFileHandlers(): void {
  ipcMain.removeAllListeners(IPC_CHANNELS.FILE_READ);
  ipcMain.removeAllListeners(IPC_CHANNELS.FILE_WRITE);
  ipcMain.removeAllListeners(IPC_CHANNELS.FILE_LIST);
  ipcMain.removeAllListeners(IPC_CHANNELS.FILE_EXISTS);
}