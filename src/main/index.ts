import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import { join } from 'path';
import mammoth from 'mammoth';
import { fileManager } from './services/fileManager';
import { convertHtmlToDocx } from './services/exportService';
import type { EditorJson } from '@shared/tiptapTypes';

let mainWindow: BrowserWindow | null = null;
let distractionWindow: BrowserWindow | null = null;
let distractionCountdown: NodeJS.Timeout | null = null;
let secondsRemaining = 0;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon: join(__dirname, '../../build/icon.png') } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();
  });

  // Load the renderer
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] || 'http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  setupFocusMonitoring(mainWindow);
}

function createDistractionWindow() {
  if (distractionWindow && !distractionWindow.isDestroyed()) {
    distractionWindow.focus();
    return;
  }

  distractionWindow = new BrowserWindow({
    width: 520,
    height: 750,
    resizable: false,
    alwaysOnTop: true,
    frame: true,
    autoHideMenuBar: true,
    modal: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  });

  // Center the window
  if (mainWindow && !mainWindow.isDestroyed()) {
    const bounds = mainWindow.getBounds();
    // Ensure values are valid integers
    const x = Math.round(bounds.x + (bounds.width - 520) / 2);
    const y = Math.round(bounds.y + (bounds.height - 300) / 2);

    // Only set position if values are valid numbers
    if (!isNaN(x) && !isNaN(y) && isFinite(x) && isFinite(y)) {
      distractionWindow.setPosition(x, y);
    }
  }

  // Load the distraction warning page
  if (process.env.NODE_ENV === 'development') {
    distractionWindow.loadURL(
      (process.env['ELECTRON_RENDERER_URL'] || 'http://localhost:5173') + '/distraction-warning.html'
    );
  } else {
    distractionWindow.loadFile(join(__dirname, '../renderer/distraction-warning.html'));
  }

  distractionWindow.on('closed', () => {
    distractionWindow = null;
  });
}

function setupFocusMonitoring(win: BrowserWindow) {
  win.on('blur', () => {
    // Check if we should show the distraction warning
    checkAndStartDistractionCountdown(win);
  });

  win.on('focus', () => {
    if (distractionCountdown) {
      clearInterval(distractionCountdown);
      distractionCountdown = null;
    }
    if (distractionWindow && !distractionWindow.isDestroyed()) {
      distractionWindow.close();
    }
  });
}

function checkAndStartDistractionCountdown(win: BrowserWindow) {
  if (!win || win.isDestroyed()) return;

  // Query the renderer to check if we should show the distraction warning
  const responseChannel = `distraction:should-show-response-${Date.now()}`;

  // Set up one-time listener for the response
  ipcMain.once(responseChannel, (_event, shouldShow: boolean) => {
    if (shouldShow) {
      startDistractionCountdown();
    }
  });

  // Send query to renderer
  win.webContents.send('distraction:should-show', responseChannel);
}

function startDistractionCountdown() {
  secondsRemaining = 10;

  createDistractionWindow();

  // Wait for window to be ready before sending messages
  if (distractionWindow) {
    distractionWindow.webContents.once('did-finish-load', () => {
      distractionWindow?.webContents.send('update-countdown', secondsRemaining);
    });
  }

  distractionCountdown = setInterval(() => {
    secondsRemaining -= 1;
    if (distractionWindow && !distractionWindow.isDestroyed()) {
      distractionWindow.webContents.send('update-countdown', secondsRemaining);
    }

    if (secondsRemaining <= 0) {
      clearInterval(distractionCountdown!);
      distractionCountdown = null;

      // Trigger save and end session when timeout occurs
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('distraction-timeout-end-session');
      }

      if (distractionWindow && !distractionWindow.isDestroyed()) {
        distractionWindow.close();
      }
    }
  }, 1000);
}

// Handle return to session
ipcMain.on('distraction:return', () => {
  if (distractionCountdown) {
    clearInterval(distractionCountdown);
    distractionCountdown = null;
  }
  if (mainWindow) {
    mainWindow.focus();
  }
  if (distractionWindow && !distractionWindow.isDestroyed()) {
    distractionWindow.close();
  }
});

// Handle end session
ipcMain.on('distraction:end-session', async () => {
  if (distractionCountdown) {
    clearInterval(distractionCountdown);
    distractionCountdown = null;
  }
  // Send message to main window to end the session properly
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('end-session-from-distraction');
  }
  if (distractionWindow && !distractionWindow.isDestroyed()) {
    distractionWindow.close();
  }
});

