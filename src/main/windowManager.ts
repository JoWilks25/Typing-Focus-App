// src/main/windowManager.ts
import { BrowserWindow } from 'electron';
import { join } from 'path';
import { is } from '@electron-toolkit/utils';

class WindowManager {
  private mainWindow: BrowserWindow | null = null;
  private modalWindows: Map<string, BrowserWindow> = new Map();

  setMainWindow(window: BrowserWindow): void {
    this.mainWindow = window;
  }

  getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }

  createModalWindow(
    modalId: string,
    options: {
      width?: number;
      height?: number;
      x?: number;
      y?: number;
      title?: string;
    } = {}
  ): BrowserWindow {
    const modalWindow = new BrowserWindow({
      width: options.width || 400,
      height: options.height || 500,
      x: options.x,
      y: options.y,
      parent: this.mainWindow || undefined,
      modal: false, // Set to true if you want it truly modal
      frame: true,
      autoHideMenuBar: true,
      title: options.title || 'Modal',
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false,
        contextIsolation: true,
      },
    });

    // Load the same renderer (or a modal-specific route)
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      modalWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}#modal-${modalId}`);
    } else {
      modalWindow.loadFile(join(__dirname, '../renderer/index.html'), {
        hash: `modal-${modalId}`,
      });
    }

    this.modalWindows.set(modalId, modalWindow);

    // Clean up when window closes
    modalWindow.on('closed', () => {
      this.modalWindows.delete(modalId);
    });

    return modalWindow;
  }

  closeModalWindow(modalId: string): void {
    const window = this.modalWindows.get(modalId);
    if (window) {
      window.close();
      this.modalWindows.delete(modalId);
    }
  }

  broadcastToAllWindows(channel: string, data: unknown): void {
    BrowserWindow.getAllWindows().forEach((window) => {
      if (!window.isDestroyed()) {
        window.webContents.send(channel, data);
      }
    });
  }
}

export const windowManager = new WindowManager();