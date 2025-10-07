import { describe, it, expect } from 'vitest';
import { 
  countWords, 
  formatWordCount, 
  meetsMinimumWordCount, 
  getWritingProgress,
  type WordCountResult 
} from '../../../../src/renderer/src/utils/wordCount';

describe('wordCount utilities', () => {
  describe('countWords', () => {
    it('should return zero counts for empty or invalid input', () => {
      const emptyResult = countWords('');
      const nullResult = countWords(null as any);
      const undefinedResult = countWords(undefined as any);
      const nonStringResult = countWords(123 as any);

      const expectedEmpty: WordCountResult = {
        words: 0,
        characters: 0,
        charactersNoSpaces: 0,
        paragraphs: 0,
        sentences: 0,
        readingTime: 0,
      };

      expect(emptyResult).toEqual(expectedEmpty);
      expect(nullResult).toEqual(expectedEmpty);
      expect(undefinedResult).toEqual(expectedEmpty);
      expect(nonStringResult).toEqual(expectedEmpty);
    });

    it('should count words correctly', () => {
      const result = countWords('Hello world this is a test');
      expect(result.words).toBe(6);
    });

    it('should handle multiple spaces and newlines', () => {
      const result = countWords('Hello    world\n\nthis   is\ta\ttest');
      expect(result.words).toBe(6);
    });

    it('should count characters correctly', () => {
      const result = countWords('Hello world');
      expect(result.characters).toBe(11);
      expect(result.charactersNoSpaces).toBe(10);
    });

    it('should count paragraphs correctly', () => {
      const text = 'First paragraph.\n\nSecond paragraph.\n\n\nThird paragraph.';
      const result = countWords(text);
      expect(result.paragraphs).toBe(3);
    });

    it('should count sentences correctly', () => {
      const text = 'First sentence. Second sentence! Third sentence? Fourth sentence.';
      const result = countWords(text);
      expect(result.sentences).toBe(4);
    });

    it('should calculate reading time correctly', () => {
      // 200 words should take 1 minute
      const longText = 'word '.repeat(200);
      const result = countWords(longText);
      expect(result.readingTime).toBe(1);

      // 400 words should take 2 minutes
      const longerText = 'word '.repeat(400);
      const longerResult = countWords(longerText);
      expect(longerResult.readingTime).toBe(2);

      // 100 words should take 1 minute (rounded up)
      const shortText = 'word '.repeat(100);
      const shortResult = countWords(shortText);
      expect(shortResult.readingTime).toBe(1);
    });

    it('should handle complex text with punctuation', () => {
      const text = 'Hello, world! This is a test. How are you? I\'m fine, thanks.';
      const result = countWords(text);
      
      expect(result.words).toBe(12);
      expect(result.characters).toBe(60);
      expect(result.sentences).toBe(4);
    });
  });

  describe('formatWordCount', () => {
    it('should format word count correctly', () => {
      const result: WordCountResult = {
        words: 5,
        characters: 25,
        charactersNoSpaces: 20,
        paragraphs: 1,
        sentences: 1,
        readingTime: 1,
      };

      const formatted = formatWordCount(result);
      expect(formatted).toBe('5 words, 25 characters, ~1 min read');
    });

    it('should handle singular forms correctly', () => {
      const result: WordCountResult = {
        words: 1,
        characters: 5,
        charactersNoSpaces: 4,
        paragraphs: 1,
        sentences: 1,
        readingTime: 1,
      };

      const formatted = formatWordCount(result);
      expect(formatted).toBe('1 word, 5 characters, ~1 min read');
    });

    it('should handle zero values correctly', () => {
      const result: WordCountResult = {
        words: 0,
        characters: 0,
        charactersNoSpaces: 0,
        paragraphs: 0,
        sentences: 0,
        readingTime: 0,
      };

      const formatted = formatWordCount(result);
      expect(formatted).toBe('0 words');
    });
  });

  describe('meetsMinimumWordCount', () => {
    it('should return true when text meets minimum word count', () => {
      const text = 'This is a test with five words';
      expect(meetsMinimumWordCount(text, 5)).toBe(true);
      expect(meetsMinimumWordCount(text, 4)).toBe(true);
    });

    it('should return false when text does not meet minimum word count', () => {
      const text = 'This is a test';
      expect(meetsMinimumWordCount(text, 5)).toBe(false);
      expect(meetsMinimumWordCount(text, 10)).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(meetsMinimumWordCount('', 0)).toBe(true);
      expect(meetsMinimumWordCount('', 1)).toBe(false);
      expect(meetsMinimumWordCount('word', 1)).toBe(true);
    });
  });

  describe('getWritingProgress', () => {
    it('should calculate progress correctly', () => {
      expect(getWritingProgress(500, 1000)).toBe(50);
      expect(getWritingProgress(250, 1000)).toBe(25);
      expect(getWritingProgress(1000, 1000)).toBe(100);
    });

    it('should cap progress at 100%', () => {
      expect(getWritingProgress(1500, 1000)).toBe(100);
    });

    it('should return 0 for invalid inputs', () => {
      expect(getWritingProgress(0, 1000)).toBe(0);
      expect(getWritingProgress(500, 0)).toBe(0);
      expect(getWritingProgress(-100, 1000)).toBe(0);
      expect(getWritingProgress(500, -100)).toBe(0);
    });

    it('should round progress to nearest integer', () => {
      expect(getWritingProgress(333, 1000)).toBe(33);
      expect(getWritingProgress(334, 1000)).toBe(33);
      expect(getWritingProgress(335, 1000)).toBe(34);
    });
  });
});
