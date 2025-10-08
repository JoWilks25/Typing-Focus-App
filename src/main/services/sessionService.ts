import { generateId } from '../utils/generateId';
import { isValidGoal, type GoalType } from '../utils/validation';
import { StorageService } from './storageService';
import type { Session } from '../types/session';

/**
 * SessionService provides session management with persistence.
 * Sessions are stored in memory and persisted to active-session.json via StorageService.
 */
export class SessionService {
  private sessions: Map<string, Session> = new Map();
  private storageService: StorageService;
  private readonly ACTIVE_SESSION_KEY = 'active-session';

  constructor(storageService: StorageService) {
    this.storageService = storageService;
  }

  /**
   * Start a new session
   * @param name - Optional name for the session
   * @param title - Optional title for the session
   * @param goalType - The type of goal ('word' or 'time')
   * @param goalValue - The goal value
   * @returns The created session
   * @throws Error if goal validation fails
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
      updatedAt: now
    };

    this.sessions.set(sessionId, session);
    
    // Persist active session
    await this.storageService.set(this.ACTIVE_SESSION_KEY, session);
    
    return session;
  }

  /**
   * Stop an active session
   * @param sessionId - The ID of the session to stop
   * @returns The updated session
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
    
    // Remove from active session storage
    await this.storageService.remove(this.ACTIVE_SESSION_KEY);
    
    return updatedSession;
  }

  /**
   * Get a session by ID
   * @param sessionId - The ID of the session to retrieve
   * @returns The session or undefined if not found
   */
  getSession(sessionId: string): Session | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * List all sessions
   * @returns Array of all sessions
   */
  listSessions(): Session[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Get all active sessions
   * @returns Array of active sessions
   */
  getActiveSessions(): Session[] {
    return this.listSessions().filter(session => session.status === 'active');
  }

  /**
   * Get all stopped sessions
   * @returns Array of stopped sessions
   */
  getStoppedSessions(): Session[] {
    return this.listSessions().filter(session => session.status === 'stopped');
  }

  /**
   * Clear all sessions (useful for testing)
   */
  clearAllSessions(): void {
    this.sessions.clear();
  }

  /**
   * Get the total number of sessions
   * @returns Number of sessions
   */
  getSessionCount(): number {
    return this.sessions.size;
  }

  /**
   * Get the currently active session from storage
   * @returns The active session or undefined if none exists
   */
  async getActiveSession(): Promise<Session | undefined> {
    try {
      const activeSession = await this.storageService.get(this.ACTIVE_SESSION_KEY);
      return activeSession as Session | undefined;
    } catch (error) {
      console.warn('Failed to get active session from storage:', error);
      return undefined;
    }
  }
}
