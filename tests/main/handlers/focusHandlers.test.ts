import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ipcMain } from 'electron';
import { 
  initializeFocusService, 
  handleFocusStart, 
  handleFocusStop, 
  handleFocusStatus,
  registerFocusHandlers,
  unregisterFocusHandlers
} from '../../../src/main/handlers/focusHandlers';
import { 
  FocusStartRequest, 
  FocusStopRequest, 
  FocusStatusRequest,
  ERROR_CODES
} from '../../../src/main/types/ipc';

// Mock electron
vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn(),
    removeAllListeners: vi.fn()
  }
}));

describe('Focus Handlers', () => {
  beforeEach(() => {
    initializeFocusService();
  });

  afterEach(() => {
    unregisterFocusHandlers();
  });

  describe('handleFocusStart', () => {
    it('should start focus for a valid session', async () => {
      const request: FocusStartRequest = { sessionId: 'test-session-1' };
      
      const result = await handleFocusStart(request);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.success).toBe(true);
      }
    });

    it('should return error for empty session ID', async () => {
      const request: FocusStartRequest = { sessionId: '' };
      
      const result = await handleFocusStart(request);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
        expect(result.error.message).toContain('Session ID is required');
      }
    });

    it('should return error for whitespace-only session ID', async () => {
      const request: FocusStartRequest = { sessionId: '   ' };
      
      const result = await handleFocusStart(request);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
        expect(result.error.message).toContain('Session ID is required');
      }
    });

    it('should return error when starting focus for already active session', async () => {
      const request: FocusStartRequest = { sessionId: 'test-session-1' };
      
      // Start focus first time
      await handleFocusStart(request);
      
      // Try to start focus again
      const result = await handleFocusStart(request);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ERROR_CODES.FOCUS_ALREADY_ACTIVE);
        expect(result.error.message).toContain('already active');
      }
    });
  });

  describe('handleFocusStop', () => {
    it('should stop focus for an active session', async () => {
      const request: FocusStopRequest = { sessionId: 'test-session-1' };
      
      // Start focus first
      await handleFocusStart({ sessionId: 'test-session-1' });
      
      // Stop focus
      const result = await handleFocusStop(request);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.success).toBe(true);
      }
    });

    it('should return error for empty session ID', async () => {
      const request: FocusStopRequest = { sessionId: '' };
      
      const result = await handleFocusStop(request);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
        expect(result.error.message).toContain('Session ID is required');
      }
    });

    it('should return error when stopping focus for non-active session', async () => {
      const request: FocusStopRequest = { sessionId: 'test-session-1' };
      
      const result = await handleFocusStop(request);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ERROR_CODES.FOCUS_NOT_ACTIVE);
        expect(result.error.message).toContain('not active');
      }
    });
  });

  describe('handleFocusStatus', () => {
    it('should return active status for focused session', async () => {
      const request: FocusStatusRequest = { sessionId: 'test-session-1' };
      
      // Start focus first
      await handleFocusStart({ sessionId: 'test-session-1' });
      
      const result = await handleFocusStatus(request);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isActive).toBe(true);
        expect(result.data.startTime).toBeGreaterThan(0);
      }
    });

    it('should return inactive status for non-focused session', async () => {
      const request: FocusStatusRequest = { sessionId: 'test-session-1' };
      
      const result = await handleFocusStatus(request);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isActive).toBe(false);
        expect(result.data.startTime).toBeUndefined();
      }
    });

    it('should return inactive status for stopped session', async () => {
      const request: FocusStatusRequest = { sessionId: 'test-session-1' };
      
      // Start and stop focus
      await handleFocusStart({ sessionId: 'test-session-1' });
      await handleFocusStop({ sessionId: 'test-session-1' });
      
      const result = await handleFocusStatus(request);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isActive).toBe(false);
        expect(result.data.startTime).toBeUndefined();
      }
    });

    it('should return error for empty session ID', async () => {
      const request: FocusStatusRequest = { sessionId: '' };
      
      const result = await handleFocusStatus(request);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
        expect(result.error.message).toContain('Session ID is required');
      }
    });
  });

  describe('registerFocusHandlers', () => {
    it('should register all focus IPC handlers', () => {
      // Clear any previous calls
      vi.clearAllMocks();
      
      registerFocusHandlers();
      
      expect(ipcMain.handle).toHaveBeenCalledTimes(3);
      expect(ipcMain.handle).toHaveBeenCalledWith('focus:start', expect.any(Function));
      expect(ipcMain.handle).toHaveBeenCalledWith('focus:stop', expect.any(Function));
      expect(ipcMain.handle).toHaveBeenCalledWith('focus:status', expect.any(Function));
    });

    it('should work when service is properly initialized', () => {
      // Clear mocks and reset service state
      vi.clearAllMocks();
      unregisterFocusHandlers();
      
      // Re-initialize the service
      initializeFocusService();
      
      // This should work since the service is initialized
      expect(() => {
        registerFocusHandlers();
      }).not.toThrow();
    });
  });

  describe('unregisterFocusHandlers', () => {
    it('should unregister all focus IPC handlers', () => {
      // Clear any previous calls
      vi.clearAllMocks();
      
      registerFocusHandlers();
      unregisterFocusHandlers();
      
      expect(ipcMain.removeAllListeners).toHaveBeenCalledTimes(3);
      expect(ipcMain.removeAllListeners).toHaveBeenCalledWith('focus:start');
      expect(ipcMain.removeAllListeners).toHaveBeenCalledWith('focus:stop');
      expect(ipcMain.removeAllListeners).toHaveBeenCalledWith('focus:status');
    });
  });

  describe('integration scenarios', () => {
    it('should handle multiple sessions independently', async () => {
      const session1 = 'session-1';
      const session2 = 'session-2';
      
      // Start focus for both sessions
      await handleFocusStart({ sessionId: session1 });
      await handleFocusStart({ sessionId: session2 });
      
      // Check both are active
      const status1 = await handleFocusStatus({ sessionId: session1 });
      const status2 = await handleFocusStatus({ sessionId: session2 });
      
      expect(status1.success).toBe(true);
      expect(status2.success).toBe(true);
      if (status1.success && status2.success) {
        expect(status1.data.isActive).toBe(true);
        expect(status2.data.isActive).toBe(true);
      }
      
      // Stop focus for session1 only
      await handleFocusStop({ sessionId: session1 });
      
      // Check status after stopping one
      const status1After = await handleFocusStatus({ sessionId: session1 });
      const status2After = await handleFocusStatus({ sessionId: session2 });
      
      expect(status1After.success).toBe(true);
      expect(status2After.success).toBe(true);
      if (status1After.success && status2After.success) {
        expect(status1After.data.isActive).toBe(false);
        expect(status2After.data.isActive).toBe(true);
      }
    });

    it('should handle invalid transitions gracefully', async () => {
      const sessionId = 'test-session';
      
      // Try to stop non-active session
      const stopResult = await handleFocusStop({ sessionId });
      expect(stopResult.success).toBe(false);
      
      // Start focus
      const startResult = await handleFocusStart({ sessionId });
      expect(startResult.success).toBe(true);
      
      // Try to start again (should fail)
      const startAgainResult = await handleFocusStart({ sessionId });
      expect(startAgainResult.success).toBe(false);
      
      // Stop focus
      const stopResult2 = await handleFocusStop({ sessionId });
      expect(stopResult2.success).toBe(true);
      
      // Try to stop again (should fail)
      const stopAgainResult = await handleFocusStop({ sessionId });
      expect(stopAgainResult.success).toBe(false);
    });
  });
});
