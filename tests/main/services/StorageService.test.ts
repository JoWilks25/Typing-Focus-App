import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { StorageService } from '../../../src/main/services/storageService';

describe('StorageService - Integration Tests', () => {
  let storageService: StorageService;
  let tempDir: string;

  beforeEach(async () => {
    // Create a temporary directory for each test
    tempDir = join(tmpdir(), `storage-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
    await fs.mkdir(tempDir, { recursive: true });
    storageService = new StorageService(tempDir);
  });

  afterEach(async () => {
    // Clean up temporary directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (_error) { // eslint-disable-line @typescript-eslint/no-unused-vars
      // Ignore cleanup errors
    }
  });

  describe('set/get roundtrip', () => {
    it('should store and retrieve a value', async () => {
      const key = 'test-key';
      const value = { message: 'hello world', count: 42 };

      // Set the value
      await storageService.set(key, value);

      // Get the value
      const result = await storageService.get(key);

      expect(result).toEqual(value);
    });

    it('should handle multiple keys', async () => {
      const key1 = 'key1';
      const value1 = 'value1';
      const key2 = 'key2';
      const value2 = { nested: true };

      // Set both values
      await storageService.set(key1, value1);
      await storageService.set(key2, value2);

      // Get both values
      const result1 = await storageService.get(key1);
      const result2 = await storageService.get(key2);

      expect(result1).toEqual(value1);
      expect(result2).toEqual(value2);
    });

    it('should return undefined for non-existent key', async () => {
      const result = await storageService.get('non-existent-key');
      expect(result).toBeUndefined();
    });
  });

  describe('remove', () => {
    it('should delete a key from storage', async () => {
      const key = 'to-remove';
      const value = 'will be removed';
      const otherKey = 'keep-this';
      const otherValue = 'keep this value';

      // Set both values
      await storageService.set(key, value);
      await storageService.set(otherKey, otherValue);

      // Remove the key
      await storageService.remove(key);

      // Verify key is removed
      const removedResult = await storageService.get(key);
      const keptResult = await storageService.get(otherKey);

      expect(removedResult).toBeUndefined();
      expect(keptResult).toEqual(otherValue);
    });

    it('should handle removing non-existent key gracefully', async () => {
      // Should not throw
      await expect(storageService.remove('non-existent')).resolves.not.toThrow();
    });
  });

  describe('clear', () => {
    it('should empty the entire store', async () => {
      // Set some values
      await storageService.set('key1', 'value1');
      await storageService.set('key2', 'value2');
      await storageService.set('key3', 'value3');

      // Clear the store
      await storageService.clear();

      // Verify all values are gone
      const result1 = await storageService.get('key1');
      const result2 = await storageService.get('key2');
      const result3 = await storageService.get('key3');

      expect(result1).toBeUndefined();
      expect(result2).toBeUndefined();
      expect(result3).toBeUndefined();
    });
  });

  describe('corrupted file handling', () => {
    it('should load gracefully when file is corrupted JSON', async () => {
      const storagePath = storageService.getStoragePath();
      
      // Write corrupted JSON to the storage file
      await fs.writeFile(storagePath, '{ invalid json }', 'utf8');

      // Should return undefined (graceful handling)
      const result = await storageService.get('any-key');
      expect(result).toBeUndefined();
    });

    it('should handle file read errors gracefully', async () => {
      // Should return undefined for non-existent file (graceful handling)
      const result = await storageService.get('any-key');
      expect(result).toBeUndefined();
    });

    it('should create directory if it does not exist', async () => {
      // Create a new service with a non-existent directory
      const newTempDir = join(tmpdir(), `storage-test-new-${Date.now()}`);
      const newStorageService = new StorageService(newTempDir);

      // This should not throw and should create the directory
      await expect(newStorageService.set('test-key', 'test-value')).resolves.not.toThrow();

      // Verify the directory was created
      const exists = await fs.access(newTempDir).then(() => true).catch(() => false);
      expect(exists).toBe(true);

      // Clean up
      await fs.rm(newTempDir, { recursive: true, force: true });
    });
  });

  describe('error handling', () => {
    it('should throw error when writeFile fails', async () => {
      // Create a service with a read-only directory
      const readOnlyDir = join(tmpdir(), `readonly-${Date.now()}`);
      await fs.mkdir(readOnlyDir, { recursive: true });
      
      // Make directory read-only (this might not work on all systems)
      try {
        await fs.chmod(readOnlyDir, 0o444);
        
        const readOnlyService = new StorageService(readOnlyDir);
        
        // This should throw an error
        await expect(readOnlyService.set('key', 'value')).rejects.toThrow();
      } finally {
        // Restore permissions and clean up
        try {
          await fs.chmod(readOnlyDir, 0o755);
          await fs.rm(readOnlyDir, { recursive: true, force: true });
        } catch (_error) { // eslint-disable-line @typescript-eslint/no-unused-vars
          // Ignore cleanup errors
        }
      }
    });
  });
});
