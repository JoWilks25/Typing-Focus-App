import { promises as fs } from 'fs';
import { join, dirname } from 'path';

/**
 * StorageService provides a JSON-backed key-value store in the user data directory.
 * All data is persisted to a single JSON file (storage.json) in the app data directory.
 */
export class StorageService {
  private readonly storagePath: string;

  constructor(appDataPath: string) {
    this.storagePath = join(appDataPath, 'storage.json');
  }

  /**
   * Set a value in the storage
   * @param key - The key to store the value under
   * @param value - The value to store (will be JSON serialized)
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
          // For other errors (like JSON parse errors), log but continue with empty object
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
   * @param key - The key to retrieve
   * @returns The stored value, or undefined if key doesn't exist
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
      
      // For JSON parse errors, return undefined (graceful handling)
      if (error instanceof SyntaxError) {
        console.warn('Storage file corrupted, returning undefined for key:', key);
        return undefined;
      }

      // For other errors, re-throw
      throw new Error(`Failed to get storage value for key "${key}": ${error}`);
    }
  }

  /**
   * Remove a key from the storage
   * @param key - The key to remove
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
   * Get the storage file path
   * @returns The path to the storage file
   */
  getStoragePath(): string {
    return this.storagePath;
  }
}
