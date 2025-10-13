import { generateId } from '../utils/generateId';
import { isValidGoal } from '../utils/validation';
import { calculateSessionStats } from '../utils/calculateSessionStats';
import { type GoalType } from '../../shared/types/validation';
import type { Session } from '../types/session';
import { FileManager } from './fileManager';

/**
 * SessionManager provides simplified session management with basic activity tracking.
 * Combines session lifecycle, progress tracking, and basic focus detection.
 */
export class SessionManager {
  private sessions: Map<string, Session> = new Map();
  private activeSessionId: string | null = null;
  private autosaveInterval: NodeJS.Timeout | null = null;
  private readonly AUTOSAVE_INTERVAL = 2000; // 2 seconds for file-based sessions
  private fileManager: FileManager | null = null;

  /**
   * Set the file manager instance
   */
  setFileManager(fileManager: FileManager): void {
    this.fileManager = fileManager;
  }

  /**
   * Start a new session
   */
  async startSession(
    filePath: string,
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
      filePath,
      goalType,
      goalValue,
      startTime: Date.now(),
      status: 'active',
      createdAt: now,
      updatedAt: now,
      currentWords: 0,
      timeElapsed: 0,
      progressPercentage: 0
    };

    // Create initial empty file
    if (this.fileManager) {
      await this.fileManager.writeFileExternal(filePath, '');
    }

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
   * End a session with final content and calculate completion status
   */
  async endSession(sessionId: string, finalContent: string, finalWordCount: number): Promise<Session> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    if (session.status === 'stopped' || session.status === 'abandoned') {
      throw new Error(`Session is already ended: ${sessionId}`);
    }

    const endTime = Date.now();
    const timeElapsed = endTime - session.startTime;

    // Final save to file
    const plainText = this.htmlToPlainText(finalContent);
    if (this.fileManager) {
      await this.fileManager.writeFileExternal(session.filePath, plainText);
    }

    // Update session with final data
    const updatedSession: Session = {
      ...session,
      content: finalContent,
      currentWords: finalWordCount,
      timeElapsed,
      endTime,
      lastSavedToFile: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Calculate final stats to determine completion status
    const stats = calculateSessionStats(updatedSession);
    updatedSession.status = stats.finalStatus;

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
   * Convert HTML content to plain text
   */
  private htmlToPlainText(html: string): string {
    // Strip HTML tags, convert to plain text
    return html
      .replace(/<\/p>/g, '\n')
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/<[^>]*>/g, '')
      .trim();
  }

  /**
   * Update session content and progress
   */
  async updateSessionContent(sessionId: string, content: string): Promise<Session> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    // Calculate word count from plain text
    const plainText = this.htmlToPlainText(content);
    const wordCount = this.calculateWordCount(plainText);
    const timeElapsed = Date.now() - session.startTime;
    
    // Save to file
    if (this.fileManager) {
      await this.fileManager.writeFileExternal(session.filePath, plainText);
    }
    
    const updatedSession: Session = {
      ...session,
      content,
      currentWords: wordCount,
      timeElapsed,
      progressPercentage: 0, // temporary; will be updated below
      lastSavedToFile: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Calculate progress percentage after updating counts
    updatedSession.progressPercentage = this.calculateProgressPercentage(updatedSession);

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
    progressPercentage: number
  ): Promise<Session> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const updatedSession: Session = {
      ...session,
      currentWords,
      timeElapsed,
      progressPercentage,
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
   * Increment distraction count for a session
   */
  incrementDistractionCount(sessionId: string): Session {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const currentCount = session.distractionCount || 0;
    const updatedSession: Session = {
      ...session,
      distractionCount: currentCount + 1,
      updatedAt: new Date().toISOString()
    };

    this.sessions.set(sessionId, updatedSession);
    return updatedSession;
  }

  /**
   * Abandon a session (mark as abandoned)
   */
  abandonSession(sessionId: string): Session {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    if (session.status === 'stopped') {
      throw new Error(`Session is already stopped: ${sessionId}`);
    }

    const updatedSession: Session = {
      ...session,
      status: 'abandoned',
      isAbandoned: true,
      endTime: Date.now(),
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
    
    this.autosaveInterval = setInterval(async () => {
      if (this.activeSessionId) {
        const session = this.sessions.get(this.activeSessionId);
        if (session && session.status === 'active' && session.content && this.fileManager) {
          try {
            const plainText = this.htmlToPlainText(session.content);
            await this.fileManager.writeFileExternal(session.filePath, plainText);
            console.log(`Autosaved session ${this.activeSessionId} to ${session.filePath}`);
          } catch (error) {
            console.error('Autosave failed:', error);
          }
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
