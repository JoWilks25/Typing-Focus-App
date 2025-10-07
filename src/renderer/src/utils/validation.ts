// src/renderer/src/utils/validation.ts
// Purpose: Validation utility functions for goal selection

export type GoalType = 'word' | 'time';

export interface RecommendedRange {
  min: number;
  max: number;
  label: string;
}

// Validation ranges
const WORD_COUNT_MIN = 10;
const WORD_COUNT_MAX = 10000;
const TIME_DURATION_MIN = 1; // minutes
const TIME_DURATION_MAX = 480; // 8 hours

// Recommended ranges for focused sessions
const WORD_COUNT_RECOMMENDED = { min: 250, max: 500, label: '250-500 words' };
const TIME_DURATION_RECOMMENDED = { min: 15, max: 30, label: '15-30 min' };

/**
 * Validates if a word count is within acceptable range
 */
export function validateWordCount(count: number): boolean {
  return count >= WORD_COUNT_MIN && count <= WORD_COUNT_MAX;
}

/**
 * Validates if a time duration is within acceptable range
 */
export function validateTimeDuration(duration: number): boolean {
  return duration >= TIME_DURATION_MIN && duration <= TIME_DURATION_MAX;
}

/**
 * Gets the recommended range for a goal type
 */
export function getRecommendedRange(goalType: GoalType): RecommendedRange {
  switch (goalType) {
    case 'word':
      return WORD_COUNT_RECOMMENDED;
    case 'time':
      return TIME_DURATION_RECOMMENDED;
    default:
      throw new Error(`Invalid goal type: ${goalType}`);
  }
}

/**
 * Validates if a goal is valid for the given type
 */
export function isValidGoal(goalType: GoalType, value: number): boolean {
  switch (goalType) {
    case 'word':
      return validateWordCount(value);
    case 'time':
      return validateTimeDuration(value);
    default:
      return false;
  }
}

/**
 * Sanitizes input by removing non-numeric characters
 * Preserves decimal points and negative signs
 */
export function sanitizeInput(input: string): string {
  // Remove non-numeric characters except decimal points and negative signs
  let sanitized = input.replace(/[^0-9.-]/g, '');
  
  // Handle multiple negative signs - keep only the first one
  const negativeSignCount = (sanitized.match(/-/g) || []).length;
  if (negativeSignCount > 1) {
    const firstNegativeIndex = sanitized.indexOf('-');
    sanitized = '-' + sanitized.substring(firstNegativeIndex + 1).replace(/-/g, '');
  }
  
  return sanitized;
}

/**
 * Gets the default value for a goal type
 */
export function getDefaultValue(goalType: GoalType): number {
  switch (goalType) {
    case 'word':
      return 500;
    case 'time':
      return 30;
    default:
      throw new Error(`Invalid goal type: ${goalType}`);
  }
}

/**
 * Formats a value with appropriate unit
 */
export function formatGoalValue(goalType: GoalType, value: number): string {
  switch (goalType) {
    case 'word':
      return `${value} word${value !== 1 ? 's' : ''}`;
    case 'time':
      return `${value} min`;
    default:
      throw new Error(`Invalid goal type: ${goalType}`);
  }
}
