/**
 * Focus tracking service for managing focus sessions
 * Tracks when users start and stop focus for specific sessions
 */

export interface FocusSession {
  sessionId: string;
  startTime: number;
  endTime?: number;
  isActive: boolean;
}

export interface FocusStartResult {
  success: boolean;
  sessionId: string;
  startTime: number;
}

export interface FocusStopResult {
  success: boolean;
  sessionId: string;
  endTime: number;
}

export interface FocusStatus {
  isActive: boolean;
  sessionId: string;
  startTime?: number;
  endTime?: number;
}

export class FocusService {
  private focusSessions: Map<string, FocusSession> = new Map();

  /**
   * Start focus tracking for a session
   */
  startFocus(sessionId: string): FocusStartResult {
    this.validateSessionId(sessionId);

    // Check if focus is already active for this session
    const existingSession = this.focusSessions.get(sessionId);
    if (existingSession && existingSession.isActive) {
      throw new Error(`Focus is already active for session: ${sessionId}`);
    }

    const startTime = Date.now();
    const focusSession: FocusSession = {
      sessionId,
      startTime,
      isActive: true
    };

    this.focusSessions.set(sessionId, focusSession);

    return {
      success: true,
      sessionId,
      startTime
    };
  }

  /**
   * Stop focus tracking for a session
   */
  stopFocus(sessionId: string): FocusStopResult {
    this.validateSessionId(sessionId);

    const focusSession = this.focusSessions.get(sessionId);
    if (!focusSession || !focusSession.isActive) {
      throw new Error(`Focus is not active for session: ${sessionId}`);
    }

    const endTime = Date.now();
    focusSession.endTime = endTime;
    focusSession.isActive = false;

    return {
      success: true,
      sessionId,
      endTime
    };
  }

  /**
   * Get focus status for a session
   */
  getFocusStatus(sessionId: string): FocusStatus {
    this.validateSessionId(sessionId);

    const focusSession = this.focusSessions.get(sessionId);
    if (!focusSession || !focusSession.isActive) {
      return {
        isActive: false,
        sessionId,
        startTime: undefined,
        endTime: undefined
      };
    }

    return {
      isActive: true,
      sessionId,
      startTime: focusSession.startTime,
      endTime: focusSession.endTime
    };
  }

  /**
   * Get all currently active focus sessions
   */
  getAllFocusSessions(): FocusSession[] {
    return Array.from(this.focusSessions.values())
      .filter(session => session.isActive);
  }

  /**
   * Clear all focus sessions
   */
  clearAllFocus(): void {
    this.focusSessions.clear();
  }

  /**
   * Get focus session by ID (for internal use)
   */
  getFocusSession(sessionId: string): FocusSession | undefined {
    return this.focusSessions.get(sessionId);
  }

  /**
   * Get total number of focus sessions (active and inactive)
   */
  getFocusSessionCount(): number {
    return this.focusSessions.size;
  }

  /**
   * Validate session ID input
   */
  private validateSessionId(sessionId: string): void {
    if (!sessionId || sessionId.trim() === '') {
      throw new Error('Session ID is required');
    }
  }
}
