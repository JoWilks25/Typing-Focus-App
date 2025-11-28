// src/main/ipcHandlers.ts
import { ipcMain, BrowserWindow } from 'electron';
import { windowManager } from './windowManager';

// IPC channel names
export const IPC_CHANNELS = {
  // Window management
  MODAL_CREATE: 'modal:create',
  MODAL_CLOSE: 'modal:close',

  // State synchronization
  STATE_BROADCAST: 'state:broadcast',
  STATE_SYNC: 'state:sync',
  STATE_REQUEST: 'state:request',
} as const;

export function registerIpcHandlers(): void {
  // Create modal window
  ipcMain.handle(IPC_CHANNELS.MODAL_CREATE, async (_event, options) => {
    const modalId = options.id || `modal-${Date.now()}`;
    windowManager.createModalWindow(modalId, options);
    return { success: true, modalId };
  });

  // Close modal window
  ipcMain.handle(IPC_CHANNELS.MODAL_CLOSE, async (_event, modalId) => {
    windowManager.closeModalWindow(modalId);
    return { success: true };
  });

  // Broadcast state update from any window
  ipcMain.on(IPC_CHANNELS.STATE_BROADCAST, (event, { storeName, state }) => {
    // Broadcast to all other windows (excluding sender)
    BrowserWindow.getAllWindows().forEach((window) => {
      if (window.webContents.id !== event.sender.id && !window.isDestroyed()) {
        window.webContents.send(IPC_CHANNELS.STATE_SYNC, {
          storeName,
          state,
        });
      }
    });
  });

  // Request current state (for new windows to sync on load)
  ipcMain.handle(IPC_CHANNELS.STATE_REQUEST, async (event, storeName) => {
    // Request state from main window
    const mainWindow = windowManager.getMainWindow();
    if (mainWindow && !mainWindow.isDestroyed()) {
      return new Promise((resolve) => {
        const responseChannel = `state:response-${Date.now()}`;

        ipcMain.once(responseChannel, (_event, state) => {
          resolve({ success: true, state });
        });

        // Ask main window for state
        mainWindow.webContents.send('state:request-internal', {
          storeName,
          responseChannel,
        });

        // Timeout after 2 seconds
        setTimeout(() => {
          resolve({ success: false, error: 'Timeout' });
        }, 2000);
      });
    }
    return { success: false, error: 'Main window not found' };
  });
}