import { app, BrowserWindow } from 'electron';
import { join } from 'path';
import { initializeServices, registerHandlers, getSessionManager } from './ipcHandlers';
import { inactivityService } from './services/InactivityService';
import { focusMonitorService } from './services/FocusMonitorService';

// Handle user closing the window (X button)
let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  // Create the browser window (1280x800, min 1024x768)
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    minWidth: 1024,
    minHeight: 768,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  // Set main window reference for services
  inactivityService.setMainWindow(mainWindow);
  focusMonitorService.setMainWindow(mainWindow);

  // Show window when ready
  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();
  });

  // Handle user closing the window (X button)
  mainWindow.on('close', async (event) => {
    console.log('User is closing the window - ending active session gracefully');
    
    const sessionManager = getSessionManager();
    if (sessionManager) {
      const activeSession = sessionManager.getActiveSession();
      if (activeSession) {
        try {
          // End session as "incomplete" (user chose to stop)
          await sessionManager.endSession(activeSession.id, '', 0);
          console.log('Active session ended due to window close');
        } catch (error) {
          console.warn('Failed to end session on window close:', error);
        }
      }
    }
    
    // Allow window to close
    mainWindow?.destroy();
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    console.log('Window closed');
    // Stop tracking when window is closed
    inactivityService.stopTracking();
    focusMonitorService.stopMonitoring();
    mainWindow = null;
  });

  // Load the renderer process
  // In dev: load from dev server, in prod: load from built files
  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

// Create window when app is ready
app.whenReady().then(async () => {
  // Initialize services with app data directory
  const appDataPath = app.getPath('userData');
  
  // Initialize simplified services
  initializeServices(appDataPath);
  
  // Register IPC handlers
  registerHandlers();
  
  createWindow();

  // macOS: re-create window when dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle graceful shutdown - end active session when user quits app
app.on('before-quit', async (event) => {
  console.log('App is about to quit - ending active session gracefully');
  
  const sessionManager = getSessionManager();
  if (sessionManager) {
    const activeSession = sessionManager.getActiveSession();
    if (activeSession) {
      try {
        // End session as "incomplete" (user chose to stop)
        await sessionManager.endSession(activeSession.id, '', 0);
        console.log('Active session ended due to app quit');
      } catch (error) {
        console.warn('Failed to end session on app quit:', error);
      }
    }
  }
  
  // Allow app to quit normally
});

// Handle renderer process crashes
app.on('render-process-gone', async (event, webContents, details) => {
  if (details.reason === 'crashed') {
    console.log('Renderer process crashed - marking session as abandoned');
    
    const sessionManager = getSessionManager();
    if (sessionManager) {
      const activeSession = sessionManager.getActiveSession();
      if (activeSession) {
        try {
          // Abandon session (crash scenario)
          await sessionManager.abandonSession(activeSession.id);
          console.log('Session abandoned due to renderer crash');
        } catch (error) {
          console.warn('Failed to abandon session on renderer crash:', error);
        }
      }
    }
  }
});

// Handle main process crashes
process.on('uncaughtException', async (error) => {
  console.log('Main process crashed:', error);
  
  const sessionManager = getSessionManager();
  if (sessionManager) {
    const activeSession = sessionManager.getActiveSession();
    if (activeSession) {
      try {
        // Abandon session (crash scenario)
        await sessionManager.abandonSession(activeSession.id);
        console.log('Session abandoned due to main process crash');
      } catch (abandonError) {
        console.warn('Failed to abandon session on main crash:', abandonError);
      }
    }
  }
  
  // Exit the process
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', async (reason, promise) => {
  console.log('Unhandled promise rejection:', reason);
  
  const sessionManager = getSessionManager();
  if (sessionManager) {
    const activeSession = sessionManager.getActiveSession();
    if (activeSession) {
      try {
        // Abandon session (crash scenario)
        await sessionManager.abandonSession(activeSession.id);
        console.log('Session abandoned due to unhandled promise rejection');
      } catch (error) {
        console.warn('Failed to abandon session on promise rejection:', error);
      }
    }
  }
});
