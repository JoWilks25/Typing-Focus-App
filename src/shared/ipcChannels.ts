import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

// Shared IPC channel constants that can be used by both main and preload
export const IPC_CHANNELS = {
  // Window management
  MODAL_CREATE: 'modal:create',
  MODAL_CLOSE: 'modal:close',

  // State synchronization
  STATE_BROADCAST: 'state:broadcast',
  STATE_SYNC: 'state:sync',
  STATE_REQUEST: 'state:request',
} as const;

// Custom APIs for renderer
const api = {
  // Window management
  modal: {
    create: (options: { id?: string; width?: number; height?: number; x?: number; y?: number; title?: string }) =>
      ipcRenderer.invoke(IPC_CHANNELS.MODAL_CREATE, options),
    close: (modalId: string) => ipcRenderer.invoke(IPC_CHANNELS.MODAL_CLOSE, modalId),
  },

  // State synchronization
  state: {
    broadcast: (storeName: string, state: unknown) => {
      ipcRenderer.send(IPC_CHANNELS.STATE_BROADCAST, { storeName, state });
    },
    sync: (callback: (data: { storeName: string; state: unknown }) => void) => {
      ipcRenderer.on(IPC_CHANNELS.STATE_SYNC, (_event, data) => callback(data));
    },
    request: (storeName: string) => ipcRenderer.invoke(IPC_CHANNELS.STATE_REQUEST, storeName),
    // Internal: respond to state requests from other windows
    onStateRequest: (callback: (data: { storeName: string; responseChannel: string }) => void) => {
      ipcRenderer.on('state:request-internal', (_event, data) => callback(data));
    },
    respondToStateRequest: (responseChannel: string, state: unknown) => {
      ipcRenderer.send(responseChannel, state);
    },
  },
};

// Use `contextBridge` APIs to expose Electron APIs to renderer
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}
