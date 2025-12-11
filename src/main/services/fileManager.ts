import { promises as fs } from 'fs';
import { join, extname } from 'path';
import type { EditorJson } from '@shared/tiptapTypes';

class FileManager {
  /**
   * Write content to a file
   */
  async writeFile(filePath: string, content: string): Promise<void> {
    try {
      // Ensure directory exists
      const dir = join(filePath, '..');
      await fs.mkdir(dir, { recursive: true });

      // Write file
      await fs.writeFile(filePath, content, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to write file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Write content to a TipTap JSON content file.
   */
  async writeJsonFile(filePath: string, content: EditorJson): Promise<void> {
    try {
      // Ensure the on-disk file has a .json extension, even if caller
      // passed a path without one (e.g. ".../My session")
      const targetPath = extname(filePath) ? filePath : `${filePath}.dt.json`;

      const dir = join(targetPath, '..');
      await fs.mkdir(dir, { recursive: true });

      const json = JSON.stringify(content, null, 2);
      await fs.writeFile(targetPath, json, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to write file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Read content from a file
   */
  async readFile(filePath: string): Promise<string> {
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Read a file as a binary buffer (e.g., for DOCX imports)
   */
  async readFileBinary(filePath: string): Promise<Buffer> {
    try {
      return await fs.readFile(filePath);
    } catch (error) {
      throw new Error(`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if a file exists
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

export const fileManager = new FileManager();