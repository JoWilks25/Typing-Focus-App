// tests/main/services/SessionService.updateProgress.test.ts
// Purpose: Tests for SessionService updateProgress method

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SessionService } from '../../../src/main/services/sessionService';
import { StorageService } from '../../../src/main/services/storageService';

// Mock the storage service
const mockStorageService = {
  get: vi.fn(),
  set: vi.fn(),
  remove: vi.fn(),
  clear: vi.fn()
} as unknown as StorageService;

describe('SessionService.updateProgress', () => {
  let sessionService: SessionService;

  beforeEach(() => {
    vi.clearAllMocks();
    sessionService = new SessionService(mockStorageService);
  });

  it('should successfully update progress for active session', async () => {
    // Create a test session
    const session = await sessionService.startSession('Test Session', 'Test Title', 'word', 500);
    
    // Wait a small amount to ensure timestamp difference
    await new Promise(resolve => globalThis.setTimeout(resolve, 10));
    
    const updatedSession = await sessionService.updateProgress(
      session.id,
      250,
      30000,
      {
        33: true,
        67: false,
        100: false
      }
    );

    expect(updatedSession.currentWords).toBe(250);
    expect(updatedSession.timeElapsed).toBe(30000);
    expect(updatedSession.progressThresholds).toEqual({
      33: true,
      67: false,
      100: false
    });
    expect(updatedSession.updatedAt).not.toBe(session.updatedAt);

    // Verify session is updated in memory
    const retrievedSession = sessionService.getSession(session.id);
    expect(retrievedSession?.currentWords).toBe(250);
    expect(retrievedSession?.timeElapsed).toBe(30000);
    expect(retrievedSession?.progressThresholds).toEqual({
      33: true,
      67: false,
      100: false
    });
  });

  it('should persist active session to storage', async () => {
    const session = await sessionService.startSession('Test Session', 'Test Title', 'word', 500);
    
    await sessionService.updateProgress(
      session.id,
      250,
      30000,
      {
        33: true,
        67: false,
        100: false
      }
    );

    expect(mockStorageService.set).toHaveBeenCalledWith(
      'active-session',
      expect.objectContaining({
        id: session.id,
        currentWords: 250,
        timeElapsed: 30000,
        progressThresholds: {
          33: true,
          67: false,
          100: false
        }
      })
    );
  });

  it('should not persist stopped session to storage', async () => {
    const session = await sessionService.startSession('Test Session', 'Test Title', 'word', 500);
    
    // Stop the session first
    await sessionService.stopSession(session.id);
    
    // Clear the mock to reset call count
    vi.clearAllMocks();
    
    // Try to update progress on stopped session
    await sessionService.updateProgress(
      session.id,
      250,
      30000,
      {
        33: true,
        67: false,
        100: false
      }
    );

    // Should not call storage.set for stopped session
    expect(mockStorageService.set).not.toHaveBeenCalled();
  });

  it('should throw error for non-existent session', async () => {
    await expect(
      sessionService.updateProgress(
        'non-existent-session',
        250,
        30000,
        {
          33: true,
          67: false,
          100: false
        }
      )
    ).rejects.toThrow('Session not found: non-existent-session');
  });

  it('should handle all threshold values correctly', async () => {
    const session = await sessionService.startSession('Test Session', 'Test Title', 'word', 500);
    
    const updatedSession = await sessionService.updateProgress(
      session.id,
      500,
      60000,
      {
        33: true,
        67: true,
        100: true
      }
    );

    expect(updatedSession.progressThresholds).toEqual({
      33: true,
      67: true,
      100: true
    });
  });

  it('should handle zero values correctly', async () => {
    const session = await sessionService.startSession('Test Session', 'Test Title', 'word', 500);
    
    const updatedSession = await sessionService.updateProgress(
      session.id,
      0,
      0,
      {
        33: false,
        67: false,
        100: false
      }
    );

    expect(updatedSession.currentWords).toBe(0);
    expect(updatedSession.timeElapsed).toBe(0);
    expect(updatedSession.progressThresholds).toEqual({
      33: false,
      67: false,
      100: false
    });
  });

  it('should handle large values correctly', async () => {
    const session = await sessionService.startSession('Test Session', 'Test Title', 'word', 500);
    
    const updatedSession = await sessionService.updateProgress(
      session.id,
      10000,
      3600000, // 1 hour
      {
        33: true,
        67: true,
        100: true
      }
    );

    expect(updatedSession.currentWords).toBe(10000);
    expect(updatedSession.timeElapsed).toBe(3600000);
  });

  it('should update timestamp correctly', async () => {
    const session = await sessionService.startSession('Test Session', 'Test Title', 'word', 500);
    const originalUpdatedAt = session.updatedAt;
    
    // Wait a small amount to ensure timestamp difference
    await new Promise(resolve => globalThis.setTimeout(resolve, 10));
    
    const updatedSession = await sessionService.updateProgress(
      session.id,
      250,
      30000,
      {
        33: true,
        67: false,
        100: false
      }
    );

    expect(new Date(updatedSession.updatedAt).getTime()).toBeGreaterThan(new Date(originalUpdatedAt).getTime());
  });

  it('should preserve other session properties', async () => {
    const session = await sessionService.startSession('Test Session', 'Test Title', 'word', 500);
    
    const updatedSession = await sessionService.updateProgress(
      session.id,
      250,
      30000,
      {
        33: true,
        67: false,
        100: false
      }
    );

    // Verify other properties are preserved
    expect(updatedSession.id).toBe(session.id);
    expect(updatedSession.name).toBe(session.name);
    expect(updatedSession.title).toBe(session.title);
    expect(updatedSession.goalType).toBe(session.goalType);
    expect(updatedSession.goalValue).toBe(session.goalValue);
    expect(updatedSession.startTime).toBe(session.startTime);
    expect(updatedSession.status).toBe(session.status);
    expect(updatedSession.createdAt).toBe(session.createdAt);
  });
});
