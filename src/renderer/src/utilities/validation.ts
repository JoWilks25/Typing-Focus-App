// src/renderer/src/utilities/validation.ts
// Purpose: Validation utilities for goal input

import type { GoalType } from '@renderer/stores/SessionStore';

export const sanitizeInput = (value: string): string => {
  // Remove all non-numeric characters except decimal point
  return value.replace(/[^\d.]/g, '');
};

export const getDefaultValue = (goalType: GoalType): number => {
  if (goalType === 'wordcount') {
    return 500;
  }
  return 30; // minutes for time
};

export const formatGoalValue = (goalType: GoalType, value: number): string => {
  if (goalType === 'wordcount') {
    return value.toString();
  }
  return `${value} min`;
};

export const getRecommendedRange = (goalType: GoalType): { min: number; max: number; label: string } => {
  if (goalType === 'wordcount') {
    return {
      min: 250,
      max: 1000,
      label: '250-1000 words'
    };
  }
  return {
    min: 15,
    max: 60,
    label: '15-60 minutes'
  };
};

