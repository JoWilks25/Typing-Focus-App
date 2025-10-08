import { generateId } from '../utils/generateId';
import { isValidGoal } from '../utils/validation';
import { type GoalType } from '../../shared/types/validation';
import type { Session } from '../types/session';

/**
 * SessionManager provides simplified session management with basic activity tracking.
 * Combines session lifecycle, progress tracking, and basic focus detection.
 */
export class SessionManager {
  private sessions: Map<string, Session> = new Map();
  private activeSessionId: string | null = null;
  private autosaveInterval: NodeJS.Timeout | null = null;
  private readonly AUTOSAVE_INTERVAL = 30000; // 30 seconds

  /**
   * Start a new session
   */
  async startSession(
    name?: string, 
    title?: string, 
    goalType: GoalType = 'word', 
    goalValue: number = 500
  ): Promise<Session> {
    // Validate goal
    if (!isValidGoal(goalType, goalValue)) {
      throw new Error(`Invalid goal: ${goalType} goal value ${goalValue} is out of range`);
    }

    // Stop any existing active session
    if (this.activeSessionId) {
      await this.stopSession(this.activeSessionId);
    }

    const sessionId = generateId();
    const now = new Date().toISOString();
    const session: Session = {
      id: sessionId,
      name: name || `Session ${new Date().toLocaleString()}`,
      title,
      content: '',
      goalType,
      goalValue,
      startTime: Date.now(),
      status: 'active',
      createdAt: now,
      updatedAt: now,
      currentWords: 0,
      timeElapsed: 0,
      progressThresholds: { 33: false, 67: false, 100: false }
    };

    this.sessions.set(sessionId, session);
    this.activeSessionId = sessionId;
    
    // Start autosave
    this.startAutosave();
    
    return session;
  }

  /**
   * Stop an active session
   */
  async stopSession(sessionId: string): Promise<Session> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    if (session.status === 'stopped') {
      throw new Error(`Session is already stopped: ${sessionId}`);
    }

    const updatedSession: Session = {
      ...session,
      endTime: Date.now(),
      status: 'stopped',
      updatedAt: new Date().toISOString()
    };

    this.sessions.set(sessionId, updatedSession);
    
    // Clear active session if this was it
    if (this.activeSessionId === sessionId) {
      this.activeSessionId = null;
      this.stopAutosave();
    }
    
    return updatedSession;
  }

  /**
   * Get a session by ID
   */
  getSession(sessionId: string): Session | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Get the currently active session
   */
  getActiveSession(): Session | undefined {
    if (!this.activeSessionId) {
      return undefined;
    }
    return this.sessions.get(this.activeSessionId);
  }

  /**
   * List all sessions
   */
  listSessions(): Session[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Update session content and progress
   */
  async updateSessionContent(sessionId: string, content: string): Promise<Session> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    // Calculate word count
    const wordCount = this.calculateWordCount(content);
    const timeElapsed = Date.now() - session.startTime;
    
    // Calculate progress thresholds
    const progressThresholds = this.calculateProgressThresholds(session.goalType, session.goalValue, wordCount, timeElapsed);

    const updatedSession: Session = {
      ...session,
      content,
      currentWords: wordCount,
      timeElapsed,
      progressThresholds,
      updatedAt: new Date().toISOString()
    };

    this.sessions.set(sessionId, updatedSession);
    return updatedSession;
  }

  /**
   * Update progress for a session
   */
  async updateProgress(
    sessionId: string,
    currentWords: number,
    timeElapsed: number,
    progressThresholds: { 33: boolean; 67: boolean; 100: boolean }
  ): Promise<Session> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const updatedSession: Session = {
      ...session,
      currentWords,
      timeElapsed,
      progressThresholds,
      updatedAt: new Date().toISOString()
    };

    this.sessions.set(sessionId, updatedSession);
    return updatedSession;
  }

  /**
   * Check if session goal is completed
   */
  isGoalCompleted(session: Session): boolean {
    if (session.goalType === 'word') {
      return (session.currentWords || 0) >= session.goalValue;
    } else if (session.goalType === 'time') {
      return (session.timeElapsed || 0) >= (session.goalValue * 60 * 1000); // Convert minutes to milliseconds
    }
    return false;
  }

  /**
   * Get session statistics
   */
  getSessionStats(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const isCompleted = this.isGoalCompleted(session);
    const progressPercentage = this.calculateProgressPercentage(session);

    return {
      sessionId,
      isCompleted,
      progressPercentage,
      currentWords: session.currentWords,
      timeElapsed: session.timeElapsed,
      goalType: session.goalType,
      goalValue: session.goalValue
    };
  }

  /**
   * Clear all sessions (useful for testing)
   */
  clearAllSessions(): void {
    this.sessions.clear();
    this.activeSessionId = null;
    this.stopAutosave();
  }

  /**
   * Get the total number of sessions
   */
  getSessionCount(): number {
    return this.sessions.size;
  }

  /**
   * Calculate word count from content
   */
  private calculateWordCount(content: string): number {
    if (!content || content.trim() === '') {
      return 0;
    }
    return content.trim().split(/\s+/).length;
  }

  /**
   * Calculate progress thresholds based on goal type and current progress
   */
  private calculateProgressThresholds(
    goalType: GoalType, 
    goalValue: number, 
    currentWords: number, 
    timeElapsed: number
  ): { 33: boolean; 67: boolean; 100: boolean } {
    let progressPercentage = 0;
    
    if (goalType === 'word') {
      progressPercentage = (currentWords / goalValue) * 100;
    } else if (goalType === 'time') {
      const goalTimeMs = goalValue * 60 * 1000; // Convert minutes to milliseconds
      progressPercentage = (timeElapsed / goalTimeMs) * 100;
    }

    return {
      33: progressPercentage >= 33,
      67: progressPercentage >= 67,
      100: progressPercentage >= 100
    };
  }

  /**
   * Calculate progress percentage
   */
  private calculateProgressPercentage(session: Session): number {
    if (session.goalType === 'word') {
      return Math.min(((session.currentWords || 0) / session.goalValue) * 100, 100);
    } else if (session.goalType === 'time') {
      const goalTimeMs = session.goalValue * 60 * 1000;
      return Math.min(((session.timeElapsed || 0) / goalTimeMs) * 100, 100);
    }
    return 0;
  }

  /**
   * Start autosave interval
   */
  private startAutosave(): void {
    this.stopAutosave(); // Clear any existing interval
    
    this.autosaveInterval = setInterval(() => {
      if (this.activeSessionId) {
        const session = this.sessions.get(this.activeSessionId);
        if (session && session.status === 'active') {
          // Autosave logic would go here - for now just log
          console.log(`Autosaving session ${this.activeSessionId}`);
        }
      }
    }, this.AUTOSAVE_INTERVAL);
  }

  /**
   * Stop autosave interval
   */
  private stopAutosave(): void {
    if (this.autosaveInterval) {
      clearInterval(this.autosaveInterval);
      this.autosaveInterval = null;
    }
  }
}