app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });

  // Add this in your app.whenReady() or initialization
  ipcMain.handle('file:write', async (_event, filePath: string, content: string) => {
    try {
      await fileManager.writeFile(filePath, content);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  ipcMain.handle('file:write-json', async (_event, filePath: string, content: EditorJson) => {
    try {
      await fileManager.writeJsonFile(filePath, content);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  ipcMain.handle('file:read', async (_event, filePath: string) => {
    try {
      const content = await fileManager.readFile(filePath);
      return { success: true, data: content };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  ipcMain.handle('file:exists', async (_event, filePath: string) => {
    try {
      const exists = await fileManager.fileExists(filePath);
      return { success: true, exists: exists };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  ipcMain.handle('app:get-default-save-directory', async () => {
    try {
      const documentsPath = app.getPath('documents');
      // Optionally create a subdirectory for your app's files
      const appSaveDirectory = join(documentsPath, 'Draft Tree');
      return { success: true, data: appSaveDirectory };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  // Add handler for showing directory picker
  ipcMain.handle('dialog:show-open-directory', async (_event, defaultPath?: string) => {
    try {
      const result = await dialog.showOpenDialog(mainWindow!, {
        properties: ['openDirectory'],
        title: 'Select Save Location',
        defaultPath: defaultPath || app.getPath('documents'),
      });

      if (result.canceled) {
        return { success: true, canceled: true, data: null };
      }

      return {
        success: true,
        canceled: false,
        data: result.filePaths[0]
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  ipcMain.handle('dialog:show-open-tiptap', async (_event) => {
    try {
      const result = await dialog.showOpenDialog(mainWindow!, {
        properties: ['openFile'],
        title: 'Select Draft Tree file',
        filters: [
          { name: 'All supported', extensions: ['dt.json', 'txt', 'md', 'docx'] },
        ],
      });

      if (result.canceled || !result.filePaths[0]) {
        return { success: true, canceled: true, data: null };
      }

      // Validate file extension - reject unsupported files
      const filePath = result.filePaths[0];
      const lowerPath = filePath.toLowerCase();
      const extension = lowerPath.endsWith('.dt.json')
        ? 'dt.json'
        : lowerPath.split('.').pop();

      const supportedExtensions = ['dt.json', 'txt', 'md', 'docx'];
      if (!extension || !supportedExtensions.includes(extension)) {
        return {
          success: false,
          error: 'Unsupported file type. Please choose a .dt.json, .txt, .md, or .docx file.',
        };
      }

      return { success: true, canceled: false, data: filePath };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  ipcMain.handle('import:docx-to-html', async (_event, filePath: string) => {
    try {
      const buffer = await fileManager.readFileBinary(filePath);
      const result = await mammoth.convertToHtml({ buffer });
      return { success: true, data: result.value };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  ipcMain.handle('shell:show-item-in-folder', async (_event, filePath: string) => {
    try {
      shell.showItemInFolder(filePath);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  // Export dialog handler
  ipcMain.handle('dialog:show-save-export', async (_event, options: { defaultPath?: string; filters: { name: string; extensions: string[] }[] }) => {
    try {
      const result = await dialog.showSaveDialog(mainWindow!, {
        title: 'Export Document',
        defaultPath: options.defaultPath,
        filters: options.filters,
      });

      if (result.canceled || !result.filePath) {
        return { success: true, canceled: true, data: null };
      }

      return {
        success: true,
        canceled: false,
        data: result.filePath,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  // Export file handler (for binary files like DOCX)
  ipcMain.handle('file:write-binary', async (_event, filePath: string, buffer: Buffer) => {
    try {
      const dir = require('path').join(filePath, '..');
      await require('fs').promises.mkdir(dir, { recursive: true });
      await require('fs').promises.writeFile(filePath, buffer);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  // Export DOCX handler - converts HTML to DOCX buffer in main process
  ipcMain.handle('export:html-to-docx', async (_event, html: string) => {
    try {
      const buffer = await convertHtmlToDocx(html);
      // Convert Buffer to base64 for IPC transmission
      return { success: true, data: buffer.toString('base64') };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  ipcMain.handle('import:docx-to-html', async (_event, filePath: string) => {
    try {
      const buffer = await fileManager.readFileBinary(filePath);
      const result = await mammoth.convertToHtml({ buffer });
      return { success: true, data: result.value };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
