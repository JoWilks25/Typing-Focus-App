import { describe, it, expect, beforeEach } from 'vitest';
import { SessionManager } from '../../../src/main/services/sessionManager';

describe('SessionManager', () => {
  let sessionManager: SessionManager;

  beforeEach(() => {
    sessionManager = new SessionManager();
  });

  describe('session lifecycle', () => {
    it('should start a new session', async () => {
      const session = await sessionManager.startSession('Test Session', 'Test Title', 'word', 500);
      
      expect(session).toBeDefined();
      expect(session.name).toBe('Test Session');
      expect(session.title).toBe('Test Title');
      expect(session.goalType).toBe('word');
      expect(session.goalValue).toBe(500);
      expect(session.status).toBe('active');
      expect(session.id).toBeDefined();
    });

    it('should get active session', async () => {
      const session = await sessionManager.startSession('Test Session', undefined, 'word', 500);
      const activeSession = sessionManager.getActiveSession();
      
      expect(activeSession).toEqual(session);
    });

    it('should stop a session', async () => {
      const session = await sessionManager.startSession('Test Session', undefined, 'word', 500);
      const stoppedSession = await sessionManager.stopSession(session.id);
      
      expect(stoppedSession.status).toBe('stopped');
      expect(stoppedSession.endTime).toBeDefined();
      expect(sessionManager.getActiveSession()).toBeUndefined();
    });

    it('should update session content', async () => {
      const session = await sessionManager.startSession('Test Session', undefined, 'word', 500);
      const updatedSession = await sessionManager.updateSessionContent(session.id, 'Hello world');
      
      expect(updatedSession.content).toBe('Hello world');
      expect(updatedSession.currentWords).toBe(2);
    });

    it('should calculate progress thresholds correctly', async () => {
      const session = await sessionManager.startSession('Test Session', undefined, 'word', 100);
      
      // Update with 50 words (50% progress)
      const updatedSession = await sessionManager.updateSessionContent(session.id, 'word '.repeat(50));
      
      expect(updatedSession.progressThresholds[33]).toBe(true);
      expect(updatedSession.progressThresholds[67]).toBe(false);
      expect(updatedSession.progressThresholds[100]).toBe(false);
    });

    it('should detect goal completion', async () => {
      const session = await sessionManager.startSession('Test Session', undefined, 'word', 10);
      
      // Update with 10 words (100% progress)
      const updatedSession = await sessionManager.updateSessionContent(session.id, 'word '.repeat(10));
      
      expect(sessionManager.isGoalCompleted(updatedSession)).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should throw error for invalid goal', async () => {
      await expect(sessionManager.startSession('Test', undefined, 'word', -1))
        .rejects.toThrow('Invalid goal');
    });

    it('should throw error when stopping non-existent session', async () => {
      await expect(sessionManager.stopSession('non-existent'))
        .rejects.toThrow('Session not found');
    });

    it('should throw error when updating non-existent session', async () => {
      await expect(sessionManager.updateSessionContent('non-existent', 'content'))
        .rejects.toThrow('Session not found');
    });
  });
});
