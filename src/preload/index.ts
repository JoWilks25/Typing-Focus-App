import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  onshowDistractionWarning(callback: () => void) {
    ipcRenderer.on('show-distraction-warning', () => callback());
  },
  ondismissDistractionWarning(callback: () => void) {
    ipcRenderer.on('dismiss-distraction-warning', () => callback());
  },
  onupdateCountdown(callback: (seconds: number) => void) {
    ipcRenderer.on('update-countdown', (_event, seconds: number) => {
      callback(seconds);
    });
  },
  returnToSession() {
    ipcRenderer.send('distraction:return');
  },
  // Add handler for main process to query if distraction warning should show
  onShouldShowDistractionWarning(callback: (respond: (shouldShow: boolean) => void) => void) {
    ipcRenderer.on('distraction:should-show', (_event, responseChannel: string) => {
      callback((shouldShow: boolean) => {
        ipcRenderer.send(responseChannel, shouldShow);
      });
    });
  },
  onEndSessionFromDistraction(callback: () => void) {
    ipcRenderer.on('end-session-from-distraction', () => callback());
  },
  session: {
    end: () => ipcRenderer.send('distraction:end-session'),
  },
  file: {
    write: async (filePath: string, content: string): Promise<void> => {
      const response = await ipcRenderer.invoke('file:write', filePath, content);
      if (!response.success) {
        throw new Error(response.error || 'Failed to write file');
      }
    },
    read: async (filePath: string): Promise<string> => {
      const response = await ipcRenderer.invoke('file:read', filePath);
      if (!response.success) {
        throw new Error(response.error || 'Failed to read file');
      }
      return response.data;
    },
    exists: async (filePath: string): Promise<boolean> => {
      const response = await ipcRenderer.invoke('file:exists', filePath);
      if (!response.success) {
        throw new Error(response.error || 'Failed to read file');
      }
      return response.exists;
    },
  },
  app: {
    getDefaultSaveDirectory: async (): Promise<string> => {
      const response = await ipcRenderer.invoke('app:get-default-save-directory');
      if (!response.success) {
        throw new Error(response.error || 'Failed to get default save directory');
      }
      return response.data;
    },
  },
  dialog: {
    showOpenDirectory: async (defaultPath?: string): Promise<string | null> => {
      const response = await ipcRenderer.invoke('dialog:show-open-directory', defaultPath);
      if (!response.success) {
        throw new Error(response.error || 'Failed to open directory dialog');
      }
      if (response.canceled) {
        return null;
      }
      return response.data;
    },
  },
  onDistractionTimeout: (callback: () => void) => {
    ipcRenderer.on('distraction-timeout-end-session', () => callback());
  },
});
