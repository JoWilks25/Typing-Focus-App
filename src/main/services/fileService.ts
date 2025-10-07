import { promises as fs } from 'fs';
import { resolve } from 'path';

/**
 * FileService provides safe file operations within a designated base directory.
 * All file operations are scoped to the base directory to prevent directory traversal attacks.
 */
export class FileService {
  private readonly baseDir: string;

  constructor(baseDir: string) {
    this.baseDir = resolve(baseDir);
  }

  /**
   * Read a file from the base directory
   * @param filePath - Relative path from base directory
   * @returns Promise<string> - File content as UTF-8 string
   */
  async readFile(filePath: string): Promise<string> {
    const fullPath = this.resolvePath(filePath);
    return await fs.readFile(fullPath, 'utf8');
  }

  /**
   * Write content to a file in the base directory
   * @param filePath - Relative path from base directory
   * @param content - Content to write as UTF-8 string
   */
  async writeFile(filePath: string, content: string): Promise<void> {
    const fullPath = this.resolvePath(filePath);
    return await fs.writeFile(fullPath, content, 'utf8');
  }

  /**
   * List files and directories in a directory
   * @param dirPath - Relative path from base directory
   * @returns Promise<string[]> - Array of file/directory names
   */
  async listFiles(dirPath: string): Promise<string[]> {
    const fullPath = this.resolvePath(dirPath);
    return await fs.readdir(fullPath);
  }

  /**
   * Check if a file or directory exists
   * @param filePath - Relative path from base directory
   * @returns Promise<boolean> - True if file exists, false otherwise
   */
  async fileExists(filePath: string): Promise<boolean> {
    const fullPath = this.resolvePath(filePath);
    try {
      await fs.access(fullPath, fs.constants.F_OK);
      return true;
    } catch (_error) { // eslint-disable-line @typescript-eslint/no-unused-vars
      return false;
    }
  }

  /**
   * Ensure a directory exists, creating it if necessary
   * @param dirPath - Relative path from base directory
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
   * Resolve a relative path to an absolute path within the base directory
   * This prevents directory traversal attacks by ensuring all paths stay within baseDir
   * @param filePath - Relative path from base directory
   * @returns string - Absolute path
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
   * @returns string - The base directory path
   */
  getBaseDirectory(): string {
    return this.baseDir;
  }
}