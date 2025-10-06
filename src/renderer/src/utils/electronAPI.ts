// src/renderer/src/utils/electronAPI.ts
// Purpose: Helper utility to access Electron API from renderer components

/**
 * Access the Electron API exposed via preload script
 * Usage in components:
 *
 * import { getElectronAPI } from '@renderer/utils/electronAPI'
 *
 * const api = getElectronAPI()
 * await api.saveSession({ ... })
 */
export function getElectronAPI() {
  if (!window.electronAPI) {
    throw new Error('electronAPI not available. Make sure preload script is loaded.');
  }
  return window.electronAPI;
}

// Convenience exports for common operations
export const sessionAPI = {
  save: (sessionData: unknown) => getElectronAPI().saveSession(sessionData),
  load: (sessionId: string) => getElectronAPI().loadSession(sessionId),
  delete: (sessionId: string) => getElectronAPI().deleteSession(sessionId),
  list: () => getElectronAPI().listSessions()
};

export const fileAPI = {
  save: (filePath: string, content: string) => getElectronAPI().saveFile(filePath, content),
  load: (filePath: string) => getElectronAPI().loadFile(filePath)
};
