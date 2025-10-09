// src/renderer/src/types/animation.ts
// Purpose: Type definitions for tree animation system

export interface TreeAnimationProps {
  progress: number; // 0-100
  isWilting?: boolean; // For abandoned sessions
}

export interface TreeAnimationModalContent {
  progress: number;
  isWilting: boolean;
}

// IPC event types for tree animation
export interface TreeAnimationProgressEvent {
  progress: number;
  isWilting?: boolean;
}

// Tree state ranges for reference
export const TREE_STATE_RANGES = {
  SEEDLING: { min: 0, max: 33, frames: { min: 0, max: 16 } },
  SMALL_TREE: { min: 34, max: 66, frames: { min: 17, max: 32 } },
  MATURE_TREE: { min: 67, max: 100, frames: { min: 33, max: 48 } }
} as const;

// Animation configuration
export const ANIMATION_CONFIG = {
  TOTAL_FRAMES: 48,
  WILTING_FRAMES: 48 // For reverse animation or separate wilting animation
} as const;
