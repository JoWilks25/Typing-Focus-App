// src/renderer/src/utils/wordCount.ts
// Purpose: Word counting and text analysis utilities

export interface WordCountResult {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  paragraphs: number;
  sentences: number;
  readingTime: number; // in minutes
}

/**
 * Count words, characters, and other text metrics
 * @param text - The text to analyze
 * @returns WordCountResult with various text metrics
 */
export function countWords(text: string): WordCountResult {
  if (!text || typeof text !== 'string') {
    return {
      words: 0,
      characters: 0,
      charactersNoSpaces: 0,
      paragraphs: 0,
      sentences: 0,
      readingTime: 0,
    };
  }

  const trimmedText = text.trim();
  
  // Count words (split by whitespace and filter empty strings)
  const words = trimmedText
    .split(/\s+/)
    .filter(word => word.length > 0).length;

  // Count characters
  const characters = trimmedText.length;
  const charactersNoSpaces = trimmedText.replace(/\s/g, '').length;

  // Count paragraphs (split by double newlines or more)
  const paragraphs = trimmedText
    .split(/\n\s*\n/)
    .filter(paragraph => paragraph.trim().length > 0).length;

  // Count sentences (split by sentence-ending punctuation)
  const sentences = trimmedText
    .split(/[.!?]+/)
    .filter(sentence => sentence.trim().length > 0).length;

  // Calculate reading time (average 200 words per minute)
  const readingTime = words > 0 ? Math.ceil(words / 200) : 0;

  return {
    words,
    characters,
    charactersNoSpaces,
    paragraphs,
    sentences,
    readingTime,
  };
}

/**
 * Get a formatted string representation of word count
 * @param result - WordCountResult from countWords
 * @returns Formatted string
 */
export function formatWordCount(result: WordCountResult): string {
  const { words, characters, readingTime } = result;
  
  let formatted = `${words} word${words !== 1 ? 's' : ''}`;
  
  if (characters > 0) {
    formatted += `, ${characters} character${characters !== 1 ? 's' : ''}`;
  }
  
  if (readingTime > 0) {
    formatted += `, ~${readingTime} min read`;
  }
  
  return formatted;
}

/**
 * Check if text meets a minimum word count requirement
 * @param text - The text to check
 * @param minWords - Minimum number of words required
 * @returns True if text meets the minimum word count
 */
export function meetsMinimumWordCount(text: string, minWords: number): boolean {
  const result = countWords(text);
  return result.words >= minWords;
}

/**
 * Get writing progress as a percentage
 * @param currentWords - Current word count
 * @param targetWords - Target word count
 * @returns Progress percentage (0-100)
 */
export function getWritingProgress(currentWords: number, targetWords: number): number {
  if (targetWords <= 0) return 0;
  if (currentWords <= 0) return 0;
  
  const progress = (currentWords / targetWords) * 100;
  return Math.min(Math.round(progress), 100);
}
