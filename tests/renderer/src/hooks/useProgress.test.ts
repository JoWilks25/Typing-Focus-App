// tests/renderer/src/hooks/useProgress.test.ts
// Purpose: Tests for useProgress hook

import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useProgress } from '../../../../src/renderer/src/hooks/useProgress';

describe('useProgress', () => {
  it('should calculate word progress correctly', () => {
    const onThresholdCrossed = vi.fn();
    
    const { result } = renderHook(() => useProgress({
      currentWords: 250,
      timeElapsed: 0,
      goalType: 'word',
      goalValue: 500,
      onThresholdCrossed
    }));

    expect(result.current.progress).toBe(50);
    expect(result.current.hasReached33).toBe(true);
    expect(result.current.hasReached67).toBe(false);
    expect(result.current.hasReached100).toBe(false);
  });

  it('should calculate time progress correctly', () => {
    const onThresholdCrossed = vi.fn();
    
    const { result } = renderHook(() => useProgress({
      currentWords: 0,
      timeElapsed: 30000, // 30 seconds
      goalType: 'time',
      goalValue: 1, // 1 minute
      onThresholdCrossed
    }));

    expect(result.current.progress).toBe(50);
    expect(result.current.hasReached33).toBe(true);
    expect(result.current.hasReached67).toBe(false);
    expect(result.current.hasReached100).toBe(false);
  });

  it('should clamp progress to 0-100 range', () => {
    const onThresholdCrossed = vi.fn();
    
    // Test negative progress
    const { result: negativeResult } = renderHook(() => useProgress({
      currentWords: -10,
      timeElapsed: 0,
      goalType: 'word',
      goalValue: 100,
      onThresholdCrossed
    }));

    expect(negativeResult.current.progress).toBe(0);

    // Test progress over 100%
    const { result: overResult } = renderHook(() => useProgress({
      currentWords: 600,
      timeElapsed: 0,
      goalType: 'word',
      goalValue: 500,
      onThresholdCrossed
    }));

    expect(overResult.current.progress).toBe(100);
  });

  it('should detect threshold crossings correctly', () => {
    const onThresholdCrossed = vi.fn();
    
    const { result, rerender } = renderHook(
      ({ currentWords, progressThresholds }) => useProgress({
        currentWords,
        timeElapsed: 0,
        goalType: 'word',
        goalValue: 100,
        progressThresholds,
        onThresholdCrossed
      }),
      { 
        initialProps: { 
          currentWords: 0, 
          progressThresholds: { 33: false, 67: false, 100: false } 
        } 
      }
    );

    expect(result.current.hasReached33).toBe(false);
    expect(result.current.hasReached67).toBe(false);
    expect(result.current.hasReached100).toBe(false);

    // Cross 33% threshold
    rerender({ currentWords: 35, progressThresholds: { 33: false, 67: false, 100: false } });
    expect(result.current.hasReached33).toBe(true);
    expect(onThresholdCrossed).toHaveBeenCalledWith(33);

    // Cross 67% threshold (with 33% already crossed)
    rerender({ currentWords: 70, progressThresholds: { 33: true, 67: false, 100: false } });
    expect(result.current.hasReached67).toBe(true);
    expect(onThresholdCrossed).toHaveBeenCalledWith(67);

    // Cross 100% threshold (with 33% and 67% already crossed)
    rerender({ currentWords: 100, progressThresholds: { 33: true, 67: true, 100: false } });
    expect(result.current.hasReached100).toBe(true);
    expect(onThresholdCrossed).toHaveBeenCalledWith(100);
  });

  it('should not trigger threshold callbacks for already crossed thresholds', () => {
    const onThresholdCrossed = vi.fn();
    
    const { rerender } = renderHook(
      ({ currentWords, progressThresholds }) => useProgress({
        currentWords,
        timeElapsed: 0,
        goalType: 'word',
        goalValue: 100,
        progressThresholds,
        onThresholdCrossed
      }),
      { 
        initialProps: { 
          currentWords: 0, 
          progressThresholds: { 33: false, 67: false, 100: false } 
        } 
      }
    );

    // Cross 33% threshold
    rerender({ currentWords: 35, progressThresholds: { 33: false, 67: false, 100: false } });
    expect(onThresholdCrossed).toHaveBeenCalledWith(33);
    expect(onThresholdCrossed).toHaveBeenCalledTimes(1);

    // Move past 33% again - should not trigger callback
    rerender({ currentWords: 40, progressThresholds: { 33: true, 67: false, 100: false } });
    expect(onThresholdCrossed).toHaveBeenCalledTimes(1);

    // Cross 67% threshold
    rerender({ currentWords: 70, progressThresholds: { 33: true, 67: false, 100: false } });
    expect(onThresholdCrossed).toHaveBeenCalledWith(67);
    expect(onThresholdCrossed).toHaveBeenCalledTimes(2);
  });

  it('should handle zero goal value', () => {
    const onThresholdCrossed = vi.fn();
    
    const { result } = renderHook(() => useProgress({
      currentWords: 100,
      timeElapsed: 0,
      goalType: 'word',
      goalValue: 0,
      onThresholdCrossed
    }));

    expect(result.current.progress).toBe(0);
    expect(result.current.hasReached33).toBe(false);
    expect(result.current.hasReached67).toBe(false);
    expect(result.current.hasReached100).toBe(false);
  });

  it('should round progress to 2 decimal places', () => {
    const onThresholdCrossed = vi.fn();
    
    const { result } = renderHook(() => useProgress({
      currentWords: 33,
      timeElapsed: 0,
      goalType: 'word',
      goalValue: 100,
      onThresholdCrossed
    }));

    expect(result.current.progress).toBe(33);
    expect(typeof result.current.progress).toBe('number');
  });

  it('should handle time progress with large values', () => {
    const onThresholdCrossed = vi.fn();
    
    const { result } = renderHook(() => useProgress({
      currentWords: 0,
      timeElapsed: 3600000, // 1 hour
      goalType: 'time',
      goalValue: 60, // 60 minutes
      onThresholdCrossed
    }));

    expect(result.current.progress).toBe(100);
    expect(result.current.hasReached100).toBe(true);
  });

  it('should handle edge case at exact threshold values', () => {
    const onThresholdCrossed = vi.fn();
    
    // Test exactly at 33%
    const { result: result33 } = renderHook(() => useProgress({
      currentWords: 33,
      timeElapsed: 0,
      goalType: 'word',
      goalValue: 100,
      onThresholdCrossed
    }));

    expect(result33.current.progress).toBe(33);
    expect(result33.current.hasReached33).toBe(true);

    // Test exactly at 67%
    const { result: result67 } = renderHook(() => useProgress({
      currentWords: 67,
      timeElapsed: 0,
      goalType: 'word',
      goalValue: 100,
      onThresholdCrossed
    }));

    expect(result67.current.progress).toBe(67);
    expect(result67.current.hasReached67).toBe(true);

    // Test exactly at 100%
    const { result: result100 } = renderHook(() => useProgress({
      currentWords: 100,
      timeElapsed: 0,
      goalType: 'word',
      goalValue: 100,
      onThresholdCrossed
    }));

    expect(result100.current.progress).toBe(100);
    expect(result100.current.hasReached100).toBe(true);
  });
});
