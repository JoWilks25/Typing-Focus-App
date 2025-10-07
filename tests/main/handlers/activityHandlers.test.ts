import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ipcMain } from 'electron';
import { 
  initializeActivityService, 
  handleActivityRecord, 
  handleActivityStats, 
  handleActivityReset,
  registerActivityHandlers,
  unregisterActivityHandlers
} from '../../../src/main/handlers/activityHandlers';
import { 
  ActivityRecordRequest, 
  ActivityStatsRequest, 
  ActivityResetRequest,
  ERROR_CODES
} from '../../../src/main/types/ipc';

// Mock electron
vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn(),
    removeAllListeners: vi.fn()
  }
}));

describe('Activity Handlers', () => {
  beforeEach(() => {
    initializeActivityService();
  });

  afterEach(() => {
    unregisterActivityHandlers();
  });

  describe('handleActivityRecord', () => {
    it('should record typing activity for a valid session', async () => {
      const request: ActivityRecordRequest = {
        sessionId: 'test-session-1',
        activity: {
          type: 'typing',
          timestamp: Date.now(),
          data: { keystroke: 'a' }
        }
      };
      
      const result = await handleActivityRecord(request);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.success).toBe(true);
      }
    });

    it('should record pause activity for a valid session', async () => {
      const request: ActivityRecordRequest = {
        sessionId: 'test-session-1',
        activity: {
          type: 'pause',
          timestamp: Date.now()
        }
      };
      
      const result = await handleActivityRecord(request);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.success).toBe(true);
      }
    });

    it('should record resume activity for a valid session', async () => {
      const request: ActivityRecordRequest = {
        sessionId: 'test-session-1',
        activity: {
          type: 'resume',
          timestamp: Date.now()
        }
      };
      
      const result = await handleActivityRecord(request);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.success).toBe(true);
      }
    });

    it('should return error for empty session ID', async () => {
      const request: ActivityRecordRequest = {
        sessionId: '',
        activity: {
          type: 'typing',
          timestamp: Date.now()
        }
      };
      
      const result = await handleActivityRecord(request);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
        expect(result.error.message).toContain('Session ID is required');
      }
    });

    it('should return error for missing activity', async () => {
      const request = {
        sessionId: 'test-session-1'
        // Missing activity
      } as ActivityRecordRequest;
      
      const result = await handleActivityRecord(request);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
        expect(result.error.message).toContain('Activity is required');
      }
    });

    it('should return error for invalid activity type', async () => {
      const request: ActivityRecordRequest = {
        sessionId: 'test-session-1',
        activity: {
          type: 'invalid' as any,
          timestamp: Date.now()
        }
      };
      
      const result = await handleActivityRecord(request);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
        expect(result.error.message).toContain('Invalid activity type');
      }
    });

    it('should return error for invalid timestamp', async () => {
      const request: ActivityRecordRequest = {
        sessionId: 'test-session-1',
        activity: {
          type: 'typing',
          timestamp: -1
        }
      };
      
      const result = await handleActivityRecord(request);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
        expect(result.error.message).toContain('Timestamp must be a positive number');
      }
    });
  });

  describe('handleActivityStats', () => {
    it('should return zero stats for session with no activities', async () => {
      const request: ActivityStatsRequest = { sessionId: 'test-session-1' };
      
      const result = await handleActivityStats(request);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.stats.totalTypingTime).toBe(0);
        expect(result.data.stats.totalPauseTime).toBe(0);
        expect(result.data.stats.keystrokes).toBe(0);
        expect(result.data.stats.wordsPerMinute).toBe(0);
      }
    });

    it('should return correct stats for session with activities', async () => {
      const sessionId = 'test-session-1';
      const now = Date.now();

      // Record some activities first
      await handleActivityRecord({
        sessionId,
        activity: {
          type: 'typing',
          timestamp: now,
          data: { keystroke: 'a' }
        }
      });
      await handleActivityRecord({
        sessionId,
        activity: {
          type: 'typing',
          timestamp: now + 1000,
          data: { keystroke: 'b' }
        }
      });

      const request: ActivityStatsRequest = { sessionId };
      const result = await handleActivityStats(request);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.stats.keystrokes).toBe(2);
        expect(result.data.stats.totalTypingTime).toBeGreaterThan(0);
      }
    });

    it('should return error for empty session ID', async () => {
      const request: ActivityStatsRequest = { sessionId: '' };
      
      const result = await handleActivityStats(request);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
        expect(result.error.message).toContain('Session ID is required');
      }
    });
  });

  describe('handleActivityReset', () => {
    it('should reset activities for a session', async () => {
      const sessionId = 'test-session-1';

      // Record some activities first
      await handleActivityRecord({
        sessionId,
        activity: {
          type: 'typing',
          timestamp: Date.now(),
          data: { keystroke: 'a' }
        }
      });

      // Verify activities exist
      let statsResult = await handleActivityStats({ sessionId });
      expect(statsResult.success).toBe(true);
      if (statsResult.success) {
        expect(statsResult.data.stats.keystrokes).toBe(1);
      }

      // Reset activities
      const request: ActivityResetRequest = { sessionId };
      const result = await handleActivityReset(request);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.success).toBe(true);
      }

      // Verify activities are cleared
      statsResult = await handleActivityStats({ sessionId });
      expect(statsResult.success).toBe(true);
      if (statsResult.success) {
        expect(statsResult.data.stats.keystrokes).toBe(0);
      }
    });

    it('should handle reset for session with no activities', async () => {
      const request: ActivityResetRequest = { sessionId: 'test-session-1' };
      
      const result = await handleActivityReset(request);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.success).toBe(true);
      }
    });

    it('should return error for empty session ID', async () => {
      const request: ActivityResetRequest = { sessionId: '' };
      
      const result = await handleActivityReset(request);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
        expect(result.error.message).toContain('Session ID is required');
      }
    });
  });

  describe('registerActivityHandlers', () => {
    it('should register all activity IPC handlers', () => {
      // Clear any previous calls
      vi.clearAllMocks();
      
      registerActivityHandlers();
      
      expect(ipcMain.handle).toHaveBeenCalledTimes(3);
      expect(ipcMain.handle).toHaveBeenCalledWith('activity:record', expect.any(Function));
      expect(ipcMain.handle).toHaveBeenCalledWith('activity:stats', expect.any(Function));
      expect(ipcMain.handle).toHaveBeenCalledWith('activity:reset', expect.any(Function));
    });

    it('should work when service is properly initialized', () => {
      // Clear mocks and reset service state
      vi.clearAllMocks();
      unregisterActivityHandlers();
      
      // Re-initialize the service
      initializeActivityService();
      
      // This should work since the service is initialized
      expect(() => {
        registerActivityHandlers();
      }).not.toThrow();
    });
  });

  describe('unregisterActivityHandlers', () => {
    it('should unregister all activity IPC handlers', () => {
      // Clear any previous calls
      vi.clearAllMocks();
      
      registerActivityHandlers();
      unregisterActivityHandlers();
      
      expect(ipcMain.removeAllListeners).toHaveBeenCalledTimes(3);
      expect(ipcMain.removeAllListeners).toHaveBeenCalledWith('activity:record');
      expect(ipcMain.removeAllListeners).toHaveBeenCalledWith('activity:stats');
      expect(ipcMain.removeAllListeners).toHaveBeenCalledWith('activity:reset');
    });
  });

  describe('integration scenarios', () => {
    it('should handle complex typing session with multiple activities', async () => {
      const sessionId = 'complex-session';
      const now = Date.now();

      // Record typing activities
      await handleActivityRecord({
        sessionId,
        activity: {
          type: 'typing',
          timestamp: now,
          data: { keystroke: 'H' }
        }
      });
      await handleActivityRecord({
        sessionId,
        activity: {
          type: 'typing',
          timestamp: now + 100,
          data: { keystroke: 'e' }
        }
      });

      // Record pause
      await handleActivityRecord({
        sessionId,
        activity: {
          type: 'pause',
          timestamp: now + 500
        }
      });

      // Record resume and more typing
      await handleActivityRecord({
        sessionId,
        activity: {
          type: 'resume',
          timestamp: now + 2000
        }
      });
      await handleActivityRecord({
        sessionId,
        activity: {
          type: 'typing',
          timestamp: now + 2100,
          data: { keystroke: 'l' }
        }
      });

      // Get stats
      const statsResult = await handleActivityStats({ sessionId });
      expect(statsResult.success).toBe(true);
      if (statsResult.success) {
        expect(statsResult.data.stats.keystrokes).toBe(3);
        expect(statsResult.data.stats.totalTypingTime).toBeGreaterThan(0);
        expect(statsResult.data.stats.totalPauseTime).toBeGreaterThan(0);
      }

      // Reset and verify
      const resetResult = await handleActivityReset({ sessionId });
      expect(resetResult.success).toBe(true);

      const statsAfterReset = await handleActivityStats({ sessionId });
      expect(statsAfterReset.success).toBe(true);
      if (statsAfterReset.success) {
        expect(statsAfterReset.data.stats.keystrokes).toBe(0);
      }
    });

    it('should handle multiple sessions independently', async () => {
      const session1 = 'session-1';
      const session2 = 'session-2';
      const now = Date.now();

      // Record activities for both sessions
      await handleActivityRecord({
        sessionId: session1,
        activity: {
          type: 'typing',
          timestamp: now,
          data: { keystroke: 'a' }
        }
      });
      await handleActivityRecord({
        sessionId: session2,
        activity: {
          type: 'typing',
          timestamp: now,
          data: { keystroke: 'b' }
        }
      });

      // Check stats for both sessions
      const stats1 = await handleActivityStats({ sessionId: session1 });
      const stats2 = await handleActivityStats({ sessionId: session2 });

      expect(stats1.success).toBe(true);
      expect(stats2.success).toBe(true);
      if (stats1.success && stats2.success) {
        expect(stats1.data.stats.keystrokes).toBe(1);
        expect(stats2.data.stats.keystrokes).toBe(1);
      }

      // Reset only session1
      await handleActivityReset({ sessionId: session1 });

      // Check stats after reset
      const stats1After = await handleActivityStats({ sessionId: session1 });
      const stats2After = await handleActivityStats({ sessionId: session2 });

      expect(stats1After.success).toBe(true);
      expect(stats2After.success).toBe(true);
      if (stats1After.success && stats2After.success) {
        expect(stats1After.data.stats.keystrokes).toBe(0);
        expect(stats2After.data.stats.keystrokes).toBe(1);
      }
    });
  });
});
