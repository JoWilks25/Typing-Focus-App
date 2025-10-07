import { describe, it, expect, beforeEach, vi } from 'vitest';
import { contextBridge, ipcRenderer } from 'electron';

// Mock electron modules
vi.mock('electron', () => ({
  contextBridge: {
    exposeInMainWorld: vi.fn()
  },
  ipcRenderer: {
    invoke: vi.fn()
  }
}));

// Mock process.contextIsolated
Object.defineProperty(process, 'contextIsolated', {
  value: true,
  writable: true
});

describe('Preload API', () => {
  let exposedAPI: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Import the preload module to trigger the API setup
    await import('../../src/preload/index');
    
    // Get the exposed API from the first call
    const calls = vi.mocked(contextBridge.exposeInMainWorld).mock.calls;
    if (calls.length > 0) {
      exposedAPI = calls[0][1];
    }
  });

  describe('API Exposure', () => {
    it('should expose contextBridge.exposeInMainWorld with correct API structure', () => {
      expect(contextBridge.exposeInMainWorld).toHaveBeenCalledWith('api', expect.any(Object));
      expect(contextBridge.exposeInMainWorld).toHaveBeenCalledWith('electronAPI', expect.any(Object));
      expect(exposedAPI).toBeDefined();
      expect(exposedAPI.file).toBeDefined();
      expect(exposedAPI.storage).toBeDefined();
      expect(exposedAPI.session).toBeDefined();
      expect(exposedAPI.focus).toBeDefined();
      expect(exposedAPI.activity).toBeDefined();
      expect(exposedAPI.process).toBeDefined();
    });

    it('should expose process.versions', () => {
      expect(exposedAPI.process.versions).toBeDefined();
      expect(typeof exposedAPI.process.versions).toBe('object');
    });
  });

  describe('File API', () => {
    it('should call file.read with correct channel and args', async () => {
      const mockResponse = { success: true, data: { content: 'Hello, World!' } };
      vi.mocked(ipcRenderer.invoke).mockResolvedValue(mockResponse);
      
      const result = await exposedAPI.file.read({ path: 'test.txt' });
      
      expect(ipcRenderer.invoke).toHaveBeenCalledWith('file:read', { path: 'test.txt' });
      expect(result).toEqual(mockResponse);
    });

    it('should call file.write with correct channel and args', async () => {
      const mockResponse = { success: true, data: { success: true } };
      vi.mocked(ipcRenderer.invoke).mockResolvedValue(mockResponse);
      
      const result = await exposedAPI.file.write({ 
        path: 'test.txt', 
        content: 'Hello, World!' 
      });
      
      expect(ipcRenderer.invoke).toHaveBeenCalledWith('file:write', { 
        path: 'test.txt', 
        content: 'Hello, World!' 
      });
      expect(result).toEqual(mockResponse);
    });

    it('should call file.list with correct channel and args', async () => {
      const mockResponse = { success: true, data: { files: ['file1.txt', 'file2.txt'] } };
      vi.mocked(ipcRenderer.invoke).mockResolvedValue(mockResponse);
      
      const result = await exposedAPI.file.list({ path: 'test-dir' });
      
      expect(ipcRenderer.invoke).toHaveBeenCalledWith('file:list', { path: 'test-dir' });
      expect(result).toEqual(mockResponse);
    });

    it('should call file.exists with correct channel and args', async () => {
      const mockResponse = { success: true, data: { exists: true } };
      vi.mocked(ipcRenderer.invoke).mockResolvedValue(mockResponse);
      
      const result = await exposedAPI.file.exists({ path: 'test.txt' });
      
      expect(ipcRenderer.invoke).toHaveBeenCalledWith('file:exists', { path: 'test.txt' });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Storage API', () => {
    it('should call storage.get with correct channel and args', async () => {
      const mockResponse = { success: true, data: { value: 'test-value' } };
      vi.mocked(ipcRenderer.invoke).mockResolvedValue(mockResponse);
      
      const result = await exposedAPI.storage.get({ key: 'test-key' });
      
      expect(ipcRenderer.invoke).toHaveBeenCalledWith('storage:get', { key: 'test-key' });
      expect(result).toEqual(mockResponse);
    });

    it('should call storage.set with correct channel and args', async () => {
      const mockResponse = { success: true, data: { success: true } };
      vi.mocked(ipcRenderer.invoke).mockResolvedValue(mockResponse);
      
      const result = await exposedAPI.storage.set({ key: 'test-key', value: 'test-value' });
      
      expect(ipcRenderer.invoke).toHaveBeenCalledWith('storage:set', { key: 'test-key', value: 'test-value' });
      expect(result).toEqual(mockResponse);
    });

    it('should call storage.remove with correct channel and args', async () => {
      const mockResponse = { success: true, data: { success: true } };
      vi.mocked(ipcRenderer.invoke).mockResolvedValue(mockResponse);
      
      const result = await exposedAPI.storage.remove({ key: 'test-key' });
      
      expect(ipcRenderer.invoke).toHaveBeenCalledWith('storage:remove', { key: 'test-key' });
      expect(result).toEqual(mockResponse);
    });

    it('should call storage.clear with correct channel and no args', async () => {
      const mockResponse = { success: true, data: { success: true } };
      vi.mocked(ipcRenderer.invoke).mockResolvedValue(mockResponse);
      
      const result = await exposedAPI.storage.clear();
      
      expect(ipcRenderer.invoke).toHaveBeenCalledWith('storage:clear');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Session API', () => {
    it('should call session.start with correct channel and args', async () => {
      const mockResponse = { success: true, data: { sessionId: 'session-123' } };
      vi.mocked(ipcRenderer.invoke).mockResolvedValue(mockResponse);
      
      const result = await exposedAPI.session.start({ name: 'Test Session' });
      
      expect(ipcRenderer.invoke).toHaveBeenCalledWith('session:start', { name: 'Test Session' });
      expect(result).toEqual(mockResponse);
    });

    it('should call session.stop with correct channel and args', async () => {
      const mockResponse = { success: true, data: { success: true } };
      vi.mocked(ipcRenderer.invoke).mockResolvedValue(mockResponse);
      
      const result = await exposedAPI.session.stop({ sessionId: 'session-123' });
      
      expect(ipcRenderer.invoke).toHaveBeenCalledWith('session:stop', { sessionId: 'session-123' });
      expect(result).toEqual(mockResponse);
    });

    it('should call session.get with correct channel and args', async () => {
      const mockResponse = { 
        success: true, 
        data: { 
          session: { 
            id: 'session-123', 
            name: 'Test Session', 
            startTime: Date.now(), 
            status: 'active' 
          } 
        } 
      };
      vi.mocked(ipcRenderer.invoke).mockResolvedValue(mockResponse);
      
      const result = await exposedAPI.session.get({ sessionId: 'session-123' });
      
      expect(ipcRenderer.invoke).toHaveBeenCalledWith('session:get', { sessionId: 'session-123' });
      expect(result).toEqual(mockResponse);
    });

    it('should call session.list with correct channel and no args', async () => {
      const mockResponse = { 
        success: true, 
        data: { 
          sessions: [
            { id: 'session-1', name: 'Session 1', startTime: Date.now(), status: 'active' }
          ] 
        } 
      };
      vi.mocked(ipcRenderer.invoke).mockResolvedValue(mockResponse);
      
      const result = await exposedAPI.session.list();
      
      expect(ipcRenderer.invoke).toHaveBeenCalledWith('session:list');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Focus API', () => {
    it('should call focus.start with correct channel and args', async () => {
      const mockResponse = { success: true, data: { success: true } };
      vi.mocked(ipcRenderer.invoke).mockResolvedValue(mockResponse);
      
      const result = await exposedAPI.focus.start({ sessionId: 'session-123' });
      
      expect(ipcRenderer.invoke).toHaveBeenCalledWith('focus:start', { sessionId: 'session-123' });
      expect(result).toEqual(mockResponse);
    });

    it('should call focus.stop with correct channel and args', async () => {
      const mockResponse = { success: true, data: { success: true } };
      vi.mocked(ipcRenderer.invoke).mockResolvedValue(mockResponse);
      
      const result = await exposedAPI.focus.stop({ sessionId: 'session-123' });
      
      expect(ipcRenderer.invoke).toHaveBeenCalledWith('focus:stop', { sessionId: 'session-123' });
      expect(result).toEqual(mockResponse);
    });

    it('should call focus.status with correct channel and args', async () => {
      const mockResponse = { 
        success: true, 
        data: { 
          isActive: true, 
          startTime: Date.now() 
        } 
      };
      vi.mocked(ipcRenderer.invoke).mockResolvedValue(mockResponse);
      
      const result = await exposedAPI.focus.status({ sessionId: 'session-123' });
      
      expect(ipcRenderer.invoke).toHaveBeenCalledWith('focus:status', { sessionId: 'session-123' });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Activity API', () => {
    it('should call activity.record with correct channel and args', async () => {
      const mockResponse = { success: true, data: { success: true } };
      vi.mocked(ipcRenderer.invoke).mockResolvedValue(mockResponse);
      
      const result = await exposedAPI.activity.record({
        sessionId: 'session-123',
        activity: {
          type: 'typing',
          timestamp: Date.now(),
          data: { keystroke: 'a' }
        }
      });
      
      expect(ipcRenderer.invoke).toHaveBeenCalledWith('activity:record', {
        sessionId: 'session-123',
        activity: {
          type: 'typing',
          timestamp: expect.any(Number),
          data: { keystroke: 'a' }
        }
      });
      expect(result).toEqual(mockResponse);
    });

    it('should call activity.stats with correct channel and args', async () => {
      const mockResponse = { 
        success: true, 
        data: { 
          stats: {
            totalTypingTime: 1000,
            totalPauseTime: 500,
            keystrokes: 10,
            wordsPerMinute: 60
          }
        } 
      };
      vi.mocked(ipcRenderer.invoke).mockResolvedValue(mockResponse);
      
      const result = await exposedAPI.activity.stats({ sessionId: 'session-123' });
      
      expect(ipcRenderer.invoke).toHaveBeenCalledWith('activity:stats', { sessionId: 'session-123' });
      expect(result).toEqual(mockResponse);
    });

    it('should call activity.reset with correct channel and args', async () => {
      const mockResponse = { success: true, data: { success: true } };
      vi.mocked(ipcRenderer.invoke).mockResolvedValue(mockResponse);
      
      const result = await exposedAPI.activity.reset({ sessionId: 'session-123' });
      
      expect(ipcRenderer.invoke).toHaveBeenCalledWith('activity:reset', { sessionId: 'session-123' });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Error Handling', () => {
    it('should bubble structured errors from file operations', async () => {
      const mockError = {
        success: false,
        error: {
          code: 'FILE_NOT_FOUND',
          message: 'File not found',
          details: { path: 'missing.txt' }
        }
      };
      vi.mocked(ipcRenderer.invoke).mockResolvedValue(mockError);
      
      const result = await exposedAPI.file.read({ path: 'missing.txt' });
      
      expect(result).toEqual(mockError);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('FILE_NOT_FOUND');
    });

    it('should bubble structured errors from storage operations', async () => {
      const mockError = {
        success: false,
        error: {
          code: 'STORAGE_READ_ERROR',
          message: 'Storage read failed',
          details: { key: 'invalid-key' }
        }
      };
      vi.mocked(ipcRenderer.invoke).mockResolvedValue(mockError);
      
      const result = await exposedAPI.storage.get({ key: 'invalid-key' });
      
      expect(result).toEqual(mockError);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('STORAGE_READ_ERROR');
    });

    it('should bubble structured errors from session operations', async () => {
      const mockError = {
        success: false,
        error: {
          code: 'SESSION_NOT_FOUND',
          message: 'Session not found',
          details: { sessionId: 'invalid-session' }
        }
      };
      vi.mocked(ipcRenderer.invoke).mockResolvedValue(mockError);
      
      const result = await exposedAPI.session.get({ sessionId: 'invalid-session' });
      
      expect(result).toEqual(mockError);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('SESSION_NOT_FOUND');
    });

    it('should bubble structured errors from focus operations', async () => {
      const mockError = {
        success: false,
        error: {
          code: 'FOCUS_ALREADY_ACTIVE',
          message: 'Focus is already active',
          details: { sessionId: 'session-123' }
        }
      };
      vi.mocked(ipcRenderer.invoke).mockResolvedValue(mockError);
      
      const result = await exposedAPI.focus.start({ sessionId: 'session-123' });
      
      expect(result).toEqual(mockError);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('FOCUS_ALREADY_ACTIVE');
    });

    it('should bubble structured errors from activity operations', async () => {
      const mockError = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Session ID is required',
          details: { sessionId: '' }
        }
      };
      vi.mocked(ipcRenderer.invoke).mockResolvedValue(mockError);
      
      const result = await exposedAPI.activity.record({
        sessionId: '',
        activity: {
          type: 'typing',
          timestamp: Date.now()
        }
      });
      
      expect(result).toEqual(mockError);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Legacy API', () => {
    it('should expose legacy API methods for backward compatibility', () => {
      expect(exposedAPI.saveSession).toBeDefined();
      expect(exposedAPI.loadSession).toBeDefined();
      expect(exposedAPI.deleteSession).toBeDefined();
      expect(exposedAPI.listSessions).toBeDefined();
      expect(exposedAPI.saveFile).toBeDefined();
      expect(exposedAPI.loadFile).toBeDefined();
    });

    it('should return deprecation messages for legacy methods', async () => {
      const result = await exposedAPI.saveSession({ id: 'test' });
      
      expect(result).toEqual({ 
        success: false, 
        message: 'Use session API instead' 
      });
    });
  });

  describe('Non-context-isolated Environment', () => {
    it('should set window.api directly when contextIsolated is false', async () => {
      vi.clearAllMocks();
      
      // Mock non-context-isolated environment
      Object.defineProperty(process, 'contextIsolated', {
        value: false,
        writable: true
      });
      
      // Mock window object
      global.window = {} as any;
      
      // Clear module cache and re-import to test non-context-isolated path
      vi.resetModules();
      await import('../../src/preload/index');
      
      expect(global.window.api).toBeDefined();
      expect(global.window.electronAPI).toBeDefined();
    });
  });
});
