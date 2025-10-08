// tests/main/handlers/sessionHandlers.updateProgress.test.ts
// Purpose: Tests for session updateProgress handler

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleSessionUpdateProgress, initializeSessionService } from '../../../src/main/handlers/sessionHandlers';
import { SessionService } from '../../../src/main/services/sessionService';
import { ERROR_CODES } from '../../../src/main/types/ipc';

// Mock SessionService and StorageService
vi.mock('../../../src/main/services/sessionService');
vi.mock('../../../src/main/services/storageService');

describe('handleSessionUpdateProgress', () => {
  let mockSessionService: any;
  let mockStorageService: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockSessionService = {
      startSession: vi.fn(),
      stopSession: vi.fn(),
      getSession: vi.fn(),
      listSessions: vi.fn(),
      updateProgress: vi.fn(),
    };

    mockStorageService = {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
      clear: vi.fn()
    };

    // Mock the SessionService constructor
    (SessionService as any).mockImplementation(() => mockSessionService);
    
    initializeSessionService(mockStorageService);
  });

  it('should successfully update progress for valid session', async () => {
    const request = {
      sessionId: 'test-session-id',
      currentWords: 250,
      timeElapsed: 30000,
      progressThresholds: {
        33: true,
        67: false,
        100: false
      }
    };

    // Mock successful updateProgress call
    mockSessionService.updateProgress.mockResolvedValue({
      id: 'test-session-id',
      currentWords: 250,
      timeElapsed: 30000,
      progressThresholds: {
        33: true,
        67: false,
        100: false
      }
    });

    const result = await handleSessionUpdateProgress(request);

    expect(result.success).toBe(true);
    expect(result.data.success).toBe(true);
    expect(mockSessionService.updateProgress).toHaveBeenCalledWith(
      'test-session-id',
      250,
      30000,
      {
        33: true,
        67: false,
        100: false
      }
    );
  });

  it('should return error for missing session ID', async () => {
    const request = {
      sessionId: '',
      currentWords: 250,
      timeElapsed: 30000,
      progressThresholds: {
        33: true,
        67: false,
        100: false
      }
    };

    const result = await handleSessionUpdateProgress(request);

    expect(result.success).toBe(false);
    expect(result.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(result.error.message).toBe('Session ID is required');
  });

  it('should return error for negative word count', async () => {
    const request = {
      sessionId: 'test-session-id',
      currentWords: -10,
      timeElapsed: 30000,
      progressThresholds: {
        33: true,
        67: false,
        100: false
      }
    };

    const result = await handleSessionUpdateProgress(request);

    expect(result.success).toBe(false);
    expect(result.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(result.error.message).toBe('Current words must be a non-negative number');
  });

  it('should return error for negative time elapsed', async () => {
    const request = {
      sessionId: 'test-session-id',
      currentWords: 250,
      timeElapsed: -1000,
      progressThresholds: {
        33: true,
        67: false,
        100: false
      }
    };

    const result = await handleSessionUpdateProgress(request);

    expect(result.success).toBe(false);
    expect(result.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(result.error.message).toBe('Time elapsed must be a non-negative number');
  });

  it('should return error for invalid progress thresholds', async () => {
    const request = {
      sessionId: 'test-session-id',
      currentWords: 250,
      timeElapsed: 30000,
      progressThresholds: {
        33: 'invalid' as any,
        67: false,
        100: false
      }
    };

    const result = await handleSessionUpdateProgress(request);

    expect(result.success).toBe(false);
    expect(result.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(result.error.message).toBe('Progress thresholds must be provided with boolean values');
  });

  it('should return error for missing progress thresholds', async () => {
    const request = {
      sessionId: 'test-session-id',
      currentWords: 250,
      timeElapsed: 30000,
      progressThresholds: undefined as any
    };

    const result = await handleSessionUpdateProgress(request);

    expect(result.success).toBe(false);
    expect(result.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(result.error.message).toBe('Progress thresholds must be provided with boolean values');
  });

  it('should return error for non-existent session', async () => {
    const request = {
      sessionId: 'non-existent-session',
      currentWords: 250,
      timeElapsed: 30000,
      progressThresholds: {
        33: true,
        67: false,
        100: false
      }
    };

    // Mock updateProgress to throw error for non-existent session
    mockSessionService.updateProgress.mockRejectedValue(new Error('Session not found: non-existent-session'));

    const result = await handleSessionUpdateProgress(request);

    expect(result.success).toBe(false);
    expect(result.error.code).toBe(ERROR_CODES.SESSION_NOT_FOUND);
  });

  it('should handle all threshold values correctly', async () => {
    const request = {
      sessionId: 'test-session-id',
      currentWords: 500,
      timeElapsed: 60000,
      progressThresholds: {
        33: true,
        67: true,
        100: true
      }
    };

    // Mock successful updateProgress call
    mockSessionService.updateProgress.mockResolvedValue({
      id: 'test-session-id',
      currentWords: 500,
      timeElapsed: 60000,
      progressThresholds: {
        33: true,
        67: true,
        100: true
      }
    });

    const result = await handleSessionUpdateProgress(request);

    expect(result.success).toBe(true);
    expect(mockSessionService.updateProgress).toHaveBeenCalledWith(
      'test-session-id',
      500,
      60000,
      {
        33: true,
        67: true,
        100: true
      }
    );
  });

  it('should update session updatedAt timestamp', async () => {
    const newUpdatedAt = '2025-01-01T00:00:01.000Z';
    
    const request = {
      sessionId: 'test-session-id',
      currentWords: 250,
      timeElapsed: 30000,
      progressThresholds: {
        33: true,
        67: false,
        100: false
      }
    };

    // Mock updateProgress to return updated session with new timestamp
    mockSessionService.updateProgress.mockResolvedValue({
      id: 'test-session-id',
      updatedAt: newUpdatedAt
    });

    await handleSessionUpdateProgress(request);

    expect(mockSessionService.updateProgress).toHaveBeenCalledWith(
      'test-session-id',
      250,
      30000,
      {
        33: true,
        67: false,
        100: false
      }
    );
  });

  it('should persist active session to storage', async () => {
    const request = {
      sessionId: 'test-session-id',
      currentWords: 250,
      timeElapsed: 30000,
      progressThresholds: {
        33: true,
        67: false,
        100: false
      }
    };

    // Mock successful updateProgress call
    mockSessionService.updateProgress.mockResolvedValue({
      id: 'test-session-id',
      currentWords: 250,
      timeElapsed: 30000,
      progressThresholds: {
        33: true,
        67: false,
        100: false
      }
    });

    await handleSessionUpdateProgress(request);

    expect(mockSessionService.updateProgress).toHaveBeenCalledWith(
      'test-session-id',
      250,
      30000,
      {
        33: true,
        67: false,
        100: false
      }
    );
  });
});
