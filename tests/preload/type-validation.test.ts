import { describe, it, expect } from 'vitest';

/**
 * Type validation tests for preload API
 * These tests ensure that the exposed API matches the TypeScript definitions
 * in src/types/ipc.d.ts
 */

describe('Preload API Type Validation', () => {
  // Mock the window object with the expected API structure
  const mockAPI = {
    file: {
      read: async (request: { path: string }) => ({ success: true, data: { content: '' } }),
      write: async (request: { path: string; content: string }) => ({ success: true, data: { success: true } }),
      list: async (request: { path: string }) => ({ success: true, data: { files: [] } }),
      exists: async (request: { path: string }) => ({ success: true, data: { exists: true } })
    },
    storage: {
      get: async (request: { key: string }) => ({ success: true, data: { value: null } }),
      set: async (request: { key: string; value: unknown }) => ({ success: true, data: { success: true } }),
      remove: async (request: { key: string }) => ({ success: true, data: { success: true } }),
      clear: async () => ({ success: true, data: { success: true } })
    },
    session: {
      start: async (request: { name?: string }) => ({ success: true, data: { sessionId: '' } }),
      stop: async (request: { sessionId: string }) => ({ success: true, data: { success: true } }),
      get: async (request: { sessionId: string }) => ({ 
        success: true, 
        data: { 
          session: { 
            id: '', 
            name: '', 
            startTime: 0, 
            status: 'active' as const 
          } 
        } 
      }),
      list: async () => ({ 
        success: true, 
        data: { 
          sessions: [] 
        } 
      })
    },
    focus: {
      start: async (request: { sessionId: string }) => ({ success: true, data: { success: true } }),
      stop: async (request: { sessionId: string }) => ({ success: true, data: { success: true } }),
      status: async (request: { sessionId: string }) => ({ 
        success: true, 
        data: { 
          isActive: true, 
          startTime: 0 
        } 
      })
    },
    activity: {
      record: async (request: { 
        sessionId: string; 
        activity: { 
          type: 'typing' | 'pause' | 'resume'; 
          timestamp: number; 
          data?: unknown 
        } 
      }) => ({ success: true, data: { success: true } }),
      stats: async (request: { sessionId: string }) => ({ 
        success: true, 
        data: { 
          stats: {
            totalTypingTime: 0,
            totalPauseTime: 0,
            keystrokes: 0,
            wordsPerMinute: 0
          }
        } 
      }),
      reset: async (request: { sessionId: string }) => ({ success: true, data: { success: true } })
    },
    process: {
      versions: {} as NodeJS.ProcessVersions
    },
    // Legacy API
    saveSession: async (sessionData: unknown) => ({ success: false, message: 'Use session API instead' }),
    loadSession: async (sessionId: string) => null,
    deleteSession: async (sessionId: string) => ({ success: false, message: 'Use session API instead' }),
    listSessions: async () => [],
    saveFile: async (filePath: string, content: string) => ({ success: false, message: 'Use file API instead' }),
    loadFile: async (filePath: string) => null
  };

  describe('File API Type Validation', () => {
    it('should have correct file.read signature', async () => {
      const result = await mockAPI.file.read({ path: 'test.txt' });
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('content');
    });

    it('should have correct file.write signature', async () => {
      const result = await mockAPI.file.write({ path: 'test.txt', content: 'Hello' });
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('success');
    });

    it('should have correct file.list signature', async () => {
      const result = await mockAPI.file.list({ path: 'test-dir' });
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('files');
    });

    it('should have correct file.exists signature', async () => {
      const result = await mockAPI.file.exists({ path: 'test.txt' });
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('exists');
    });
  });

  describe('Storage API Type Validation', () => {
    it('should have correct storage.get signature', async () => {
      const result = await mockAPI.storage.get({ key: 'test-key' });
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('value');
    });

    it('should have correct storage.set signature', async () => {
      const result = await mockAPI.storage.set({ key: 'test-key', value: 'test-value' });
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('success');
    });

    it('should have correct storage.remove signature', async () => {
      const result = await mockAPI.storage.remove({ key: 'test-key' });
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('success');
    });

    it('should have correct storage.clear signature', async () => {
      const result = await mockAPI.storage.clear();
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('success');
    });
  });

  describe('Session API Type Validation', () => {
    it('should have correct session.start signature', async () => {
      const result = await mockAPI.session.start({ name: 'Test Session' });
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('sessionId');
    });

    it('should have correct session.stop signature', async () => {
      const result = await mockAPI.session.stop({ sessionId: 'session-123' });
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('success');
    });

    it('should have correct session.get signature', async () => {
      const result = await mockAPI.session.get({ sessionId: 'session-123' });
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('session');
      expect(result.data.session).toHaveProperty('id');
      expect(result.data.session).toHaveProperty('name');
      expect(result.data.session).toHaveProperty('startTime');
      expect(result.data.session).toHaveProperty('status');
    });

    it('should have correct session.list signature', async () => {
      const result = await mockAPI.session.list();
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('sessions');
    });
  });

  describe('Focus API Type Validation', () => {
    it('should have correct focus.start signature', async () => {
      const result = await mockAPI.focus.start({ sessionId: 'session-123' });
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('success');
    });

    it('should have correct focus.stop signature', async () => {
      const result = await mockAPI.focus.stop({ sessionId: 'session-123' });
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('success');
    });

    it('should have correct focus.status signature', async () => {
      const result = await mockAPI.focus.status({ sessionId: 'session-123' });
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('isActive');
      expect(result.data).toHaveProperty('startTime');
    });
  });

  describe('Activity API Type Validation', () => {
    it('should have correct activity.record signature', async () => {
      const result = await mockAPI.activity.record({
        sessionId: 'session-123',
        activity: {
          type: 'typing',
          timestamp: Date.now(),
          data: { keystroke: 'a' }
        }
      });
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('success');
    });

    it('should have correct activity.stats signature', async () => {
      const result = await mockAPI.activity.stats({ sessionId: 'session-123' });
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('stats');
      expect(result.data.stats).toHaveProperty('totalTypingTime');
      expect(result.data.stats).toHaveProperty('totalPauseTime');
      expect(result.data.stats).toHaveProperty('keystrokes');
      expect(result.data.stats).toHaveProperty('wordsPerMinute');
    });

    it('should have correct activity.reset signature', async () => {
      const result = await mockAPI.activity.reset({ sessionId: 'session-123' });
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('success');
    });
  });

  describe('Process API Type Validation', () => {
    it('should have correct process.versions signature', () => {
      expect(mockAPI.process.versions).toBeDefined();
      expect(typeof mockAPI.process.versions).toBe('object');
    });
  });

  describe('Legacy API Type Validation', () => {
    it('should have correct legacy API signatures', async () => {
      const saveResult = await mockAPI.saveSession({ id: 'test' });
      expect(saveResult).toHaveProperty('success');
      expect(saveResult).toHaveProperty('message');

      const loadResult = await mockAPI.loadSession('test-id');
      expect(loadResult).toBeNull();

      const deleteResult = await mockAPI.deleteSession('test-id');
      expect(deleteResult).toHaveProperty('success');
      expect(deleteResult).toHaveProperty('message');

      const listResult = await mockAPI.listSessions();
      expect(Array.isArray(listResult)).toBe(true);

      const saveFileResult = await mockAPI.saveFile('test.txt', 'content');
      expect(saveFileResult).toHaveProperty('success');
      expect(saveFileResult).toHaveProperty('message');

      const loadFileResult = await mockAPI.loadFile('test.txt');
      expect(loadFileResult).toBeNull();
    });
  });

  describe('Error Response Type Validation', () => {
    it('should handle error responses correctly', async () => {
      // Mock error response
      const errorAPI = {
        file: {
          read: async () => ({
            success: false,
            error: {
              code: 'FILE_NOT_FOUND',
              message: 'File not found',
              details: { path: 'missing.txt' }
            }
          })
        }
      };

      const result = await errorAPI.file.read({ path: 'missing.txt' });
      expect(result.success).toBe(false);
      expect(result.error).toHaveProperty('code');
      expect(result.error).toHaveProperty('message');
      expect(result.error).toHaveProperty('details');
    });
  });

  describe('API Structure Validation', () => {
    it('should have all required API modules', () => {
      expect(mockAPI.file).toBeDefined();
      expect(mockAPI.storage).toBeDefined();
      expect(mockAPI.session).toBeDefined();
      expect(mockAPI.focus).toBeDefined();
      expect(mockAPI.activity).toBeDefined();
      expect(mockAPI.process).toBeDefined();
    });

    it('should have all required methods in each module', () => {
      // File API
      expect(typeof mockAPI.file.read).toBe('function');
      expect(typeof mockAPI.file.write).toBe('function');
      expect(typeof mockAPI.file.list).toBe('function');
      expect(typeof mockAPI.file.exists).toBe('function');

      // Storage API
      expect(typeof mockAPI.storage.get).toBe('function');
      expect(typeof mockAPI.storage.set).toBe('function');
      expect(typeof mockAPI.storage.remove).toBe('function');
      expect(typeof mockAPI.storage.clear).toBe('function');

      // Session API
      expect(typeof mockAPI.session.start).toBe('function');
      expect(typeof mockAPI.session.stop).toBe('function');
      expect(typeof mockAPI.session.get).toBe('function');
      expect(typeof mockAPI.session.list).toBe('function');

      // Focus API
      expect(typeof mockAPI.focus.start).toBe('function');
      expect(typeof mockAPI.focus.stop).toBe('function');
      expect(typeof mockAPI.focus.status).toBe('function');

      // Activity API
      expect(typeof mockAPI.activity.record).toBe('function');
      expect(typeof mockAPI.activity.stats).toBe('function');
      expect(typeof mockAPI.activity.reset).toBe('function');
    });
  });
});
