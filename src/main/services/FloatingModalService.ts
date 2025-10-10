import { BrowserWindow, screen } from 'electron';
import { join } from 'path';

export interface FloatingModalOptions {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  alwaysOnTop?: boolean;
  resizable?: boolean;
  minimizable?: boolean;
  closable?: boolean;
  title?: string;
  content?: string;
}

export interface FloatingModalWindow {
  id: string;
  window: BrowserWindow;
  options: FloatingModalOptions;
}

export class FloatingModalService {
  private modals: Map<string, FloatingModalWindow> = new Map();
  private nextId = 1;

  constructor() {
    // IPC handlers are set up in ipcHandlers.ts, not here
  }

  /**
   * Create a new floating modal window
   */
  createModal(options: FloatingModalOptions = {}): string {
    const id = `floating-modal-${this.nextId++}`;
    console.log('FloatingModalService: Creating modal with ID:', id);
    
    // Get primary display info for positioning
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
    
    // Default options
    const defaultOptions: Required<FloatingModalOptions> = {
      width: 400,
      height: 300,
      x: Math.floor((screenWidth - 400) / 2),
      y: Math.floor((screenHeight - 300) / 2),
      alwaysOnTop: true,
      resizable: true,
      minimizable: true,
      closable: true,
      title: 'Floating Modal',
      content: ''
    };

    const finalOptions = { ...defaultOptions, ...options };

    // Create the window
    const preloadPath = join(__dirname, '../preload/index.js');
    console.log('FloatingModalService: Creating modal with preload path:', preloadPath);
    
    const window = new BrowserWindow({
      width: finalOptions.width,
      height: finalOptions.height,
      x: finalOptions.x,
      y: finalOptions.y,
      show: false,
      frame: false,
      alwaysOnTop: finalOptions.alwaysOnTop,
      resizable: finalOptions.resizable,
      minimizable: finalOptions.minimizable,
      closable: finalOptions.closable,
      skipTaskbar: false,
      webPreferences: {
        preload: preloadPath,
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false,
        webSecurity: true
      }
    });

    // Set up window event handlers
    window.on('ready-to-show', () => {
      window.show();
    });

    window.on('closed', () => {
      this.modals.delete(id);
    });

    window.on('move', () => {
      // Optional: Could emit events here if needed
    });

    window.on('minimize', () => {
      // Optional: Could emit events here if needed
    });

    // Store the modal
    this.modals.set(id, {
      id,
      window,
      options: finalOptions
    });

    // Load the floating modal HTML
    this.loadModalContent(window, finalOptions);

    return id;
  }

  /**
   * Close a specific modal
   */
  closeModal(id: string): boolean {
    console.log('FloatingModalService: Attempting to close modal with ID:', id);
    console.log('FloatingModalService: Available modals:', Array.from(this.modals.keys()));
    
    const modal = this.modals.get(id);
    if (modal) {
      console.log('FloatingModalService: Found modal, closing...');
      modal.window.close();
      return true;
    }
    console.log('FloatingModalService: Modal not found with ID:', id);
    return false;
  }

  /**
   * Close all modals
   */
  closeAllModals(): void {
    this.modals.forEach(modal => {
      modal.window.close();
    });
  }

  /**
   * Minimize a specific modal
   */
  minimizeModal(id: string): boolean {
    const modal = this.modals.get(id);
    if (modal) {
      modal.window.minimize();
      return true;
    }
    return false;
  }

  /**
   * Move a modal to specific coordinates
   */
  moveModal(id: string, x: number, y: number): boolean {
    const modal = this.modals.get(id);
    if (modal) {
      modal.window.setPosition(x, y);
      return true;
    }
    return false;
  }

  /**
   * Resize a modal
   */
  resizeModal(id: string, width: number, height: number): boolean {
    const modal = this.modals.get(id);
    if (modal) {
      modal.window.setSize(width, height);
      return true;
    }
    return false;
  }

  /**
   * Get modal information
   */
  getModal(id: string): FloatingModalWindow | undefined {
    return this.modals.get(id);
  }

  /**
   * Get all active modals
   */
  getAllModals(): FloatingModalWindow[] {
    return Array.from(this.modals.values());
  }

  /**
   * Check if a modal exists
   */
  hasModal(id: string): boolean {
    return this.modals.has(id);
  }

  /**
   * Execute JavaScript in a modal window
   */
  executeJavaScript(id: string, script: string): Promise<void> {
    const modal = this.modals.get(id);
    if (!modal) {
      return Promise.reject(new Error(`Modal not found: ${id}`));
    }
    
    return modal.window.webContents.executeJavaScript(script);
  }

