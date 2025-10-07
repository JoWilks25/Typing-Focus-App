import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StorageService } from '../../../src/main/services/storageService';
import { ipcMain } from 'electron';
import { 
  handleStorageGet, 
  handleStorageSet, 
  handleStorageRemove, 
  handleStorageClear,
  initializeStorageService,
  registerStorageHandlers,
  unregisterStorageHandlers
} from '../../../src/main/handlers/storageHandlers';
import { 
  StorageGetRequest, 
  StorageSetRequest, 
  StorageRemoveRequest,
  ERROR_CODES,
  IPC_CHANNELS
} from '../../../src/main/types/ipc';

// Mock StorageService
vi.mock('../../../src/main/services/storageService');

// Mock electron ipcMain
vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn(),
    removeAllListeners: vi.fn()
  }
}));

describe('Storage Handlers - TDD Tests', () => {
  let mockStorageService: any;

  beforeEach(() => {
    mockStorageService = {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
      clear: vi.fn(),
    };
    
    // Mock the StorageService constructor
    vi.mocked(StorageService).mockImplementation(() => mockStorageService);
    
    // Initialize the storage service for handlers
    initializeStorageService('/test/path');
  });

  describe('handleStorageGet', () => {
    it('should get a value successfully', async () => {
      const request: StorageGetRequest = { key: 'test-key' };
      const mockValue = 'test-value';
      
      mockStorageService.get.mockResolvedValue(mockValue);

      const result = await handleStorageGet(request);

      expect(mockStorageService.get).toHaveBeenCalledWith('test-key');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.value).toBe(mockValue);
      }
    });

    it('should return undefined for non-existent key', async () => {
      const request: StorageGetRequest = { key: 'non-existent' };
      
      mockStorageService.get.mockResolvedValue(undefined);

      const result = await handleStorageGet(request);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.value).toBeUndefined();
      }
    });

    it('should validate empty key', async () => {
      const request: StorageGetRequest = { key: '' };

      const result = await handleStorageGet(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
        expect(result.error.message).toContain('Key is required');
      }
    });

    it('should validate whitespace-only key', async () => {
      const request: StorageGetRequest = { key: '   ' };

      const result = await handleStorageGet(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
        expect(result.error.message).toContain('Key is required');
      }
    });

    it('should handle storage service errors', async () => {
      const request: StorageGetRequest = { key: 'test-key' };
      const error = new Error('Storage read failed');
      
      mockStorageService.get.mockRejectedValue(error);

      const result = await handleStorageGet(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ERROR_CODES.STORAGE_READ_ERROR);
        expect(result.error.message).toBe('Storage read failed');
      }
    });
  });

  describe('handleStorageSet', () => {
    it('should set a value successfully', async () => {
      const request: StorageSetRequest = { key: 'test-key', value: 'test-value' };
      
      mockStorageService.set.mockResolvedValue(undefined);

      const result = await handleStorageSet(request);

      expect(mockStorageService.set).toHaveBeenCalledWith('test-key', 'test-value');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.success).toBe(true);
      }
    });

    it('should set complex objects', async () => {
      const request: StorageSetRequest = { 
        key: 'complex-key', 
        value: { nested: { data: [1, 2, 3] } } 
      };
      
      mockStorageService.set.mockResolvedValue(undefined);

      const result = await handleStorageSet(request);

      expect(mockStorageService.set).toHaveBeenCalledWith('complex-key', { nested: { data: [1, 2, 3] } });
      expect(result.success).toBe(true);
    });

    it('should validate empty key', async () => {
      const request: StorageSetRequest = { key: '', value: 'test' };

      const result = await handleStorageSet(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
        expect(result.error.message).toContain('Key is required');
      }
    });

    it('should validate whitespace-only key', async () => {
      const request: StorageSetRequest = { key: '   ', value: 'test' };

      const result = await handleStorageSet(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
        expect(result.error.message).toContain('Key is required');
      }
    });

    it('should validate undefined value', async () => {
      const request: StorageSetRequest = { key: 'test-key', value: undefined as any };

      const result = await handleStorageSet(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
        expect(result.error.message).toContain('Value is required');
      }
    });

    it('should allow null value', async () => {
      const request: StorageSetRequest = { key: 'test-key', value: null };
      
      mockStorageService.set.mockResolvedValue(undefined);

      const result = await handleStorageSet(request);

      expect(mockStorageService.set).toHaveBeenCalledWith('test-key', null);
      expect(result.success).toBe(true);
    });

    it('should allow empty string value', async () => {
      const request: StorageSetRequest = { key: 'test-key', value: '' };
      
      mockStorageService.set.mockResolvedValue(undefined);

      const result = await handleStorageSet(request);

      expect(mockStorageService.set).toHaveBeenCalledWith('test-key', '');
      expect(result.success).toBe(true);
    });

    it('should handle storage service errors', async () => {
      const request: StorageSetRequest = { key: 'test-key', value: 'test-value' };
      const error = new Error('Storage write failed');
      
      mockStorageService.set.mockRejectedValue(error);

      const result = await handleStorageSet(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ERROR_CODES.STORAGE_WRITE_ERROR);
        expect(result.error.message).toBe('Storage write failed');
      }
    });
  });

  describe('handleStorageRemove', () => {
    it('should remove a key successfully', async () => {
      const request: StorageRemoveRequest = { key: 'test-key' };
      
      mockStorageService.remove.mockResolvedValue(undefined);

      const result = await handleStorageRemove(request);

      expect(mockStorageService.remove).toHaveBeenCalledWith('test-key');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.success).toBe(true);
      }
    });

    it('should handle removing non-existent key gracefully', async () => {
      const request: StorageRemoveRequest = { key: 'non-existent' };
      
      mockStorageService.remove.mockResolvedValue(undefined);

      const result = await handleStorageRemove(request);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.success).toBe(true);
      }
    });

    it('should validate empty key', async () => {
      const request: StorageRemoveRequest = { key: '' };

      const result = await handleStorageRemove(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
        expect(result.error.message).toContain('Key is required');
      }
    });

    it('should validate whitespace-only key', async () => {
      const request: StorageRemoveRequest = { key: '   ' };

      const result = await handleStorageRemove(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
        expect(result.error.message).toContain('Key is required');
      }
    });

    it('should handle storage service errors', async () => {
      const request: StorageRemoveRequest = { key: 'test-key' };
      const error = new Error('Storage remove failed');
      
      mockStorageService.remove.mockRejectedValue(error);

      const result = await handleStorageRemove(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ERROR_CODES.STORAGE_WRITE_ERROR);
        expect(result.error.message).toBe('Storage remove failed');
      }
    });
  });

  describe('handleStorageClear', () => {
    it('should clear storage successfully', async () => {
      mockStorageService.clear.mockResolvedValue(undefined);

      const result = await handleStorageClear();

      expect(mockStorageService.clear).toHaveBeenCalled();
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.success).toBe(true);
      }
    });

    it('should handle storage service errors', async () => {
      const error = new Error('Storage clear failed');
      
      mockStorageService.clear.mockRejectedValue(error);

      const result = await handleStorageClear();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ERROR_CODES.STORAGE_WRITE_ERROR);
        expect(result.error.message).toBe('Storage clear failed');
      }
    });
  });

  describe('Storage Service Initialization', () => {
    it('should initialize storage service with app data path', () => {
      const appDataPath = '/test/app/data';
      
      expect(() => {
        initializeStorageService(appDataPath);
      }).not.toThrow();
      
      expect(StorageService).toHaveBeenCalledWith(appDataPath);
    });
  });

  describe('IPC Handler Registration', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should register all storage IPC handlers', () => {
      registerStorageHandlers();

      expect(ipcMain.handle).toHaveBeenCalledWith(
        IPC_CHANNELS.STORAGE_GET, 
        expect.any(Function)
      );
      expect(ipcMain.handle).toHaveBeenCalledWith(
        IPC_CHANNELS.STORAGE_SET, 
        expect.any(Function)
      );
      expect(ipcMain.handle).toHaveBeenCalledWith(
        IPC_CHANNELS.STORAGE_REMOVE, 
        expect.any(Function)
      );
      expect(ipcMain.handle).toHaveBeenCalledWith(
        IPC_CHANNELS.STORAGE_CLEAR, 
        expect.any(Function)
      );
    });

    it('should unregister all storage IPC handlers', () => {
      unregisterStorageHandlers();

      expect(ipcMain.removeAllListeners).toHaveBeenCalledWith(IPC_CHANNELS.STORAGE_GET);
      expect(ipcMain.removeAllListeners).toHaveBeenCalledWith(IPC_CHANNELS.STORAGE_SET);
      expect(ipcMain.removeAllListeners).toHaveBeenCalledWith(IPC_CHANNELS.STORAGE_REMOVE);
      expect(ipcMain.removeAllListeners).toHaveBeenCalledWith(IPC_CHANNELS.STORAGE_CLEAR);
    });

    it('should handle registration when service is initialized', () => {
      // Since we initialize the service in beforeEach, this should work
      expect(() => {
        registerStorageHandlers();
      }).not.toThrow();
    });
  });
});
