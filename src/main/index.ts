import { app, BrowserWindow } from 'electron';
import { join } from 'path';
import { initializeFileService, registerFileHandlers } from './handlers/fileHandlers';
import { initializeStorageService, registerStorageHandlers } from './handlers/storageHandlers';
import { initializeSessionService, registerSessionHandlers } from './handlers/sessionHandlers';
import { initializeFocusService, registerFocusHandlers } from './handlers/focusHandlers';
import { initializeActivityService, registerActivityHandlers } from './handlers/activityHandlers';

function createWindow(): void {
  // Create the browser window (1280x800, min 1024x768)
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
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

  // Show window when ready
  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    console.log('Window closed');
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
  
  // Ensure userData directory exists
  const fileService = new (await import('./services/fileService')).FileService(appDataPath);
  await fileService.ensureDirectory('.');
  
  initializeFileService(appDataPath);
  const storageService = initializeStorageService(appDataPath);
  initializeSessionService(storageService);
  initializeFocusService();
  initializeActivityService();
  
  // Register IPC handlers
  registerFileHandlers();
  registerStorageHandlers();
  registerSessionHandlers();
  registerFocusHandlers();
  registerActivityHandlers();
  
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
