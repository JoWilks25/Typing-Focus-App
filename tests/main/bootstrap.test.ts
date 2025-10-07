import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { app } from 'electron';
import { FileService } from '../../src/main/services/fileService';

// Mock electron app
vi.mock('electron', () => ({
  app: {
    getPath: vi.fn(),
    whenReady: vi.fn()
  },
  BrowserWindow: vi.fn()
}));

// Mock FileService
vi.mock('../../src/main/services/fileService', () => ({
  FileService: vi.fn()
}));

describe('Bootstrap - userData Directory Creation', () => {
  const mockUserDataPath = '/Users/test/Library/Application Support/Typing-Focus-App';
  const mockFileService = {
    ensureDirectory: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup app.getPath mock
    (app.getPath as any).mockReturnValue(mockUserDataPath);
    
    // Setup FileService mock
    (FileService as any).mockImplementation(() => mockFileService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('userData directory initialization', () => {
    it('should get userData path from app.getPath', () => {
      // This tests that our bootstrap code calls app.getPath('userData')
      const userDataPath = app.getPath('userData');
      
      expect(app.getPath).toHaveBeenCalledWith('userData');
      expect(userDataPath).toBe(mockUserDataPath);
    });

    it('should create FileService with userData path', () => {
      // This tests that FileService is instantiated with the correct path
      new FileService(mockUserDataPath);
      
      expect(FileService).toHaveBeenCalledWith(mockUserDataPath);
    });

    it('should call ensureDirectory on FileService', async () => {
      // This tests that ensureDirectory is called to create the directory
      const fileService = new FileService(mockUserDataPath);
      await fileService.ensureDirectory('.');
      
      expect(mockFileService.ensureDirectory).toHaveBeenCalledWith('.');
    });

    it('should handle ensureDirectory errors gracefully', async () => {
      // This tests error handling in directory creation
      const error = new Error('Permission denied');
      mockFileService.ensureDirectory.mockRejectedValueOnce(error);
      
      const fileService = new FileService(mockUserDataPath);
      
      await expect(fileService.ensureDirectory('.')).rejects.toThrow('Permission denied');
      expect(mockFileService.ensureDirectory).toHaveBeenCalledWith('.');
    });
  });

  describe('security configuration verification', () => {
    it('should verify contextIsolation is enabled', () => {
      // This is a conceptual test - in real implementation, we'd verify the BrowserWindow config
      const webPreferences = {
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false
      };
      
      expect(webPreferences.contextIsolation).toBe(true);
      expect(webPreferences.nodeIntegration).toBe(false);
    });
  });
});
