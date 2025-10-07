import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FileService } from '../../../src/main/services/fileService';
import { ipcMain } from 'electron';
import { 
  handleFileRead, 
  handleFileWrite, 
  handleFileList, 
  handleFileExists,
  initializeFileService,
  registerFileHandlers,
  unregisterFileHandlers
} from '../../../src/main/handlers/fileHandlers';
import { 
  FileReadRequest, 
  FileWriteRequest, 
  FileListRequest, 
  FileExistsRequest,
  ERROR_CODES,
  IPC_CHANNELS
} from '../../../src/main/types/ipc';

// Mock FileService
vi.mock('../../../src/main/services/FileService');

// Mock electron ipcMain
vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn(),
    removeAllListeners: vi.fn()
  }
}));

describe('File Handlers', () => {
  let mockFileService: any;

  beforeEach(() => {
    mockFileService = {
      readFile: vi.fn(),
      writeFile: vi.fn(),
      listFiles: vi.fn(),
      fileExists: vi.fn(),
    };
    
    // Mock the FileService constructor
    vi.mocked(FileService).mockImplementation(() => mockFileService);
    
    // Initialize the file service for handlers
    initializeFileService('/test/path');
  });

  describe('handleFileRead', () => {
    it('should read file successfully', async () => {
      const request: FileReadRequest = { path: 'test.txt' };
      const mockContent = 'Hello, World!';
      
      mockFileService.readFile.mockResolvedValue(mockContent);

      const result = await handleFileRead(request);

      expect(mockFileService.readFile).toHaveBeenCalledWith('test.txt');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.content).toBe(mockContent);
      }
    });

    it('should handle file not found error', async () => {
      const request: FileReadRequest = { path: 'nonexistent.txt' };
      const error = new Error('ENOENT: no such file or directory');
      (error as any).code = 'ENOENT';
      
      mockFileService.readFile.mockRejectedValue(error);

      const result = await handleFileRead(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ERROR_CODES.FILE_NOT_FOUND);
        expect(result.error.message).toContain('no such file or directory');
      }
    });

    it('should handle permission errors', async () => {
      const request: FileReadRequest = { path: 'restricted.txt' };
      const error = new Error('EACCES: permission denied');
      (error as any).code = 'EACCES';
      
      mockFileService.readFile.mockRejectedValue(error);

      const result = await handleFileRead(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ERROR_CODES.FILE_READ_ERROR);
        expect(result.error.message).toContain('permission denied');
      }
    });

    it('should validate input', async () => {
      const request: FileReadRequest = { path: '' };

      const result = await handleFileRead(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
        expect(result.error.message).toContain('Path is required');
      }
    });
  });

  describe('handleFileWrite', () => {
    it('should write file successfully', async () => {
      const request: FileWriteRequest = { 
        path: 'test.txt', 
        content: 'Hello, World!' 
      };
      
      mockFileService.writeFile.mockResolvedValue(undefined);

      const result = await handleFileWrite(request);

      expect(mockFileService.writeFile).toHaveBeenCalledWith('test.txt', 'Hello, World!');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.success).toBe(true);
      }
    });

    it('should handle write permission errors', async () => {
      const request: FileWriteRequest = { 
        path: 'restricted.txt', 
        content: 'Hello, World!' 
      };
      const error = new Error('EACCES: permission denied');
      (error as any).code = 'EACCES';
      
      mockFileService.writeFile.mockRejectedValue(error);

      const result = await handleFileWrite(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ERROR_CODES.FILE_WRITE_ERROR);
        expect(result.error.message).toContain('permission denied');
      }
    });

    it('should validate input', async () => {
      const request: FileWriteRequest = { path: '', content: 'test' };

      const result = await handleFileWrite(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
        expect(result.error.message).toContain('Path is required');
      }
    });

    it('should validate content', async () => {
      const request: FileWriteRequest = { 
        path: 'test.txt', 
        content: '' 
      };

      const result = await handleFileWrite(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
        expect(result.error.message).toContain('Content is required');
      }
    });

    it('should validate null content', async () => {
      const request: FileWriteRequest = { 
        path: 'test.txt', 
        content: null as any
      };

      const result = await handleFileWrite(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
        expect(result.error.message).toContain('Content is required');
      }
    });

    it('should validate undefined content', async () => {
      const request: FileWriteRequest = { 
        path: 'test.txt', 
        content: undefined as any
      };

      const result = await handleFileWrite(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
        expect(result.error.message).toContain('Content is required');
      }
    });

    it('should handle generic file write errors', async () => {
      const request: FileWriteRequest = { 
        path: 'test.txt', 
        content: 'Hello, World!' 
      };
      const error = new Error('Generic write error');
      
      mockFileService.writeFile.mockRejectedValue(error);

      const result = await handleFileWrite(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ERROR_CODES.FILE_WRITE_ERROR);
        expect(result.error.message).toBe('Generic write error');
      }
    });
  });

  describe('handleFileList', () => {
    it('should list files successfully', async () => {
      const request: FileListRequest = { path: 'test-dir' };
      const mockFiles = ['file1.txt', 'file2.txt', 'subdir'];
      
      mockFileService.listFiles.mockResolvedValue(mockFiles);

      const result = await handleFileList(request);

      expect(mockFileService.listFiles).toHaveBeenCalledWith('test-dir');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.files).toEqual(mockFiles);
      }
    });

    it('should handle directory not found error', async () => {
      const request: FileListRequest = { path: 'nonexistent-dir' };
      const error = new Error('ENOENT: no such file or directory');
      (error as any).code = 'ENOENT';
      
      mockFileService.listFiles.mockRejectedValue(error);

      const result = await handleFileList(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ERROR_CODES.FILE_NOT_FOUND);
        expect(result.error.message).toContain('no such file or directory');
      }
    });

    it('should validate input', async () => {
      const request: FileListRequest = { path: '' };

      const result = await handleFileList(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
        expect(result.error.message).toContain('Path is required');
      }
    });

    it('should handle generic file list errors', async () => {
      const request: FileListRequest = { path: 'test-dir' };
      const error = new Error('Generic list error');
      
      mockFileService.listFiles.mockRejectedValue(error);

      const result = await handleFileList(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ERROR_CODES.FILE_LIST_ERROR);
        expect(result.error.message).toBe('Generic list error');
      }
    });
  });

  describe('handleFileExists', () => {
    it('should return true when file exists', async () => {
      const request: FileExistsRequest = { path: 'existing.txt' };
      
      mockFileService.fileExists.mockResolvedValue(true);

      const result = await handleFileExists(request);

      expect(mockFileService.fileExists).toHaveBeenCalledWith('existing.txt');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.exists).toBe(true);
      }
    });

    it('should return false when file does not exist', async () => {
      const request: FileExistsRequest = { path: 'nonexistent.txt' };
      
      mockFileService.fileExists.mockResolvedValue(false);

      const result = await handleFileExists(request);

      expect(mockFileService.fileExists).toHaveBeenCalledWith('nonexistent.txt');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.exists).toBe(false);
      }
    });

    it('should validate input', async () => {
      const request: FileExistsRequest = { path: '' };

      const result = await handleFileExists(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
        expect(result.error.message).toContain('Path is required');
      }
    });

    it('should handle generic file exists errors', async () => {
      const request: FileExistsRequest = { path: 'test.txt' };
      const error = new Error('Generic exists error');
      
      mockFileService.fileExists.mockRejectedValue(error);

      const result = await handleFileExists(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ERROR_CODES.UNKNOWN_ERROR);
        expect(result.error.message).toBe('Generic exists error');
      }
    });
  });

  describe('File Service Initialization', () => {
    it('should initialize file service with app data path', () => {
      const appDataPath = '/test/app/data';
      
      expect(() => {
        initializeFileService(appDataPath);
      }).not.toThrow();
      
      expect(FileService).toHaveBeenCalledWith(appDataPath);
    });
  });

  describe('IPC Handler Registration', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should register all file IPC handlers', () => {
      registerFileHandlers();

      expect(ipcMain.handle).toHaveBeenCalledWith(
        IPC_CHANNELS.FILE_READ, 
        expect.any(Function)
      );
      expect(ipcMain.handle).toHaveBeenCalledWith(
        IPC_CHANNELS.FILE_WRITE, 
        expect.any(Function)
      );
      expect(ipcMain.handle).toHaveBeenCalledWith(
        IPC_CHANNELS.FILE_LIST, 
        expect.any(Function)
      );
      expect(ipcMain.handle).toHaveBeenCalledWith(
        IPC_CHANNELS.FILE_EXISTS, 
        expect.any(Function)
      );
    });

    it('should unregister all file IPC handlers', () => {
      unregisterFileHandlers();

      expect(ipcMain.removeAllListeners).toHaveBeenCalledWith(IPC_CHANNELS.FILE_READ);
      expect(ipcMain.removeAllListeners).toHaveBeenCalledWith(IPC_CHANNELS.FILE_WRITE);
      expect(ipcMain.removeAllListeners).toHaveBeenCalledWith(IPC_CHANNELS.FILE_LIST);
      expect(ipcMain.removeAllListeners).toHaveBeenCalledWith(IPC_CHANNELS.FILE_EXISTS);
    });

    it('should handle registration when service is initialized', () => {
      // Since we initialize the service in beforeEach, this should work
      expect(() => {
        registerFileHandlers();
      }).not.toThrow();
    });
  });
});
