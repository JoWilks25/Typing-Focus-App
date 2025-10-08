// src/main/utils/validation.ts
// Purpose: Validation utility functions for goal validation in main process

export type GoalType = 'word' | 'time';

// Validation ranges
const WORD_COUNT_MIN = 10;
const WORD_COUNT_MAX = 10000;
const TIME_DURATION_MIN = 5; // minutes
const TIME_DURATION_MAX = 480; // 8 hours

/**
 * Validates if a word count is within acceptable range
 * @param count - The word count to validate
 * @returns true if valid, false otherwise
 */
export function validateWordGoal(count: number): boolean {
  return count >= WORD_COUNT_MIN && count <= WORD_COUNT_MAX;
}

/**
 * Validates if a time duration is within acceptable range
 * @param duration - The time duration in minutes to validate
 * @returns true if valid, false otherwise
 */
export function validateTimeGoal(duration: number): boolean {
  return duration >= TIME_DURATION_MIN && duration <= TIME_DURATION_MAX;
}

/**
 * Validates if a goal is valid for the given type
 * @param goalType - The type of goal ('word' or 'time')
 * @param value - The value to validate
 * @returns true if valid, false otherwise
 */
export function isValidGoal(goalType: GoalType, value: number): boolean {
  switch (goalType) {
    case 'word':
      return validateWordGoal(value);
    case 'time':
      return validateTimeGoal(value);
    default:
      return false;
  }
}

/**
 * Get validation constants for external use
 */
export const VALIDATION_CONSTANTS = {
  WORD_COUNT_MIN,
  WORD_COUNT_MAX,
  TIME_DURATION_MIN,
  TIME_DURATION_MAX,
} as const;
