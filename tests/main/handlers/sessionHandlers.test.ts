import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SessionService } from '../../../src/main/services/sessionService';
import { ipcMain } from 'electron';
import { 
  handleSessionStart, 
  handleSessionStop, 
  handleSessionGet, 
  handleSessionList,
  initializeSessionService,
  registerSessionHandlers,
  unregisterSessionHandlers
} from '../../../src/main/handlers/sessionHandlers';
import { 
  SessionStartRequest, 
  SessionStopRequest, 
  SessionGetRequest,
  ERROR_CODES,
  IPC_CHANNELS
} from '../../../src/main/types/ipc';

// Mock SessionService and StorageService
vi.mock('../../../src/main/services/sessionService');
vi.mock('../../../src/main/services/storageService');

// Mock electron ipcMain
vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn(),
    removeAllListeners: vi.fn()
  }
}));

describe('Session Handlers - TDD Tests', () => {
  let mockSessionService: any;
  let mockStorageService: any;

  beforeEach(() => {
    mockSessionService = {
      startSession: vi.fn(),
      stopSession: vi.fn(),
      getSession: vi.fn(),
      listSessions: vi.fn(),
    };

    mockStorageService = {
      set: vi.fn(),
      get: vi.fn(),
      remove: vi.fn(),
    };
    
    // Mock the SessionService constructor
    vi.mocked(SessionService).mockImplementation(() => mockSessionService);
    
    // Initialize the session service for handlers
    initializeSessionService(mockStorageService);
  });

  describe('handleSessionStart', () => {
    it('should start a session with valid goals and return full session', async () => {
      const request: SessionStartRequest = { 
        name: 'Test Session',
        title: 'Test Title',
        goalType: 'word',
        goalValue: 500
      };
      const mockSession = {
        id: 'test-session-id',
        name: 'Test Session',
        title: 'Test Title',
        goalType: 'word' as const,
        goalValue: 500,
        startTime: 1234567890,
        status: 'active' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      };
      
      mockSessionService.startSession.mockResolvedValue(mockSession);

      const result = await handleSessionStart(request);

      expect(mockSessionService.startSession).toHaveBeenCalledWith('Test Session', 'Test Title', 'word', 500);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.session).toEqual(mockSession);
      }
    });

    it('should start a session with time goal', async () => {
      const request: SessionStartRequest = { 
        goalType: 'time',
        goalValue: 30
      };
      const mockSession = {
        id: 'test-session-id',
        name: 'Session 2024-01-01 12:00:00',
        goalType: 'time' as const,
        goalValue: 30,
        startTime: 1234567890,
        status: 'active' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      };
      
      mockSessionService.startSession.mockResolvedValue(mockSession);

      const result = await handleSessionStart(request);

      expect(mockSessionService.startSession).toHaveBeenCalledWith(undefined, undefined, 'time', 30);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.session).toEqual(mockSession);
      }
    });

    it('should handle validation errors for invalid word goal', async () => {
      const request: SessionStartRequest = { 
        name: 'Test Session',
        goalType: 'word',
        goalValue: 5 // Invalid - below minimum
      };

      const result = await handleSessionStart(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
        expect(result.error.message).toContain('Invalid goal: word goal value 5 is out of range');
      }
      expect(mockSessionService.startSession).not.toHaveBeenCalled();
    });

    it('should handle validation errors for invalid time goal', async () => {
      const request: SessionStartRequest = { 
        name: 'Test Session',
        goalType: 'time',
        goalValue: 600 // Invalid - above maximum
      };

      const result = await handleSessionStart(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
        expect(result.error.message).toContain('Invalid goal: time goal value 600 is out of range');
      }
      expect(mockSessionService.startSession).not.toHaveBeenCalled();
    });

    it('should handle session service errors', async () => {
      const request: SessionStartRequest = { 
        name: 'Test Session',
        goalType: 'word',
        goalValue: 500
      };
      const error = new Error('Session start failed');
      
      mockSessionService.startSession.mockRejectedValue(error);

      const result = await handleSessionStart(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ERROR_CODES.SESSION_NOT_ACTIVE);
        expect(result.error.message).toBe('Session start failed');
      }
    });
  });

  describe('handleSessionStop', () => {
    it('should stop a session successfully', async () => {
      const request: SessionStopRequest = { sessionId: 'test-session-id' };
      const mockSession = {
        id: 'test-session-id',
        name: 'Test Session',
        goalType: 'word' as const,
        goalValue: 500,
        startTime: 1234567890,
        endTime: 1234567891,
        status: 'stopped' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      };
      
      mockSessionService.stopSession.mockResolvedValue(mockSession);

      const result = await handleSessionStop(request);

      expect(mockSessionService.stopSession).toHaveBeenCalledWith('test-session-id');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.success).toBe(true);
      }
    });

    it('should validate empty sessionId', async () => {
      const request: SessionStopRequest = { sessionId: '' };

      const result = await handleSessionStop(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
        expect(result.error.message).toContain('Session ID is required');
      }
    });

    it('should validate whitespace-only sessionId', async () => {
      const request: SessionStopRequest = { sessionId: '   ' };

      const result = await handleSessionStop(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
        expect(result.error.message).toContain('Session ID is required');
      }
    });

    it('should handle session not found error', async () => {
      const request: SessionStopRequest = { sessionId: 'non-existent-id' };
      const error = new Error('Session not found: non-existent-id');
      
      mockSessionService.stopSession.mockRejectedValue(error);

      const result = await handleSessionStop(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ERROR_CODES.SESSION_NOT_FOUND);
        expect(result.error.message).toBe('Session not found: non-existent-id');
      }
    });

    it('should handle session already stopped error', async () => {
      const request: SessionStopRequest = { sessionId: 'test-session-id' };
      const error = new Error('Session is already stopped: test-session-id');
      
      mockSessionService.stopSession.mockRejectedValue(error);

      const result = await handleSessionStop(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ERROR_CODES.SESSION_NOT_ACTIVE);
        expect(result.error.message).toBe('Session is already stopped: test-session-id');
      }
    });
  });

  describe('handleSessionGet', () => {
    it('should get a session successfully', async () => {
      const request: SessionGetRequest = { sessionId: 'test-session-id' };
      const mockSession = {
        id: 'test-session-id',
        name: 'Test Session',
        title: 'Test Title',
        goalType: 'word' as const,
        goalValue: 500,
        startTime: 1234567890,
        endTime: 1234567891,
        status: 'stopped' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      };
      
      mockSessionService.getSession.mockReturnValue(mockSession);

      const result = await handleSessionGet(request);

      expect(mockSessionService.getSession).toHaveBeenCalledWith('test-session-id');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.session).toEqual(mockSession);
      }
    });

    it('should validate empty sessionId', async () => {
      const request: SessionGetRequest = { sessionId: '' };

      const result = await handleSessionGet(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
        expect(result.error.message).toContain('Session ID is required');
      }
    });

    it('should validate whitespace-only sessionId', async () => {
      const request: SessionGetRequest = { sessionId: '   ' };

      const result = await handleSessionGet(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
        expect(result.error.message).toContain('Session ID is required');
      }
    });

    it('should handle session not found', async () => {
      const request: SessionGetRequest = { sessionId: 'non-existent-id' };
      
      mockSessionService.getSession.mockReturnValue(undefined);

      const result = await handleSessionGet(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ERROR_CODES.SESSION_NOT_FOUND);
        expect(result.error.message).toContain('Session not found: non-existent-id');
      }
    });

    it('should handle session service errors', async () => {
      const request: SessionGetRequest = { sessionId: 'test-session-id' };
      const error = new Error('Session get failed');
      
      mockSessionService.getSession.mockImplementation(() => {
        throw error;
      });

      const result = await handleSessionGet(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ERROR_CODES.SESSION_NOT_FOUND);
        expect(result.error.message).toBe('Session get failed');
      }
    });
  });

  describe('handleSessionList', () => {
    it('should list all sessions successfully', async () => {
      const mockSessions = [
        {
          id: 'session-1',
          name: 'Session 1',
          title: 'Title 1',
          goalType: 'word' as const,
          goalValue: 500,
          startTime: 1234567890,
          endTime: 1234567891,
          status: 'stopped' as const,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        },
        {
          id: 'session-2',
          name: 'Session 2',
          title: 'Title 2',
          goalType: 'time' as const,
          goalValue: 30,
          startTime: 1234567892,
          status: 'active' as const,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      ];
      
      mockSessionService.listSessions.mockReturnValue(mockSessions);

      const result = await handleSessionList();

      expect(mockSessionService.listSessions).toHaveBeenCalled();
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.sessions).toEqual(mockSessions);
        expect(result.data.sessions).toHaveLength(2);
      }
    });

    it('should return empty array when no sessions exist', async () => {
      mockSessionService.listSessions.mockReturnValue([]);

      const result = await handleSessionList();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.sessions).toEqual([]);
        expect(result.data.sessions).toHaveLength(0);
      }
    });

    it('should handle session service errors', async () => {
      const error = new Error('Session list failed');
      
      mockSessionService.listSessions.mockImplementation(() => {
        throw error;
      });

      const result = await handleSessionList();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ERROR_CODES.UNKNOWN_ERROR);
        expect(result.error.message).toBe('Session list failed');
      }
    });
  });

  describe('Session Service Initialization', () => {
    it('should initialize session service with storage service', () => {
      expect(() => {
        initializeSessionService(mockStorageService);
      }).not.toThrow();
      
      expect(SessionService).toHaveBeenCalledWith(mockStorageService);
    });
  });

  describe('IPC Handler Registration', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should register all session IPC handlers', () => {
      registerSessionHandlers();

      expect(ipcMain.handle).toHaveBeenCalledWith(
        IPC_CHANNELS.SESSION_START, 
        expect.any(Function)
      );
      expect(ipcMain.handle).toHaveBeenCalledWith(
        IPC_CHANNELS.SESSION_STOP, 
        expect.any(Function)
      );
      expect(ipcMain.handle).toHaveBeenCalledWith(
        IPC_CHANNELS.SESSION_GET, 
        expect.any(Function)
      );
      expect(ipcMain.handle).toHaveBeenCalledWith(
        IPC_CHANNELS.SESSION_LIST, 
        expect.any(Function)
      );
    });

    it('should unregister all session IPC handlers', () => {
      unregisterSessionHandlers();

      expect(ipcMain.removeAllListeners).toHaveBeenCalledWith(IPC_CHANNELS.SESSION_START);
      expect(ipcMain.removeAllListeners).toHaveBeenCalledWith(IPC_CHANNELS.SESSION_STOP);
      expect(ipcMain.removeAllListeners).toHaveBeenCalledWith(IPC_CHANNELS.SESSION_GET);
      expect(ipcMain.removeAllListeners).toHaveBeenCalledWith(IPC_CHANNELS.SESSION_LIST);
    });

    it('should handle registration when service is initialized', () => {
      // Since we initialize the service in beforeEach, this should work
      expect(() => {
        registerSessionHandlers();
      }).not.toThrow();
    });
  });
});
