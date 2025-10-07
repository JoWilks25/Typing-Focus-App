import { describe, it, expect, beforeEach } from 'vitest';
import { FocusService } from '../../../src/main/services/focusService';

describe('FocusService - Core Functionality', () => {
  let focusService: FocusService;

  beforeEach(() => {
    focusService = new FocusService();
  });

  describe('startFocus', () => {
    it('should start focus for a session', () => {
      const sessionId = 'test-session-1';
      const result = focusService.startFocus(sessionId);

      expect(result.success).toBe(true);
      expect(result.sessionId).toBe(sessionId);
      expect(result.startTime).toBeGreaterThan(0);
    });

    it('should throw error when starting focus for already active session', () => {
      const sessionId = 'test-session-1';
      focusService.startFocus(sessionId);

      expect(() => {
        focusService.startFocus(sessionId);
      }).toThrow('Focus is already active for session: ' + sessionId);
    });

    it('should validate session ID', () => {
      expect(() => {
        focusService.startFocus('');
      }).toThrow('Session ID is required');

      expect(() => {
        focusService.startFocus('   ');
      }).toThrow('Session ID is required');
    });
  });

  describe('stopFocus', () => {
    it('should stop focus for an active session', () => {
      const sessionId = 'test-session-1';
      focusService.startFocus(sessionId);
      
      const result = focusService.stopFocus(sessionId);

      expect(result.success).toBe(true);
      expect(result.sessionId).toBe(sessionId);
      expect(result.endTime).toBeGreaterThan(0);
    });

    it('should throw error when stopping focus for non-active session', () => {
      const sessionId = 'test-session-1';

      expect(() => {
        focusService.stopFocus(sessionId);
      }).toThrow('Focus is not active for session: ' + sessionId);
    });

    it('should validate session ID', () => {
      expect(() => {
        focusService.stopFocus('');
      }).toThrow('Session ID is required');
    });
  });

  describe('getFocusStatus', () => {
    it('should return active status for focused session', () => {
      const sessionId = 'test-session-1';
      const startResult = focusService.startFocus(sessionId);
      
      const status = focusService.getFocusStatus(sessionId);

      expect(status.isActive).toBe(true);
      expect(status.sessionId).toBe(sessionId);
      expect(status.startTime).toBe(startResult.startTime);
      expect(status.endTime).toBeUndefined();
    });

    it('should return inactive status for non-focused session', () => {
      const sessionId = 'test-session-1';
      
      const status = focusService.getFocusStatus(sessionId);

      expect(status.isActive).toBe(false);
      expect(status.sessionId).toBe(sessionId);
      expect(status.startTime).toBeUndefined();
      expect(status.endTime).toBeUndefined();
    });

    it('should return inactive status for stopped session', () => {
      const sessionId = 'test-session-1';
      focusService.startFocus(sessionId);
      focusService.stopFocus(sessionId);
      
      const status = focusService.getFocusStatus(sessionId);

      expect(status.isActive).toBe(false);
      expect(status.sessionId).toBe(sessionId);
      expect(status.startTime).toBeUndefined();
      expect(status.endTime).toBeUndefined();
    });

    it('should validate session ID', () => {
      expect(() => {
        focusService.getFocusStatus('');
      }).toThrow('Session ID is required');
    });
  });

  describe('getAllFocusSessions', () => {
    it('should return empty array when no sessions are focused', () => {
      const sessions = focusService.getAllFocusSessions();
      expect(sessions).toEqual([]);
    });

    it('should return all active focus sessions', () => {
      const session1 = 'session-1';
      const session2 = 'session-2';
      const session3 = 'session-3';

      focusService.startFocus(session1);
      focusService.startFocus(session2);
      focusService.startFocus(session3);
      focusService.stopFocus(session2); // Stop one session

      const sessions = focusService.getAllFocusSessions();

      expect(sessions).toHaveLength(2);
      expect(sessions.find(s => s.sessionId === session1)).toBeDefined();
      expect(sessions.find(s => s.sessionId === session3)).toBeDefined();
      expect(sessions.find(s => s.sessionId === session2)).toBeUndefined();
    });
  });

  describe('clearAllFocus', () => {
    it('should clear all focus sessions', () => {
      focusService.startFocus('session-1');
      focusService.startFocus('session-2');
      focusService.startFocus('session-3');

      expect(focusService.getAllFocusSessions()).toHaveLength(3);

      focusService.clearAllFocus();

      expect(focusService.getAllFocusSessions()).toHaveLength(0);
    });
  });
});
