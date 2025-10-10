import { promises as fs } from 'fs';
import { resolve, join, dirname } from 'path';
import type { Session } from '../types/session';

/**
 * FileManager provides simplified file operations and JSON storage.
 * Combines file operations with basic storage functionality for MVP.
 */
export class FileManager {
  private readonly baseDir: string;
  private readonly storagePath: string;
  private readonly sessionHistoryPath: string;

  constructor(appDataPath: string) {
    this.baseDir = resolve(appDataPath);
    this.storagePath = join(appDataPath, 'storage.json');
    this.sessionHistoryPath = join(appDataPath, 'session-history.json');
  }

  /**
   * Read a file from the base directory
   */
  async readFile(filePath: string): Promise<string> {
    const fullPath = this.resolvePath(filePath);
    return await fs.readFile(fullPath, 'utf8');
  }

  /**
   * Write content to a file in the base directory
   */
  async writeFile(filePath: string, content: string): Promise<void> {
    const fullPath = this.resolvePath(filePath);
    return await fs.writeFile(fullPath, content, 'utf8');
  }

  /**
   * Check if a file exists
   */
  async fileExists(filePath: string): Promise<boolean> {
    const fullPath = this.resolvePath(filePath);
    try {
      await fs.access(fullPath, fs.constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Ensure a directory exists, creating it if necessary
   */
  async ensureDirectory(dirPath: string): Promise<void> {
    const fullPath = this.resolvePath(dirPath);
    try {
      await fs.mkdir(fullPath, { recursive: true });
    } catch (error) {
      // If directory already exists, that's fine
      if ((error as NodeJS.ErrnoException)?.code !== 'EEXIST') {
        throw error;
      }
    }
  }

  /**
   * Autosave content to a file
   */
  async autosave(filePath: string, content: string): Promise<void> {
    try {
      await this.writeFile(filePath, content);
    } catch (error) {
      console.warn('Autosave failed:', error);
      // Don't throw - autosave failures shouldn't crash the app
    }
  }

  /**
   * Storage operations - simplified JSON key-value store
   */

  /**
   * Set a value in the storage
   */
  async set(key: string, value: unknown): Promise<void> {
    try {
      // Ensure the app data directory exists
      await fs.mkdir(dirname(this.storagePath), { recursive: true });

      // Read existing data
      let data: Record<string, unknown> = {};
      try {
        const content = await fs.readFile(this.storagePath, 'utf8');
        data = JSON.parse(content);
      } catch (error) {
        // If file doesn't exist or is corrupted, start with empty object
        if ((error as NodeJS.ErrnoException)?.code !== 'ENOENT') {
          console.warn('Storage file corrupted, starting fresh:', error);
        }
      }

      // Update the data
      data[key] = value;

      // Write back to file
      await fs.writeFile(this.storagePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
      throw new Error(`Failed to set storage value for key "${key}": ${error}`);
    }
  }

  /**
   * Get a value from the storage
   */
  async get(key: string): Promise<unknown> {
    try {
      const content = await fs.readFile(this.storagePath, 'utf8');
      const data = JSON.parse(content);
      return data[key];
    } catch (error) {
      // If file doesn't exist or is corrupted, return undefined
      if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') {
        return undefined;
      }
      
      if (error instanceof SyntaxError) {
        console.warn('Storage file corrupted, returning undefined for key:', key);
        return undefined;
      }

      throw new Error(`Failed to get storage value for key "${key}": ${error}`);
    }
  }

  /**
   * Remove a key from the storage
   */
  async remove(key: string): Promise<void> {
    try {
      // Read existing data
      let data: Record<string, unknown> = {};
      try {
        const content = await fs.readFile(this.storagePath, 'utf8');
        data = JSON.parse(content);
      } catch (error) {
        // If file doesn't exist or is corrupted, nothing to remove
        if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') {
          return;
        }
        if (error instanceof SyntaxError) {
          console.warn('Storage file corrupted, nothing to remove for key:', key);
          return;
        }
        throw error;
      }

      // Remove the key
      delete data[key];

      // Write back to file
      await fs.writeFile(this.storagePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
      throw new Error(`Failed to remove storage value for key "${key}": ${error}`);
    }
  }

  /**
   * Clear all data from the storage
   */
  async clear(): Promise<void> {
    try {
      // Ensure the app data directory exists
      await fs.mkdir(dirname(this.storagePath), { recursive: true });

      // Write empty object to file
      await fs.writeFile(this.storagePath, JSON.stringify({}, null, 2), 'utf8');
    } catch (error) {
      throw new Error(`Failed to clear storage: ${error}`);
    }
  }

  /**
   * Resolve a relative path to an absolute path within the base directory
   * This prevents directory traversal attacks
   */
  private resolvePath(filePath: string): string {
    // Normalize the path and resolve it relative to base directory
    const resolvedPath = resolve(this.baseDir, filePath);
    
    // Ensure the resolved path is within the base directory
    if (!resolvedPath.startsWith(this.baseDir)) {
      throw new Error(`Path traversal detected: ${filePath}`);
    }
    
    return resolvedPath;
  }

  /**
   * Get the base directory path
   */
  getBaseDirectory(): string {
    return this.baseDir;
  }

  /**
   * Get the storage file path
   */
  getStoragePath(): string {
    return this.storagePath;
  }

  /**
   * Append a session to the session history file
   */
  async appendSessionHistory(session: Session): Promise<void> {
    try {
      // Ensure the app data directory exists
      await fs.mkdir(dirname(this.sessionHistoryPath), { recursive: true });

      // Read existing session history
      let sessionHistory: Session[] = [];
      try {
        const content = await fs.readFile(this.sessionHistoryPath, 'utf8');
        sessionHistory = JSON.parse(content);
        if (!Array.isArray(sessionHistory)) {
          sessionHistory = [];
        }
      } catch (error) {
        // If file doesn't exist or is corrupted, start with empty array
        if ((error as NodeJS.ErrnoException)?.code !== 'ENOENT') {
          console.warn('Session history file corrupted, starting fresh:', error);
        }
      }

      // Append the new session to the beginning of the array
      sessionHistory.unshift(session);

      // Write back to file
      await fs.writeFile(this.sessionHistoryPath, JSON.stringify(sessionHistory, null, 2), 'utf8');
    } catch (error) {
      throw new Error(`Failed to append session to history: ${error}`);
    }
  }

  /**
   * Get the session history file path
   */
  getSessionHistoryPath(): string {
    return this.sessionHistoryPath;
  }

  /**
   * Get the most recently ended session from history
   */
  async getLastEndedSession(): Promise<Session | null> {
    try {
      const content = await fs.readFile(this.sessionHistoryPath, 'utf8');
      const sessionHistory: Session[] = JSON.parse(content);
      if (!Array.isArray(sessionHistory) || sessionHistory.length === 0) {
        return null;
      }
      // Return the first session (most recent)
      return sessionHistory[0];
    } catch (error) {
      // If file doesn't exist, return null
      if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') {
        return null;
      }
      throw new Error(`Failed to get last ended session: ${error}`);
    }
  }
}
