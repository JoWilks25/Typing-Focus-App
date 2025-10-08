import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SessionService } from '../../../src/main/services/sessionService';

// Mock StorageService
vi.mock('../../../src/main/services/storageService');

describe('SessionService - Integration Tests', () => {
  let sessionService: SessionService;
  let mockStorageService: any;

  beforeEach(() => {
    sessionService = new SessionService();
  });

  describe('startSession', () => {
    it('should start a session with a name', () => {
      const session = sessionService.startSession('Test Session');

      expect(session.id).toBeDefined();
      expect(session.name).toBe('Test Session');
      expect(session.title).toBe('Test Title');
      expect(session.goalType).toBe('word');
      expect(session.goalValue).toBe(500);
      expect(session.startTime).toBeGreaterThan(0);
      expect(session.status).toBe('active');
      expect(session.endTime).toBeUndefined();
      expect(session.createdAt).toBeDefined();
      expect(session.updatedAt).toBeDefined();
      expect(mockStorageService.set).toHaveBeenCalledWith('active-session', session);
    });

    it('should start a session with valid time goal', async () => {
      const session = await sessionService.startSession('Test Session', undefined, 'time', 30);

      expect(session.id).toBeDefined();
      expect(session.name).toBe('Test Session');
      expect(session.title).toBeUndefined();
      expect(session.goalType).toBe('time');
      expect(session.goalValue).toBe(30);
      expect(session.status).toBe('active');
      expect(mockStorageService.set).toHaveBeenCalledWith('active-session', session);
    });

    it('should start a session without a name', async () => {
      const session = await sessionService.startSession();

      expect(session.id).toBeDefined();
      expect(session.name).toMatch(/^Session .+$/);
      expect(session.goalType).toBe('word');
      expect(session.goalValue).toBe(500);
      expect(session.status).toBe('active');
      expect(mockStorageService.set).toHaveBeenCalledWith('active-session', session);
    });

    it('should generate unique session IDs', async () => {
      const session1 = await sessionService.startSession('Session 1');
      const session2 = await sessionService.startSession('Session 2');

      expect(session1.id).not.toBe(session2.id);
    });

    it('should throw error for invalid word goal', async () => {
      await expect(sessionService.startSession('Test', undefined, 'word', 5))
        .rejects.toThrow('Invalid goal: word goal value 5 is out of range');
      expect(mockStorageService.set).not.toHaveBeenCalled();
    });

    it('should throw error for invalid time goal', async () => {
      await expect(sessionService.startSession('Test', undefined, 'time', 600))
        .rejects.toThrow('Invalid goal: time goal value 600 is out of range');
      expect(mockStorageService.set).not.toHaveBeenCalled();
    });
  });

  describe('stopSession', () => {
    it('should stop an active session', async () => {
      const session = await sessionService.startSession('Test Session');
      const stoppedSession = await sessionService.stopSession(session.id);

      expect(stoppedSession.id).toBe(session.id);
      expect(stoppedSession.name).toBe(session.name);
      expect(stoppedSession.startTime).toBe(session.startTime);
      expect(stoppedSession.endTime).toBeGreaterThanOrEqual(session.startTime);
      expect(stoppedSession.status).toBe('stopped');
      expect(stoppedSession.updatedAt).toBeDefined();
      expect(mockStorageService.remove).toHaveBeenCalledWith('active-session');
    });

    it('should throw error when stopping non-existent session', async () => {
      await expect(sessionService.stopSession('non-existent-id'))
        .rejects.toThrow('Session not found: non-existent-id');
      expect(mockStorageService.remove).not.toHaveBeenCalled();
    });

    it('should throw error when stopping already stopped session', async () => {
      const session = await sessionService.startSession('Test Session');
      await sessionService.stopSession(session.id);

      await expect(sessionService.stopSession(session.id))
        .rejects.toThrow('Session is already stopped: ' + session.id);
    });
  });

  describe('getSession', () => {
    it('should get an existing session', async () => {
      const session = await sessionService.startSession('Test Session');
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

    it('should return all sessions', async () => {
      const session1 = await sessionService.startSession('Session 1');
      const session2 = await sessionService.startSession('Session 2');
      const session3 = await sessionService.startSession('Session 3');

      const sessions = sessionService.listSessions();

      expect(sessions).toHaveLength(3);
      expect(sessions).toContainEqual(session1);
      expect(sessions).toContainEqual(session2);
      expect(sessions).toContainEqual(session3);
    });
  });

  describe('getActiveSessions', () => {
    it('should return only active sessions', async () => {
      const activeSession1 = await sessionService.startSession('Active 1');
      const activeSession2 = await sessionService.startSession('Active 2');
      const stoppedSession = await sessionService.startSession('To Stop');
      
      await sessionService.stopSession(stoppedSession.id);

      const activeSessions = sessionService.getActiveSessions();

      expect(activeSessions).toHaveLength(2);
      expect(activeSessions).toContainEqual(activeSession1);
      expect(activeSessions).toContainEqual(activeSession2);
      expect(activeSessions).not.toContainEqual(stoppedSession);
    });
  });

  describe('getStoppedSessions', () => {
    it('should return only stopped sessions', async () => {
      const activeSession = await sessionService.startSession('Active');
      const stoppedSession1 = await sessionService.startSession('Stopped 1');
      const stoppedSession2 = await sessionService.startSession('Stopped 2');
      
      await sessionService.stopSession(stoppedSession1.id);
      await sessionService.stopSession(stoppedSession2.id);

      const stoppedSessions = sessionService.getStoppedSessions();

      expect(stoppedSessions).toHaveLength(2);
      expect(stoppedSessions.find(s => s.id === stoppedSession1.id)).toBeDefined();
      expect(stoppedSessions.find(s => s.id === stoppedSession2.id)).toBeDefined();
      expect(stoppedSessions.find(s => s.id === activeSession.id)).toBeUndefined();
    });
  });

  describe('clearAllSessions', () => {
    it('should clear all sessions', async () => {
      await sessionService.startSession('Session 1');
      await sessionService.startSession('Session 2');
      await sessionService.startSession('Session 3');

      expect(sessionService.getSessionCount()).toBe(3);

      sessionService.clearAllSessions();

      expect(sessionService.getSessionCount()).toBe(0);
      expect(sessionService.listSessions()).toEqual([]);
    });
  });

  describe('getSessionCount', () => {
    it('should return correct session count', async () => {
      expect(sessionService.getSessionCount()).toBe(0);

      await sessionService.startSession('Session 1');
      expect(sessionService.getSessionCount()).toBe(1);

      await sessionService.startSession('Session 2');
      expect(sessionService.getSessionCount()).toBe(2);

      await sessionService.startSession('Session 3');
      expect(sessionService.getSessionCount()).toBe(3);
    });
  });

  describe('getActiveSession', () => {
    it('should return active session from storage', async () => {
      const mockActiveSession = {
        id: 'test-id',
        name: 'Test Session',
        goalType: 'word' as const,
        goalValue: 500,
        startTime: Date.now(),
        status: 'active' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      mockStorageService.get.mockResolvedValue(mockActiveSession);

      const activeSession = await sessionService.getActiveSession();

      expect(activeSession).toEqual(mockActiveSession);
      expect(mockStorageService.get).toHaveBeenCalledWith('active-session');
    });

    it('should return undefined when no active session exists', async () => {
      mockStorageService.get.mockResolvedValue(undefined);

      const activeSession = await sessionService.getActiveSession();

      expect(activeSession).toBeUndefined();
    });

    it('should handle storage errors gracefully', async () => {
      mockStorageService.get.mockRejectedValue(new Error('Storage error'));

      const activeSession = await sessionService.getActiveSession();

      expect(activeSession).toBeUndefined();
    });
  });
});
