// tests/renderer/src/utils/validation.test.ts
// Purpose: Tests for goal validation utilities

import { describe, it, expect } from 'vitest';
import { 
  validateWordCount, 
  validateTimeDuration, 
  getRecommendedRange,
  isValidGoal,
  sanitizeInput 
} from '../../../../src/renderer/src/utils/validation';

describe('Goal Validation Utilities', () => {
  describe('validateWordCount', () => {
    it('should accept valid word counts within range', () => {
      expect(validateWordCount(100)).toBe(true);
      expect(validateWordCount(500)).toBe(true);
      expect(validateWordCount(2000)).toBe(true);
      expect(validateWordCount(10000)).toBe(true);
    });

    it('should reject word counts below minimum', () => {
      expect(validateWordCount(0)).toBe(false);
      expect(validateWordCount(5)).toBe(false);
      expect(validateWordCount(9)).toBe(false);
    });

    it('should reject word counts above maximum', () => {
      expect(validateWordCount(10001)).toBe(false);
      expect(validateWordCount(50000)).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(validateWordCount(10)).toBe(true); // minimum
      expect(validateWordCount(10000)).toBe(true); // maximum
    });
  });

  describe('validateTimeDuration', () => {
    it('should accept valid time durations within range', () => {
      expect(validateTimeDuration(5)).toBe(true);
      expect(validateTimeDuration(30)).toBe(true);
      expect(validateTimeDuration(120)).toBe(true);
      expect(validateTimeDuration(480)).toBe(true);
    });

    it('should reject time durations below minimum', () => {
      expect(validateTimeDuration(0)).toBe(false);
      expect(validateTimeDuration(0.5)).toBe(false);
    });

    it('should reject time durations above maximum', () => {
      expect(validateTimeDuration(481)).toBe(false);
      expect(validateTimeDuration(600)).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(validateTimeDuration(1)).toBe(true); // minimum
      expect(validateTimeDuration(480)).toBe(true); // maximum
    });
  });

  describe('getRecommendedRange', () => {
    it('should return word count recommendations', () => {
      const wordRec = getRecommendedRange('word');
      expect(wordRec.min).toBe(250);
      expect(wordRec.max).toBe(500);
      expect(wordRec.label).toBe('250-500 words');
    });

    it('should return time duration recommendations', () => {
      const timeRec = getRecommendedRange('time');
      expect(timeRec.min).toBe(15);
      expect(timeRec.max).toBe(30);
      expect(timeRec.label).toBe('15-30 min');
    });

    it('should handle invalid goal types', () => {
      expect(() => getRecommendedRange('invalid' as any)).toThrow();
    });
  });

  describe('isValidGoal', () => {
    it('should validate word count goals', () => {
      expect(isValidGoal('word', 500)).toBe(true);
      expect(isValidGoal('word', 5)).toBe(false);
      expect(isValidGoal('word', 15000)).toBe(false);
    });

    it('should validate time duration goals', () => {
      expect(isValidGoal('time', 30)).toBe(true);
      expect(isValidGoal('time', 0.5)).toBe(false);
      expect(isValidGoal('time', 600)).toBe(false);
    });

    it('should handle invalid goal types', () => {
      expect(isValidGoal('invalid' as any, 500)).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('should remove non-numeric characters', () => {
      expect(sanitizeInput('abc123def')).toBe('123');
      expect(sanitizeInput('500 words')).toBe('500');
      expect(sanitizeInput('30 min')).toBe('30');
    });

    it('should handle empty and whitespace inputs', () => {
      expect(sanitizeInput('')).toBe('');
      expect(sanitizeInput('   ')).toBe('');
      expect(sanitizeInput(' 500 ')).toBe('500');
    });

    it('should handle decimal numbers', () => {
      expect(sanitizeInput('30.5')).toBe('30.5');
      expect(sanitizeInput('500.0')).toBe('500.0');
    });

    it('should handle negative numbers', () => {
      expect(sanitizeInput('-500')).toBe('-500');
      expect(sanitizeInput('--30')).toBe('-30');
    });
  });
});