  /**
   * Load modal content into the window
   */
  private loadModalContent(window: BrowserWindow, options: FloatingModalOptions): void {
    // Create HTML content for the floating modal
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${options.title || 'Floating Modal'}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: transparent;
              overflow: hidden;
              user-select: none;
            }
            
            #floating-modal-container {
              width: 100vw;
              height: 100vh;
              background: rgba(31, 41, 55, 0.95);
              backdrop-filter: blur(10px);
              border-radius: 12px;
              border: 1px solid rgba(255, 255, 255, 0.1);
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
              display: flex;
              flex-direction: column;
              position: relative;
            }
            
            #modal-header {
              height: 32px;
              background: rgba(0, 0, 0, 0.2);
              border-radius: 12px 12px 0 0;
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 0 12px;
              cursor: move;
              -webkit-app-region: drag;
            }
            
            #modal-title {
              color: #f9fafb;
              font-size: 12px;
              font-weight: 500;
              opacity: 0.8;
            }
            
            #modal-controls {
              display: flex;
              gap: 8px;
              -webkit-app-region: no-drag;
            }
            
            .control-button {
              width: 12px;
              height: 12px;
              border-radius: 50%;
              border: none;
              cursor: pointer;
              transition: opacity 0.2s;
            }
            
            .control-button:hover {
              opacity: 0.8;
            }
            
            #close-button {
              background: #ef4444;
            }
            
            #minimize-button {
              background: #f59e0b;
            }
            
            #modal-content {
              flex: 1;
              padding: 16px;
              overflow: auto;
              color: #f9fafb;
            }
            
            #modal-content::-webkit-scrollbar {
              width: 6px;
            }
            
            #modal-content::-webkit-scrollbar-track {
              background: rgba(255, 255, 255, 0.1);
              border-radius: 3px;
            }
            
            #modal-content::-webkit-scrollbar-thumb {
              background: rgba(255, 255, 255, 0.3);
              border-radius: 3px;
            }
            
            #modal-content::-webkit-scrollbar-thumb:hover {
              background: rgba(255, 255, 255, 0.5);
            }
          </style>
        </head>
        <body>
          <div id="floating-modal-container">
            <div id="modal-header">
              <div id="modal-title">${options.title || 'Floating Modal'}</div>
              <div id="modal-controls">
                ${options.minimizable !== false ? '<button id="minimize-button" class="control-button" title="Minimize"></button>' : ''}
                ${options.closable !== false ? '<button id="close-button" class="control-button" title="Close"></button>' : ''}
              </div>
            </div>
            <div id="modal-content">
              ${options.content || '<div>No content provided</div>'}
            </div>
          </div>
          
          <script>
            // Handle control button clicks
            const closeButton = document.getElementById('close-button');
            const minimizeButton = document.getElementById('minimize-button');
            
            if (closeButton) {
              closeButton.addEventListener('click', () => {
                window.electronAPI?.floatingModal?.close();
              });
            }
            
            if (minimizeButton) {
              minimizeButton.addEventListener('click', () => {
                window.electronAPI?.floatingModal?.minimize();
              });
            }
            
            // Handle window dragging
            let isDragging = false;
            let startX = 0;
            let startY = 0;
            
            const header = document.getElementById('modal-header');
            
            header.addEventListener('mousedown', (e) => {
              isDragging = true;
              startX = e.clientX;
              startY = e.clientY;
            });
            
            document.addEventListener('mousemove', (e) => {
              if (!isDragging) return;
              
              const deltaX = e.clientX - startX;
              const deltaY = e.clientY - startY;
              
              window.electronAPI?.floatingModal?.move(deltaX, deltaY);
            });
            
            document.addEventListener('mouseup', () => {
              isDragging = false;
            });
          </script>
        </body>
      </html>
    `;

    // Load the HTML content
    window.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
    
    // Add debugging to verify preload script is loaded
    window.webContents.once('dom-ready', () => {
      window.webContents.executeJavaScript(`
        console.log('Floating Modal: DOM ready');
        console.log('Floating Modal: window.api available:', !!window.api);
        console.log('Floating Modal: window.api.send available:', !!(window.api && window.api.send));
        if (window.api) {
          console.log('Floating Modal: API methods:', Object.keys(window.api));
        }
      `).catch(console.error);
    });
  }

}

// Export singleton instance
export const floatingModalService = new FloatingModalService();
