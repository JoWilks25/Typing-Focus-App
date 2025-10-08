// tests/renderer/src/hooks/useTimer.test.ts
// Purpose: Tests for useTimer hook

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTimer } from '../../../../src/renderer/src/hooks/useTimer';

// Mock timers
vi.useFakeTimers();

describe('useTimer', () => {
  beforeEach(() => {
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.useFakeTimers();
  });

  it('should initialize with zero time when no session start time', () => {
    const { result } = renderHook(() => useTimer());

    expect(result.current.timeElapsed).toBe(0);
    expect(result.current.formattedTime).toBe('00:00');
    expect(result.current.isRunning).toBe(false);
  });

  it('should calculate elapsed time correctly', () => {
    const sessionStartTime = Date.now() - 5000; // 5 seconds ago
    
    let result: any;
    act(() => {
      result = renderHook(() => useTimer({
        sessionStartTime,
        isSessionActive: true,
        isFocused: true
      })).result;
    });

    expect(result.current.timeElapsed).toBe(5000);
    expect(result.current.formattedTime).toBe('00:05');
  });

  it('should start timer when session is active and focused', () => {
    const sessionStartTime = Date.now();
    const onTimeUpdate = vi.fn();
    
    let result: any;
    act(() => {
      result = renderHook(() => useTimer({
        sessionStartTime,
        isSessionActive: true,
        isFocused: true,
        onTimeUpdate
      })).result;
    });

    expect(result.current.isRunning).toBe(true);
    
    // Advance time by 1 second
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(onTimeUpdate).toHaveBeenCalled();
  });

  it('should stop timer when session is not active', () => {
    const sessionStartTime = Date.now();
    
    let result: any;
    let rerender: any;
    act(() => {
      const hookResult = renderHook(
        ({ isActive }) => useTimer({
          sessionStartTime,
          isSessionActive: isActive,
          isFocused: true
        }),
        { initialProps: { isActive: true } }
      );
      result = hookResult.result;
      rerender = hookResult.rerender;
    });

    expect(result.current.isRunning).toBe(true);

    // Make session inactive
    act(() => {
      rerender({ isActive: false });
    });

    expect(result.current.isRunning).toBe(false);
  });

  it('should pause timer when not focused', () => {
    const sessionStartTime = Date.now();
    const onTimeUpdate = vi.fn();
    
    let result: any;
    let rerender: any;
    act(() => {
      const hookResult = renderHook(
        ({ isFocused }) => useTimer({
          sessionStartTime,
          isSessionActive: true,
          isFocused,
          onTimeUpdate
        }),
        { initialProps: { isFocused: true } }
      );
      result = hookResult.result;
      rerender = hookResult.rerender;
    });

    expect(result.current.isRunning).toBe(true);

    // Advance time by 1 second while focused
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const timeWhileFocused = result.current.timeElapsed;

    // Lose focus
    act(() => {
      rerender({ isFocused: false });
    });

    expect(result.current.isRunning).toBe(false);

    // Advance time by 2 seconds while not focused
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Time should not have increased
    expect(result.current.timeElapsed).toBe(timeWhileFocused);

    // Regain focus
    act(() => {
      rerender({ isFocused: true });
    });

    expect(result.current.isRunning).toBe(true);

    // Advance time by 1 second while focused again
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Time should have increased from the pause point
    expect(result.current.timeElapsed).toBeGreaterThan(timeWhileFocused);
  });

  it('should format time correctly', () => {
    const sessionStartTime = Date.now() - 125000; // 2 minutes 5 seconds ago
    
    let result: any;
    act(() => {
      result = renderHook(() => useTimer({
        sessionStartTime,
        isSessionActive: true,
        isFocused: true
      })).result;
    });

    expect(result.current.formattedTime).toBe('02:05');
  });

  it('should handle multiple focus changes correctly', () => {
    const sessionStartTime = Date.now();
    const onTimeUpdate = vi.fn();
    
    let result: any;
    let rerender: any;
    act(() => {
      const hookResult = renderHook(
        ({ isFocused }) => useTimer({
          sessionStartTime,
          isSessionActive: true,
          isFocused,
          onTimeUpdate
        }),
        { initialProps: { isFocused: true } }
      );
      result = hookResult.result;
      rerender = hookResult.rerender;
    });

    // Start focused
    expect(result.current.isRunning).toBe(true);

    // Advance 1 second
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const timeAfter1s = result.current.timeElapsed;

    // Lose focus
    act(() => {
      rerender({ isFocused: false });
    });
    expect(result.current.isRunning).toBe(false);

    // Advance 2 seconds while paused
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Regain focus
    act(() => {
      rerender({ isFocused: true });
    });
    expect(result.current.isRunning).toBe(true);

    // Advance 1 second while focused
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Should have only 2 seconds of active time (1s + 1s)
    expect(result.current.timeElapsed).toBe(timeAfter1s + 1000);
  });

  it('should clean up interval on unmount', () => {
    const sessionStartTime = Date.now();
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
    
    const { unmount } = renderHook(() => useTimer({
      sessionStartTime,
      isSessionActive: true,
      isFocused: true
    }));

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  it('should reset when session start time changes', () => {
    const initialStartTime = Date.now() - 5000;
    
    let result: any;
    let rerender: any;
    act(() => {
      const hookResult = renderHook(
        ({ startTime }) => useTimer({
          sessionStartTime: startTime,
          isSessionActive: true,
          isFocused: true
        }),
        { initialProps: { startTime: initialStartTime } }
      );
      result = hookResult.result;
      rerender = hookResult.rerender;
    });

    expect(result.current.timeElapsed).toBe(5000);

    // Change to new session
    const newStartTime = Date.now() - 2000;
    act(() => {
      rerender({ startTime: newStartTime });
    });

    expect(result.current.timeElapsed).toBe(2000);
  });
});
