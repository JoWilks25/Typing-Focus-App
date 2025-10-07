import { describe, it, expect } from 'vitest';
import { toStructuredError, StructuredError } from '../../src/main/types/ipc';

describe('IPC Types and Error Model', () => {
  describe('toStructuredError', () => {
    it('should convert Error to StructuredError', () => {
      const error = new Error('Test error message');
      const result = toStructuredError(error, 'TEST_ERROR');
      
      expect(result).toEqual({
        code: 'TEST_ERROR',
        message: 'Test error message',
        details: undefined
      });
    });

    it('should handle Error with custom message', () => {
      const error = new Error('Custom error');
      const result = toStructuredError(error, 'CUSTOM_ERROR', { extra: 'data' });
      
      expect(result).toEqual({
        code: 'CUSTOM_ERROR',
        message: 'Custom error',
        details: { extra: 'data' }
      });
    });

    it('should handle non-Error objects', () => {
      const error = 'String error';
      const result = toStructuredError(error, 'STRING_ERROR');
      
      expect(result).toEqual({
        code: 'STRING_ERROR',
        message: 'String error',
        details: undefined
      });
    });

    it('should handle unknown errors', () => {
      const error = { some: 'object' };
      const result = toStructuredError(error, 'UNKNOWN_ERROR');
      
      expect(result).toEqual({
        code: 'UNKNOWN_ERROR',
        message: 'Unknown error',
        details: undefined
      });
    });
  });

  describe('StructuredError type', () => {
    it('should have correct shape', () => {
      const error: StructuredError = {
        code: 'TEST_CODE',
        message: 'Test message',
        details: { key: 'value' }
      };
      
      expect(error.code).toBe('TEST_CODE');
      expect(error.message).toBe('Test message');
      expect(error.details).toEqual({ key: 'value' });
    });

    it('should allow optional details', () => {
      const error: StructuredError = {
        code: 'TEST_CODE',
        message: 'Test message'
      };
      
      expect(error.details).toBeUndefined();
    });
  });
});
