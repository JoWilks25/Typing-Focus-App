// src/renderer/src/utils/wordCount.ts
// Purpose: Word count utilities for the editor

export function getWordCount(text: string): number {
  if (!text || text.trim().length === 0) {
    return 0;
  }
  
  // Split by whitespace and filter out empty strings
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  return words.length;
}

export function getCharacterCount(text: string): number {
  return text ? text.length : 0;
}

export function getCharacterCountNoSpaces(text: string): number {
  return text ? text.replace(/\s/g, '').length : 0;
}