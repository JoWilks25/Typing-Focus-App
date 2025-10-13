// Structured error type for consistent error handling across IPC
import { type GoalType } from '../../shared/types/validation';

export interface StructuredError {
  code: string;
  message: string;
  details?: unknown;
}

// Result type for IPC operations
export type Result<T, E = StructuredError> = 
  | { success: true; data: T }
  | { success: false; error: E };

// File operation types
export interface FileReadRequest {
  path: string;
}

export interface FileReadResponse {
  content: string;
}

export interface FileWriteRequest {
  path: string;
  content: string;
}

export interface FileWriteResponse {
  success: boolean;
}

export interface FileListRequest {
  path: string;
}

export interface FileListResponse {
  files: string[];
}

export interface FileExistsRequest {
  path: string;
}

export interface FileExistsResponse {
  exists: boolean;
}

// Storage operation types
export interface StorageGetRequest {
  key: string;
}

export interface StorageGetResponse {
  value: unknown;
}

export interface StorageSetRequest {
  key: string;
  value: unknown;
}

export interface StorageSetResponse {
  success: boolean;
}

export interface StorageRemoveRequest {
  key: string;
}

export interface StorageRemoveResponse {
  success: boolean;
}

export interface StorageClearResponse {
  success: boolean;
}

// Session operation types
export interface SessionStartRequest {
  name?: string;
  title?: string;
  goalType: GoalType;
  goalValue: number;
}

export interface SessionStartResponse {
  session: {
    id: string;
    name: string;
    title?: string;
    content?: string;
    goalType: GoalType;
    goalValue: number;
    startTime: number;
    endTime?: number;
    status: 'active' | 'stopped';
    createdAt: string;
    updatedAt: string;
  };
}

export interface SessionStopRequest {
  sessionId: string;
}

export interface SessionStopResponse {
  success: boolean;
}

export interface SessionGetRequest {
  sessionId: string;
}

export interface SessionGetResponse {
  session: {
    id: string;
    name: string;
    title?: string;
    content?: string;
    goalType: GoalType;
    goalValue: number;
    startTime: number;
    endTime?: number;
    status: 'active' | 'stopped';
    createdAt: string;
    updatedAt: string;
  };
}

export interface SessionListResponse {
  sessions: Array<{
    id: string;
    name: string;
    title?: string;
    content?: string;
    goalType: GoalType;
    goalValue: number;
    startTime: number;
    endTime?: number;
    status: 'active' | 'stopped';
    createdAt: string;
    updatedAt: string;
    currentWords?: number;
    timeElapsed?: number;
  progressPercentage?: number;
  }>;
}

export interface SessionUpdateProgressRequest {
  sessionId: string;
  currentWords: number;
  timeElapsed: number;
  progressPercentage: number;
}

export interface SessionUpdateProgressResponse {
  success: boolean;
}

// Focus operation types
export interface FocusStartRequest {
  sessionId: string;
}

export interface FocusStartResponse {
  success: boolean;
}

export interface FocusStopRequest {
  sessionId: string;
}

export interface FocusStopResponse {
  success: boolean;
}

export interface FocusStatusRequest {
  sessionId: string;
}

export interface FocusStatusResponse {
  isActive: boolean;
  startTime?: number;
}

// Activity operation types
export interface ActivityRecordRequest {
  sessionId: string;
  activity: {
    type: 'typing' | 'pause' | 'resume';
    timestamp: number;
    data?: unknown;
  };
}

export interface ActivityRecordResponse {
  success: boolean;
}

export interface ActivityStatsRequest {
  sessionId: string;
}

export interface ActivityStatsResponse {
  stats: {
    totalTypingTime: number;
    totalPauseTime: number;
    keystrokes: number;
    wordsPerMinute: number;
  };
}

export interface ActivityResetRequest {
  sessionId: string;
}

export interface ActivityResetResponse {
  success: boolean;
}

// IPC Channel names
export const IPC_CHANNELS = {
  // File operations
  FILE_READ: 'file:read',
  FILE_WRITE: 'file:write',
  FILE_LIST: 'file:list',
  FILE_EXISTS: 'file:exists',
  
  // Storage operations
  STORAGE_GET: 'storage:get',
  STORAGE_SET: 'storage:set',
  STORAGE_REMOVE: 'storage:remove',
  STORAGE_CLEAR: 'storage:clear',
  
  // Session operations
  SESSION_START: 'session:start',
  SESSION_STOP: 'session:stop',
  SESSION_GET: 'session:get',
  SESSION_LIST: 'session:list',
  SESSION_UPDATE_PROGRESS: 'session:updateProgress',
  
  // Focus operations
  FOCUS_START: 'focus:start',
  FOCUS_STOP: 'focus:stop',
  FOCUS_STATUS: 'focus:status',
  
  // Activity operations
  ACTIVITY_RECORD: 'activity:record',
  ACTIVITY_STATS: 'activity:stats',
  ACTIVITY_RESET: 'activity:reset',
} as const;

// Error codes
export const ERROR_CODES = {
  // File errors
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  FILE_READ_ERROR: 'FILE_READ_ERROR',
  FILE_WRITE_ERROR: 'FILE_WRITE_ERROR',
  FILE_LIST_ERROR: 'FILE_LIST_ERROR',
  
  // Storage errors
  STORAGE_READ_ERROR: 'STORAGE_READ_ERROR',
  STORAGE_WRITE_ERROR: 'STORAGE_WRITE_ERROR',
  STORAGE_KEY_NOT_FOUND: 'STORAGE_KEY_NOT_FOUND',
  
  // Session errors
  SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',
  SESSION_ALREADY_ACTIVE: 'SESSION_ALREADY_ACTIVE',
  SESSION_NOT_ACTIVE: 'SESSION_NOT_ACTIVE',
  
  // Focus errors
  FOCUS_ALREADY_ACTIVE: 'FOCUS_ALREADY_ACTIVE',
  FOCUS_NOT_ACTIVE: 'FOCUS_NOT_ACTIVE',
  
  // Activity errors
  ACTIVITY_RECORD_ERROR: 'ACTIVITY_RECORD_ERROR',
  ACTIVITY_STATS_ERROR: 'ACTIVITY_STATS_ERROR',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  
  // General errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

// Helper function to convert errors to structured format
export function toStructuredError(
  error: unknown, 
  code: string, 
  details?: unknown
): StructuredError {
  if (error instanceof Error) {
    return {
      code,
      message: error.message,
      details
    };
  }
  
  if (typeof error === 'string') {
    return {
      code,
      message: error,
      details
    };
  }
  
  return {
    code,
    message: 'Unknown error',
    details
  };
}

// Helper function to create success result
export function createSuccessResult<T>(data: T): Result<T> {
  return { success: true, data };
}

// Helper function to create error result
export function createErrorResult<E = StructuredError>(error: E): Result<never, E> {
  return { success: false, error };
}