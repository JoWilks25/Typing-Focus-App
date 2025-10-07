import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock uuid
let uuidCounter = 0;
vi.mock('uuid', () => ({
  v4: vi.fn(() => `mock-uuid-${++uuidCounter}`),
}));

// Mock Electron APIs
vi.mock('electron', () => ({
  ipcRenderer: {
    invoke: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    send: vi.fn(),
  },
  ipcMain: {
    handle: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  },
  app: {
    getPath: vi.fn(),
    getName: vi.fn(),
    getVersion: vi.fn(),
  },
  dialog: {
    showOpenDialog: vi.fn(),
    showSaveDialog: vi.fn(),
  },
  shell: {
    openExternal: vi.fn(),
  },
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));


