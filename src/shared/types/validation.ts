// src/shared/types/validation.ts
// Purpose: Shared validation types and constants

export type GoalType = 'word' | 'time';

// Validation ranges - shared across main and renderer processes
export const VALIDATION_RANGES = {
  WORD_COUNT_MIN: 100,
  WORD_COUNT_MAX: 10000,
  TIME_DURATION_MIN: 5, // minutes
  TIME_DURATION_MAX: 480, // 8 hours
} as const;

// Recommended ranges for focused sessions (renderer-specific)
export const RECOMMENDED_RANGES = {
  WORD_COUNT: { min: 250, max: 500, label: '250-500 words' },
  TIME_DURATION: { min: 15, max: 30, label: '15-30 min' },
} as const;

// Default values for goal types
export const DEFAULT_VALUES = {
  WORD: 500,
  TIME: 30,
} as const;
