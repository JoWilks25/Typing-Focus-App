// tests/main/utils/calculateSessionStats.test.ts
// Purpose: Unit tests for calculateSessionStats utility function

import { calculateSessionStats } from '../../../src/main/utils/calculateSessionStats';
import type { Session } from '../../../src/main/types/session';

describe('calculateSessionStats', () => {
  const baseSession: Session = {
    id: 'test-session-1',
    name: 'Test Session',
    goalType: 'word',
    goalValue: 500,
    startTime: Date.now() - 1000000, // 1000 seconds ago
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    currentWords: 0,
    timeElapsed: 1000000, // 1000 seconds
    progressPercentage: 0,
    distractionCount: 0
  };

  describe('Word goal completion', () => {
    it('should mark session as completed when word goal is met', () => {
      const session: Session = {
        ...baseSession,
        goalType: 'word',
        goalValue: 500,
        currentWords: 500,
        status: 'stopped'
      };

      const stats = calculateSessionStats(session);

      expect(stats.isCompleted).toBe(true);
      expect(stats.finalStatus).toBe('completed');
      expect(stats.progressPercentage).toBe(100);
      expect(stats.currentWords).toBe(500);
    });

    it('should mark session as completed when word goal is exceeded', () => {
      const session: Session = {
        ...baseSession,
        goalType: 'word',
        goalValue: 500,
        currentWords: 750,
        status: 'stopped'
      };

      const stats = calculateSessionStats(session);

      expect(stats.isCompleted).toBe(true);
      expect(stats.finalStatus).toBe('completed');
      expect(stats.progressPercentage).toBe(100); // Capped at 100%
      expect(stats.currentWords).toBe(750);
    });

    it('should mark session as incomplete when word goal is not met', () => {
      const session: Session = {
        ...baseSession,
        goalType: 'word',
        goalValue: 500,
        currentWords: 250,
        status: 'stopped'
      };

      const stats = calculateSessionStats(session);

      expect(stats.isCompleted).toBe(false);
      expect(stats.finalStatus).toBe('incomplete');
      expect(stats.progressPercentage).toBe(50);
      expect(stats.currentWords).toBe(250);
    });
  });

  describe('Time goal completion', () => {
    it('should mark session as completed when time goal is met', () => {
      const session: Session = {
        ...baseSession,
        goalType: 'time',
        goalValue: 30, // 30 minutes
        timeElapsed: 30 * 60 * 1000, // 30 minutes in milliseconds
        status: 'stopped'
      };

      const stats = calculateSessionStats(session);

      expect(stats.isCompleted).toBe(true);
      expect(stats.finalStatus).toBe('completed');
      expect(stats.progressPercentage).toBe(100);
      expect(stats.duration).toBe(30 * 60 * 1000);
    });

    it('should mark session as completed when time goal is exceeded', () => {
      const session: Session = {
        ...baseSession,
        goalType: 'time',
        goalValue: 30, // 30 minutes
        timeElapsed: 45 * 60 * 1000, // 45 minutes in milliseconds
        status: 'stopped'
      };

      const stats = calculateSessionStats(session);

      expect(stats.isCompleted).toBe(true);
      expect(stats.finalStatus).toBe('completed');
      expect(stats.progressPercentage).toBe(100); // Capped at 100%
      expect(stats.duration).toBe(45 * 60 * 1000);
    });

    it('should mark session as incomplete when time goal is not met', () => {
      const session: Session = {
        ...baseSession,
        goalType: 'time',
        goalValue: 30, // 30 minutes
        timeElapsed: 15 * 60 * 1000, // 15 minutes in milliseconds
        status: 'stopped'
      };

      const stats = calculateSessionStats(session);

      expect(stats.isCompleted).toBe(false);
      expect(stats.finalStatus).toBe('incomplete');
      expect(stats.progressPercentage).toBe(50);
      expect(stats.duration).toBe(15 * 60 * 1000);
    });
  });

  describe('Abandoned sessions', () => {
    it('should mark abandoned session as abandoned regardless of progress', () => {
      const session: Session = {
        ...baseSession,
        goalType: 'word',
        goalValue: 500,
        currentWords: 400, // Close to goal but not met
        status: 'abandoned'
      };

      const stats = calculateSessionStats(session);

      expect(stats.finalStatus).toBe('abandoned');
      expect(stats.isCompleted).toBe(false);
      expect(stats.progressPercentage).toBe(80);
    });

    it('should mark abandoned session as abandoned even if goal was met', () => {
      const session: Session = {
        ...baseSession,
        goalType: 'word',
        goalValue: 500,
        currentWords: 600, // Goal exceeded
        status: 'abandoned'
      };

      const stats = calculateSessionStats(session);

      expect(stats.finalStatus).toBe('abandoned');
      expect(stats.isCompleted).toBe(true); // Goal was technically met
      expect(stats.progressPercentage).toBe(100);
    });
  });

  describe('Words per minute calculation', () => {
    it('should calculate words per minute correctly', () => {
      const session: Session = {
        ...baseSession,
        goalType: 'word',
        goalValue: 500,
        currentWords: 300,
        timeElapsed: 10 * 60 * 1000, // 10 minutes
        status: 'stopped'
      };

      const stats = calculateSessionStats(session);

      expect(stats.wordsPerMinute).toBe(30); // 300 words / 10 minutes
    });

    it('should return null words per minute when time is 0', () => {
      const session: Session = {
        ...baseSession,
        goalType: 'word',
        goalValue: 500,
        currentWords: 100,
        timeElapsed: 0,
        status: 'stopped'
      };

      const stats = calculateSessionStats(session);

      expect(stats.wordsPerMinute).toBeNull();
    });

    it('should return null words per minute when session is under 1 minute', () => {
      const session: Session = {
        ...baseSession,
        goalType: 'word',
        goalValue: 500,
        currentWords: 50,
        timeElapsed: 30 * 1000, // 30 seconds
        status: 'stopped'
      };

      const stats = calculateSessionStats(session);

      expect(stats.wordsPerMinute).toBeNull();
    });

    it('should round words per minute to nearest integer', () => {
      const session: Session = {
        ...baseSession,
        goalType: 'word',
        goalValue: 500,
        currentWords: 175,
        timeElapsed: 6 * 60 * 1000, // 6 minutes (29.17 words/min)
        status: 'stopped'
      };

      const stats = calculateSessionStats(session);

      expect(stats.wordsPerMinute).toBe(29); // Rounded down
    });
  });

  describe('Progress percentage calculation', () => {
    it('should calculate progress percentage correctly for word goals', () => {
      const session: Session = {
        ...baseSession,
        goalType: 'word',
        goalValue: 1000,
        currentWords: 750,
        status: 'stopped'
      };

      const stats = calculateSessionStats(session);

      expect(stats.progressPercentage).toBe(75);
    });

    it('should calculate progress percentage correctly for time goals', () => {
      const session: Session = {
        ...baseSession,
        goalType: 'time',
        goalValue: 60, // 60 minutes
        timeElapsed: 45 * 60 * 1000, // 45 minutes
        status: 'stopped'
      };

      const stats = calculateSessionStats(session);

      expect(stats.progressPercentage).toBe(75);
    });

    it('should cap progress percentage at 100', () => {
      const session: Session = {
        ...baseSession,
        goalType: 'word',
        goalValue: 500,
        currentWords: 1000, // Double the goal
        status: 'stopped'
      };

      const stats = calculateSessionStats(session);

      expect(stats.progressPercentage).toBe(100);
    });
  });

  describe('Edge cases', () => {
    it('should handle zero goal values', () => {
      const session: Session = {
        ...baseSession,
        goalType: 'word',
        goalValue: 0,
        currentWords: 100,
        status: 'stopped'
      };

      const stats = calculateSessionStats(session);

      expect(stats.progressPercentage).toBe(100); // Any progress with 0 goal = 100%
      expect(stats.isCompleted).toBe(true);
    });

    it('should handle missing optional fields', () => {
      const session: Session = {
        ...baseSession,
        currentWords: undefined,
        timeElapsed: undefined,
        distractionCount: undefined,
        status: 'stopped'
      };

      const stats = calculateSessionStats(session);

      expect(stats.currentWords).toBe(0);
      expect(stats.timeElapsed).toBe(0);
      expect(stats.distractionCount).toBe(0);
      expect(stats.isCompleted).toBe(false);
    });

    it('should round progress percentage to nearest integer', () => {
      const session: Session = {
        ...baseSession,
        goalType: 'word',
        goalValue: 333,
        currentWords: 100, // 30.03% progress
        status: 'stopped'
      };

      const stats = calculateSessionStats(session);

      expect(stats.progressPercentage).toBe(30); // Rounded down
    });
  });
});
