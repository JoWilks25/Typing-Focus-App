// Type definitions for Electron API exposed to renderer process

export interface ElectronAPI {
  // Process info
  process: {
    versions: NodeJS.ProcessVersions;
  };

  // Session operations (placeholders - not implemented yet)
  saveSession: (sessionData: unknown) => Promise<{ success: boolean; message: string }>;
  loadSession: (sessionId: string) => Promise<unknown | null>;
  deleteSession: (sessionId: string) => Promise<{ success: boolean; message: string }>;
  listSessions: () => Promise<unknown[]>;

  // File operations (placeholders - not implemented yet)
  saveFile: (filePath: string, content: string) => Promise<{ success: boolean; message: string }>;
  loadFile: (filePath: string) => Promise<unknown | null>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

// This allows importing from this file
export {};
