import { describe, it, expect, beforeEach } from 'vitest';
import { ActivityService } from '../../../src/main/services/activityService';

describe('ActivityService - Core Functionality', () => {
  let activityService: ActivityService;

  beforeEach(() => {
    activityService = new ActivityService();
  });

  describe('recordActivity', () => {
    it('should record typing activity', () => {
      const sessionId = 'test-session-1';
      const activity = {
        type: 'typing' as const,
        timestamp: Date.now(),
        data: { keystroke: 'a' }
      };

      const result = activityService.recordActivity(sessionId, activity);

      expect(result.success).toBe(true);
      expect(result.sessionId).toBe(sessionId);
    });

    it('should record pause activity', () => {
      const sessionId = 'test-session-1';
      const activity = {
        type: 'pause' as const,
        timestamp: Date.now()
      };

      const result = activityService.recordActivity(sessionId, activity);

      expect(result.success).toBe(true);
      expect(result.sessionId).toBe(sessionId);
    });

    it('should record resume activity', () => {
      const sessionId = 'test-session-1';
      const activity = {
        type: 'resume' as const,
        timestamp: Date.now()
      };

      const result = activityService.recordActivity(sessionId, activity);

      expect(result.success).toBe(true);
      expect(result.sessionId).toBe(sessionId);
    });

    it('should validate session ID', () => {
      const activity = {
        type: 'typing' as const,
        timestamp: Date.now()
      };

      expect(() => {
        activityService.recordActivity('', activity);
      }).toThrow('Session ID is required');

      expect(() => {
        activityService.recordActivity('   ', activity);
      }).toThrow('Session ID is required');
    });

    it('should validate activity type', () => {
      const sessionId = 'test-session-1';
      const invalidActivity = {
        type: 'invalid' as any,
        timestamp: Date.now()
      };

      expect(() => {
        activityService.recordActivity(sessionId, invalidActivity);
      }).toThrow('Invalid activity type: invalid');
    });

    it('should validate timestamp', () => {
      const sessionId = 'test-session-1';
      const activity = {
        type: 'typing' as const,
        timestamp: -1
      };

      expect(() => {
        activityService.recordActivity(sessionId, activity);
      }).toThrow('Timestamp must be a positive number');
    });
  });

  describe('getActivityStats', () => {
    it('should return zero stats for session with no activities', () => {
      const sessionId = 'test-session-1';
      const stats = activityService.getActivityStats(sessionId);

      expect(stats.sessionId).toBe(sessionId);
      expect(stats.stats.totalTypingTime).toBe(0);
      expect(stats.stats.totalPauseTime).toBe(0);
      expect(stats.stats.keystrokes).toBe(0);
      expect(stats.stats.wordsPerMinute).toBe(0);
    });

    it('should calculate typing time correctly', () => {
      const sessionId = 'test-session-1';
      const now = Date.now();

      // Record typing activities
      activityService.recordActivity(sessionId, {
        type: 'typing',
        timestamp: now,
        data: { keystroke: 'a' }
      });
      activityService.recordActivity(sessionId, {
        type: 'typing',
        timestamp: now + 1000, // 1 second later
        data: { keystroke: 'b' }
      });

      const stats = activityService.getActivityStats(sessionId);

      expect(stats.stats.keystrokes).toBe(2);
      expect(stats.stats.totalTypingTime).toBeGreaterThan(0);
    });

    it('should calculate pause time correctly', () => {
      const sessionId = 'test-session-1';
      const now = Date.now();

      // Record pause and resume
      activityService.recordActivity(sessionId, {
        type: 'pause',
        timestamp: now
      });
      activityService.recordActivity(sessionId, {
        type: 'resume',
        timestamp: now + 5000 // 5 seconds later
      });

      const stats = activityService.getActivityStats(sessionId);

      expect(stats.stats.totalPauseTime).toBeGreaterThan(0);
    });

    it('should calculate words per minute correctly', () => {
      const sessionId = 'test-session-1';
      const now = Date.now();

      // Record typing activities (simulating typing)
      for (let i = 0; i < 10; i++) {
        activityService.recordActivity(sessionId, {
          type: 'typing',
          timestamp: now + (i * 100), // 100ms between keystrokes
          data: { keystroke: 'a' }
        });
      }

      const stats = activityService.getActivityStats(sessionId);

      expect(stats.stats.keystrokes).toBe(10);
      expect(stats.stats.wordsPerMinute).toBeGreaterThan(0);
    });

    it('should validate session ID', () => {
      expect(() => {
        activityService.getActivityStats('');
      }).toThrow('Session ID is required');
    });
  });

  describe('resetActivity', () => {
    it('should clear all activities for a session', () => {
      const sessionId = 'test-session-1';

      // Record some activities
      activityService.recordActivity(sessionId, {
        type: 'typing',
        timestamp: Date.now(),
        data: { keystroke: 'a' }
      });

      // Verify activities exist
      let stats = activityService.getActivityStats(sessionId);
      expect(stats.stats.keystrokes).toBe(1);

      // Reset activities
      const result = activityService.resetActivity(sessionId);
      expect(result.success).toBe(true);
      expect(result.sessionId).toBe(sessionId);

      // Verify activities are cleared
      stats = activityService.getActivityStats(sessionId);
      expect(stats.stats.keystrokes).toBe(0);
      expect(stats.stats.totalTypingTime).toBe(0);
      expect(stats.stats.totalPauseTime).toBe(0);
    });

    it('should handle reset for session with no activities', () => {
      const sessionId = 'test-session-1';

      const result = activityService.resetActivity(sessionId);

      expect(result.success).toBe(true);
      expect(result.sessionId).toBe(sessionId);
    });

    it('should validate session ID', () => {
      expect(() => {
        activityService.resetActivity('');
      }).toThrow('Session ID is required');
    });
  });

  describe('getAllActivitySessions', () => {
    it('should return empty array when no sessions have activities', () => {
      const sessions = activityService.getAllActivitySessions();
      expect(sessions).toEqual([]);
    });

    it('should return all sessions with activities', () => {
      const session1 = 'session-1';
      const session2 = 'session-2';

      // Record activities for both sessions
      activityService.recordActivity(session1, {
        type: 'typing',
        timestamp: Date.now(),
        data: { keystroke: 'a' }
      });
      activityService.recordActivity(session2, {
        type: 'typing',
        timestamp: Date.now(),
        data: { keystroke: 'b' }
      });

      const sessions = activityService.getAllActivitySessions();

      expect(sessions).toHaveLength(2);
      expect(sessions.find(s => s.sessionId === session1)).toBeDefined();
      expect(sessions.find(s => s.sessionId === session2)).toBeDefined();
    });
  });

  describe('clearAllActivities', () => {
    it('should clear all activities for all sessions', () => {
      const session1 = 'session-1';
      const session2 = 'session-2';

      // Record activities for both sessions
      activityService.recordActivity(session1, {
        type: 'typing',
        timestamp: Date.now(),
        data: { keystroke: 'a' }
      });
      activityService.recordActivity(session2, {
        type: 'typing',
        timestamp: Date.now(),
        data: { keystroke: 'b' }
      });

      expect(activityService.getAllActivitySessions()).toHaveLength(2);

      activityService.clearAllActivities();

      expect(activityService.getAllActivitySessions()).toHaveLength(0);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complex typing session with pauses', () => {
      const sessionId = 'complex-session';
      const now = Date.now();

      // Start typing
      activityService.recordActivity(sessionId, {
        type: 'typing',
        timestamp: now,
        data: { keystroke: 'H' }
      });
      activityService.recordActivity(sessionId, {
        type: 'typing',
        timestamp: now + 100,
        data: { keystroke: 'e' }
      });
      activityService.recordActivity(sessionId, {
        type: 'typing',
        timestamp: now + 200,
        data: { keystroke: 'l' }
      });

      // Pause
      activityService.recordActivity(sessionId, {
        type: 'pause',
        timestamp: now + 500
      });

      // Resume and continue typing
      activityService.recordActivity(sessionId, {
        type: 'resume',
        timestamp: now + 2000
      });
      activityService.recordActivity(sessionId, {
        type: 'typing',
        timestamp: now + 2100,
        data: { keystroke: 'l' }
      });
      activityService.recordActivity(sessionId, {
        type: 'typing',
        timestamp: now + 2200,
        data: { keystroke: 'o' }
      });

      const stats = activityService.getActivityStats(sessionId);

      expect(stats.stats.keystrokes).toBe(5);
      expect(stats.stats.totalTypingTime).toBeGreaterThan(0);
      expect(stats.stats.totalPauseTime).toBeGreaterThan(0);
      expect(stats.stats.wordsPerMinute).toBeGreaterThan(0);
    });
  });
});
