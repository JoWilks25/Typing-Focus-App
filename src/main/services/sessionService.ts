import { v4 as uuidv4 } from 'uuid';

export interface Session {
  id: string;
  name: string;
  startTime: number;
  endTime?: number;
  status: 'active' | 'stopped';
}

/**
 * SessionService provides in-memory session management.
 * Sessions are stored in memory and can be started, stopped, retrieved, and listed.
 */
export class SessionService {
  private sessions: Map<string, Session> = new Map();

  /**
   * Start a new session
   * @param name - Optional name for the session
   * @returns The created session
   */
  startSession(name?: string): Session {
    const sessionId = uuidv4();
    const session: Session = {
      id: sessionId,
      name: name || `Session ${new Date().toLocaleString()}`,
      startTime: Date.now(),
      status: 'active'
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  /**
   * Stop an active session
   * @param sessionId - The ID of the session to stop
   * @returns The updated session
   */
  stopSession(sessionId: string): Session {
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
      status: 'stopped'
    };

    this.sessions.set(sessionId, updatedSession);
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
}
