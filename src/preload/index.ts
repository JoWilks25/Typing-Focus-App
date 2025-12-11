import { contextBridge, ipcRenderer } from 'electron';
import type { EditorJson } from '@shared/tiptapTypes';

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
    writeJson: async (filePath: string, content: EditorJson): Promise<void> => {
      const response = await ipcRenderer.invoke('file:write-json', filePath, content);
      if (!response.success) {
        throw new Error(response.error || 'Failed to write file');
      }
    },
    writeBinary: async (filePath: string, buffer: ArrayBuffer): Promise<void> => {
      const response = await ipcRenderer.invoke('file:write-binary', filePath, Buffer.from(buffer));
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
    showOpenTiptap: async (): Promise<string | null> => {
      const response = await ipcRenderer.invoke('dialog:show-open-tiptap');
      if (!response.success) {
        throw new Error(response.error || 'Failed to open file dialog');
      }
      if (response.canceled) {
        return null;
      }
      return response.data;
    },
    showSaveExport: async (options: { defaultPath?: string; filters: { name: string; extensions: string[] }[] }): Promise<string | null> => {
      const response = await ipcRenderer.invoke('dialog:show-save-export', options);
      if (!response.success) {
        throw new Error(response.error || 'Failed to open save dialog');
      }
      if (response.canceled) {
        return null;
      }
      return response.data;
    },
  },
  import: {
    docxToHtml: async (filePath: string): Promise<string> => {
      const response = await ipcRenderer.invoke('import:docx-to-html', filePath);
      if (!response.success) {
        throw new Error(response.error || 'Failed to convert DOCX');
      }
      return response.data;
    },
  },
  shell: {
    showItemInFolder: async (filePath: string): Promise<void> => {
      const response = await ipcRenderer.invoke('shell:show-item-in-folder', filePath);
      if (!response.success) {
        throw new Error(response.error || 'Failed to open folder');
      }
    },
  },
  onDistractionTimeout: (callback: () => void) => {
    ipcRenderer.on('distraction-timeout-end-session', () => callback());
  },
  export: {
    htmlToDocx: async (html: string): Promise<ArrayBuffer> => {
      const response = await ipcRenderer.invoke('export:html-to-docx', html);
      if (!response.success) {
        throw new Error(response.error || 'Failed to convert to DOCX');
      }
      // Convert base64 back to ArrayBuffer
      const binaryString = atob(response.data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes.buffer;
    },
  },
});
