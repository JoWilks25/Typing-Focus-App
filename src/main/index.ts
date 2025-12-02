import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import { join } from 'path';
import { fileManager } from './services/fileManager';

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

});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
