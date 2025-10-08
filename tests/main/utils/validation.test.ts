import { describe, it, expect } from 'vitest';
import { 
  validateWordGoal, 
  validateTimeGoal, 
  isValidGoal, 
  VALIDATION_CONSTANTS,
  type GoalType 
} from '../../../src/main/utils/validation';

describe('Main Process Validation Utilities', () => {
  describe('validateWordGoal', () => {
    it('should validate word count within acceptable range', () => {
      expect(validateWordGoal(10)).toBe(true);
      expect(validateWordGoal(100)).toBe(true);
      expect(validateWordGoal(1000)).toBe(true);
      expect(validateWordGoal(10000)).toBe(true);
    });

    it('should reject word count below minimum', () => {
      expect(validateWordGoal(0)).toBe(false);
      expect(validateWordGoal(5)).toBe(false);
      expect(validateWordGoal(9)).toBe(false);
    });

    it('should reject word count above maximum', () => {
      expect(validateWordGoal(10001)).toBe(false);
      expect(validateWordGoal(15000)).toBe(false);
      expect(validateWordGoal(50000)).toBe(false);
    });

    it('should handle boundary cases correctly', () => {
      expect(validateWordGoal(VALIDATION_CONSTANTS.WORD_COUNT_MIN)).toBe(true);
      expect(validateWordGoal(VALIDATION_CONSTANTS.WORD_COUNT_MAX)).toBe(true);
      expect(validateWordGoal(VALIDATION_CONSTANTS.WORD_COUNT_MIN - 1)).toBe(false);
      expect(validateWordGoal(VALIDATION_CONSTANTS.WORD_COUNT_MAX + 1)).toBe(false);
    });
  });

  describe('validateTimeGoal', () => {
    it('should validate time duration within acceptable range', () => {
      expect(validateTimeGoal(5)).toBe(true);
      expect(validateTimeGoal(15)).toBe(true);
      expect(validateTimeGoal(30)).toBe(true);
      expect(validateTimeGoal(60)).toBe(true);
      expect(validateTimeGoal(480)).toBe(true);
    });

    it('should reject time duration below minimum', () => {
      expect(validateTimeGoal(0)).toBe(false);
      expect(validateTimeGoal(0.5)).toBe(false);
      expect(validateTimeGoal(1)).toBe(false);
      expect(validateTimeGoal(4)).toBe(false);
      expect(validateTimeGoal(-1)).toBe(false);
    });

    it('should reject time duration above maximum', () => {
      expect(validateTimeGoal(481)).toBe(false);
      expect(validateTimeGoal(500)).toBe(false);
      expect(validateTimeGoal(600)).toBe(false);
    });

    it('should handle boundary cases correctly', () => {
      expect(validateTimeGoal(VALIDATION_CONSTANTS.TIME_DURATION_MIN)).toBe(true);
      expect(validateTimeGoal(VALIDATION_CONSTANTS.TIME_DURATION_MAX)).toBe(true);
      expect(validateTimeGoal(VALIDATION_CONSTANTS.TIME_DURATION_MIN - 1)).toBe(false);
      expect(validateTimeGoal(VALIDATION_CONSTANTS.TIME_DURATION_MAX + 1)).toBe(false);
    });
  });

  describe('isValidGoal', () => {
    it('should validate word goals correctly', () => {
      expect(isValidGoal('word', 500)).toBe(true);
      expect(isValidGoal('word', 10)).toBe(true);
      expect(isValidGoal('word', 10000)).toBe(true);
      expect(isValidGoal('word', 5)).toBe(false);
      expect(isValidGoal('word', 15000)).toBe(false);
    });

    it('should validate time goals correctly', () => {
      expect(isValidGoal('time', 30)).toBe(true);
      expect(isValidGoal('time', 5)).toBe(true);
      expect(isValidGoal('time', 480)).toBe(true);
      expect(isValidGoal('time', 0.5)).toBe(false);
      expect(isValidGoal('time', 1)).toBe(false);
      expect(isValidGoal('time', 600)).toBe(false);
    });

    it('should handle invalid goal types', () => {
      expect(isValidGoal('invalid' as GoalType, 500)).toBe(false);
      expect(isValidGoal('' as GoalType, 30)).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isValidGoal('word', 0)).toBe(false);
      expect(isValidGoal('time', 0)).toBe(false);
      expect(isValidGoal('word', -1)).toBe(false);
      expect(isValidGoal('time', -1)).toBe(false);
    });
  });

  describe('VALIDATION_CONSTANTS', () => {
    it('should export correct validation constants', () => {
      expect(VALIDATION_CONSTANTS.WORD_COUNT_MIN).toBe(10);
      expect(VALIDATION_CONSTANTS.WORD_COUNT_MAX).toBe(10000);
      expect(VALIDATION_CONSTANTS.TIME_DURATION_MIN).toBe(5);
      expect(VALIDATION_CONSTANTS.TIME_DURATION_MAX).toBe(480);
    });

    it('should have constants that match validation logic', () => {
      // Test that constants are used correctly in validation functions
      expect(validateWordGoal(VALIDATION_CONSTANTS.WORD_COUNT_MIN)).toBe(true);
      expect(validateWordGoal(VALIDATION_CONSTANTS.WORD_COUNT_MAX)).toBe(true);
      expect(validateTimeGoal(VALIDATION_CONSTANTS.TIME_DURATION_MIN)).toBe(true);
      expect(validateTimeGoal(VALIDATION_CONSTANTS.TIME_DURATION_MAX)).toBe(true);
    });
  });
});
