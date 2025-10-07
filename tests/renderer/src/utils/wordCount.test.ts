// tests/renderer/src/utils/wordCount.test.ts
// Purpose: Tests for word count utilities

import { describe, it, expect } from 'vitest';
import { getWordCount, getCharacterCount, getCharacterCountNoSpaces } from '../../../../src/renderer/src/utils/wordCount';

describe('Word Count Utilities', () => {
  describe('getWordCount', () => {
    it('should return 0 for empty string', () => {
      expect(getWordCount('')).toBe(0);
    });

    it('should return 0 for whitespace only', () => {
      expect(getWordCount('   ')).toBe(0);
      expect(getWordCount('\n\t')).toBe(0);
    });

    it('should count single word', () => {
      expect(getWordCount('hello')).toBe(1);
    });

    it('should count multiple words', () => {
      expect(getWordCount('hello world')).toBe(2);
      expect(getWordCount('hello world test')).toBe(3);
    });

    it('should handle multiple spaces', () => {
      expect(getWordCount('hello    world')).toBe(2);
      expect(getWordCount('  hello   world  ')).toBe(2);
    });

    it('should handle newlines and tabs', () => {
      expect(getWordCount('hello\nworld')).toBe(2);
      expect(getWordCount('hello\tworld')).toBe(2);
      expect(getWordCount('hello\n\tworld')).toBe(2);
    });
  });

  describe('getCharacterCount', () => {
    it('should return 0 for empty string', () => {
      expect(getCharacterCount('')).toBe(0);
    });

    it('should count all characters including spaces', () => {
      expect(getCharacterCount('hello')).toBe(5);
      expect(getCharacterCount('hello world')).toBe(11);
      expect(getCharacterCount('hello\nworld')).toBe(11);
    });
  });

  describe('getCharacterCountNoSpaces', () => {
    it('should return 0 for empty string', () => {
      expect(getCharacterCountNoSpaces('')).toBe(0);
    });

    it('should count characters excluding spaces', () => {
      expect(getCharacterCountNoSpaces('hello')).toBe(5);
      expect(getCharacterCountNoSpaces('hello world')).toBe(10);
      expect(getCharacterCountNoSpaces('hello\nworld')).toBe(10);
    });
  });
});