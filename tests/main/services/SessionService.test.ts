import { describe, it, expect, beforeEach } from 'vitest';
import { SessionService } from '../../../src/main/services/sessionService';

describe('SessionService - Integration Tests', () => {
  let sessionService: SessionService;

  beforeEach(() => {
    sessionService = new SessionService();
  });

  describe('startSession', () => {
    it('should start a session with a name', () => {
      const session = sessionService.startSession('Test Session');

      expect(session.id).toBeDefined();
      expect(session.name).toBe('Test Session');
      expect(session.startTime).toBeGreaterThan(0);
      expect(session.status).toBe('active');
      expect(session.endTime).toBeUndefined();
    });

    it('should start a session without a name', () => {
      const session = sessionService.startSession();

      expect(session.id).toBeDefined();
      expect(session.name).toMatch(/^Session .+$/);
      expect(session.startTime).toBeGreaterThan(0);
      expect(session.status).toBe('active');
      expect(session.endTime).toBeUndefined();
    });

    it('should generate unique session IDs', () => {
      const session1 = sessionService.startSession('Session 1');
      const session2 = sessionService.startSession('Session 2');

      expect(session1.id).not.toBe(session2.id);
    });
  });

  describe('stopSession', () => {
    it('should stop an active session', () => {
      const session = sessionService.startSession('Test Session');
      const stoppedSession = sessionService.stopSession(session.id);

      expect(stoppedSession.id).toBe(session.id);
      expect(stoppedSession.name).toBe(session.name);
      expect(stoppedSession.startTime).toBe(session.startTime);
      expect(stoppedSession.endTime).toBeGreaterThanOrEqual(session.startTime);
      expect(stoppedSession.status).toBe('stopped');
    });

    it('should throw error when stopping non-existent session', () => {
      expect(() => {
        sessionService.stopSession('non-existent-id');
      }).toThrow('Session not found: non-existent-id');
    });

    it('should throw error when stopping already stopped session', () => {
      const session = sessionService.startSession('Test Session');
      sessionService.stopSession(session.id);

      expect(() => {
        sessionService.stopSession(session.id);
      }).toThrow('Session is already stopped: ' + session.id);
    });
  });

  describe('getSession', () => {
    it('should get an existing session', () => {
      const session = sessionService.startSession('Test Session');
      const retrievedSession = sessionService.getSession(session.id);

      expect(retrievedSession).toEqual(session);
    });

    it('should return undefined for non-existent session', () => {
      const retrievedSession = sessionService.getSession('non-existent-id');

      expect(retrievedSession).toBeUndefined();
    });
  });

  describe('listSessions', () => {
    it('should return empty array when no sessions exist', () => {
      const sessions = sessionService.listSessions();

      expect(sessions).toEqual([]);
    });

    it('should return all sessions', () => {
      const session1 = sessionService.startSession('Session 1');
      const session2 = sessionService.startSession('Session 2');
      const session3 = sessionService.startSession('Session 3');

      const sessions = sessionService.listSessions();

      expect(sessions).toHaveLength(3);
      expect(sessions).toContainEqual(session1);
      expect(sessions).toContainEqual(session2);
      expect(sessions).toContainEqual(session3);
    });
  });

  describe('getActiveSessions', () => {
    it('should return only active sessions', () => {
      const activeSession1 = sessionService.startSession('Active 1');
      const activeSession2 = sessionService.startSession('Active 2');
      const stoppedSession = sessionService.startSession('To Stop');
      
      sessionService.stopSession(stoppedSession.id);

      const activeSessions = sessionService.getActiveSessions();

      expect(activeSessions).toHaveLength(2);
      expect(activeSessions).toContainEqual(activeSession1);
      expect(activeSessions).toContainEqual(activeSession2);
      expect(activeSessions).not.toContainEqual(stoppedSession);
    });
  });

  describe('getStoppedSessions', () => {
    it('should return only stopped sessions', () => {
      const activeSession = sessionService.startSession('Active');
      const stoppedSession1 = sessionService.startSession('Stopped 1');
      const stoppedSession2 = sessionService.startSession('Stopped 2');
      
      sessionService.stopSession(stoppedSession1.id);
      sessionService.stopSession(stoppedSession2.id);

      const stoppedSessions = sessionService.getStoppedSessions();

      expect(stoppedSessions).toHaveLength(2);
      expect(stoppedSessions.find(s => s.id === stoppedSession1.id)).toBeDefined();
      expect(stoppedSessions.find(s => s.id === stoppedSession2.id)).toBeDefined();
      expect(stoppedSessions.find(s => s.id === activeSession.id)).toBeUndefined();
    });
  });

  describe('clearAllSessions', () => {
    it('should clear all sessions', () => {
      sessionService.startSession('Session 1');
      sessionService.startSession('Session 2');
      sessionService.startSession('Session 3');

      expect(sessionService.getSessionCount()).toBe(3);

      sessionService.clearAllSessions();

      expect(sessionService.getSessionCount()).toBe(0);
      expect(sessionService.listSessions()).toEqual([]);
    });
  });

  describe('getSessionCount', () => {
    it('should return correct session count', () => {
      expect(sessionService.getSessionCount()).toBe(0);

      sessionService.startSession('Session 1');
      expect(sessionService.getSessionCount()).toBe(1);

      sessionService.startSession('Session 2');
      expect(sessionService.getSessionCount()).toBe(2);

      sessionService.startSession('Session 3');
      expect(sessionService.getSessionCount()).toBe(3);
    });
  });
});
