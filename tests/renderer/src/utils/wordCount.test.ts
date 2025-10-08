// tests/renderer/src/utils/wordCount.test.ts
// Purpose: Tests for word count utilities

import { describe, it, expect } from 'vitest';
import { calculateWordCount, getCharacterCount, getCharacterCountNoSpaces } from '../../../../src/renderer/src/utils/wordCount';

describe('Word Count Utilities', () => {
  describe('calculateWordCount', () => {
    it('should return 0 for empty string', () => {
      expect(calculateWordCount('')).toBe(0);
    });

    it('should return 0 for whitespace only', () => {
      expect(calculateWordCount('   ')).toBe(0);
      expect(calculateWordCount('\n\t')).toBe(0);
      expect(calculateWordCount('\r\n')).toBe(0);
      expect(calculateWordCount(' \t\n\r ')).toBe(0);
    });

    it('should count single word', () => {
      expect(calculateWordCount('hello')).toBe(1);
    });

    it('should count multiple words', () => {
      expect(calculateWordCount('hello world')).toBe(2);
      expect(calculateWordCount('hello world test')).toBe(3);
    });

    it('should handle multiple spaces', () => {
      expect(calculateWordCount('hello    world')).toBe(2);
      expect(calculateWordCount('  hello   world  ')).toBe(2);
    });

    it('should handle newlines and tabs', () => {
      expect(calculateWordCount('hello\nworld')).toBe(2);
      expect(calculateWordCount('hello\tworld')).toBe(2);
      expect(calculateWordCount('hello\n\tworld')).toBe(2);
    });

    it('should handle symbols and punctuation', () => {
      expect(calculateWordCount('hello-world')).toBe(1);
      expect(calculateWordCount('test@example.com')).toBe(1);
      expect(calculateWordCount('hello, world!')).toBe(2);
      expect(calculateWordCount('hello... world?')).toBe(2);
      expect(calculateWordCount('hello-world test@example.com')).toBe(2);
    });

    it('should handle numbers and alphanumeric', () => {
      expect(calculateWordCount('123')).toBe(1);
      expect(calculateWordCount('hello123')).toBe(1);
      expect(calculateWordCount('123hello')).toBe(1);
      expect(calculateWordCount('hello 123 world')).toBe(3);
      expect(calculateWordCount('test123@example.com')).toBe(1);
    });

    it('should handle unicode characters and emojis', () => {
      expect(calculateWordCount('café')).toBe(1);
      expect(calculateWordCount('naïve résumé')).toBe(2);
      expect(calculateWordCount('hello 😀 world')).toBe(3);
      expect(calculateWordCount('测试 中文')).toBe(2);
      expect(calculateWordCount('مرحبا بالعالم')).toBe(2);
    });

    it('should handle mixed whitespace types', () => {
      expect(calculateWordCount('hello\r\nworld')).toBe(2);
      expect(calculateWordCount('hello\t\n\rworld')).toBe(2);
      expect(calculateWordCount('  hello\t\n  world  \r\n  ')).toBe(2);
    });

    it('should handle edge cases with null/undefined', () => {
      expect(calculateWordCount(null as any)).toBe(0);
      expect(calculateWordCount(undefined as any)).toBe(0);
    });

    it('should handle very long documents efficiently', () => {
      // Create a 10k+ word document
      const words = Array(10000).fill('word');
      const longText = words.join(' ');
      
      const start = globalThis.performance.now();
      const count = calculateWordCount(longText);
      const end = globalThis.performance.now();
      
      expect(count).toBe(10000);
      expect(end - start).toBeLessThan(100); // Should complete in under 100ms
    });

    it('should handle complex real-world text', () => {
      const complexText = `
        Hello, world! This is a test document with various elements:
        - Bullet points
        - Numbers: 123, 456, 789
        - Emails: test@example.com, user@domain.org
        - URLs: https://example.com/path?query=value
        - Unicode: café, naïve, résumé
        - Emojis: 😀 🎉 ✨
        - Mixed: test123@example.com, hello-world_123
      `;
      
      expect(calculateWordCount(complexText)).toBe(39);
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