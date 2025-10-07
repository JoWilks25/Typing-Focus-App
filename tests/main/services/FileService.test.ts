import { describe, it, expect } from 'vitest';
import { FileService } from '../../../src/main/services/fileService';

describe('FileService - Core Functionality', () => {
  describe('constructor', () => {
    it('should initialize with base directory', () => {
      const service = new FileService('/test/path');
      expect(service).toBeDefined();
      expect(service.getBaseDirectory()).toBe('/test/path');
    });
  });

  describe('path resolution', () => {
    it('should resolve paths relative to base directory', () => {
      const service = new FileService('/tmp/test');
      const filePath = 'subdir/file.txt';
      
      // Access private method for testing (using any to bypass TypeScript)
      const resolvedPath = (service as any).resolvePath(filePath);
      
      expect(resolvedPath).toBe('/tmp/test/subdir/file.txt');
    });

    it('should prevent directory traversal attacks', () => {
      const service = new FileService('/tmp/test');
      const maliciousPath = '../../../etc/passwd';
      
      // Access private method for testing (using any to bypass TypeScript)
      expect(() => {
        (service as any).resolvePath(maliciousPath);
      }).toThrow('Path traversal detected: ../../../etc/passwd');
    });

    it('should handle nested directory traversal attempts', () => {
      const service = new FileService('/tmp/test');
      const maliciousPath = 'subdir/../../../etc/passwd';
      
      // Access private method for testing (using any to bypass TypeScript)
      expect(() => {
        (service as any).resolvePath(maliciousPath);
      }).toThrow('Path traversal detected: subdir/../../../etc/passwd');
    });
  });
});
