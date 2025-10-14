// src/main/services/InactivityService.ts
// Purpose: Track typing activity and detect 3-minute inactivity threshold

import { EventEmitter } from 'events';
import type { BrowserWindow } from 'electron';

export class InactivityService extends EventEmitter {
  private lastTypingTimestamp: number = 0;
  private inactivityTimer: NodeJS.Timeout | null = null;
  private readonly INACTIVITY_THRESHOLD = 60000; // 1 minute (60 seconds)
  private mainWindow: BrowserWindow | null = null;
  private isTracking: boolean = false;

  /**
   * Set the main window reference for sending events to renderer
   */
  setMainWindow(window: BrowserWindow): void {
    this.mainWindow = window;
  }

  /**
   * Start tracking inactivity for a session
   */
  startTracking(): void {
    this.isTracking = true;
    this.resetInactivityTimer();
  }

  /**
   * Stop tracking inactivity (when session ends)
   */
  stopTracking(): void {
    this.isTracking = false;
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }

  /**
   * Reset the inactivity timer when typing activity is detected
   */
  resetInactivityTimer(): void {
    if (!this.isTracking) {
      return;
    }

    // Clear existing timer
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }

    // Update last typing timestamp
    this.lastTypingTimestamp = Date.now();

    // Set new timeout for INACTIVITY_THRESHOLD
    this.inactivityTimer = setTimeout(() => {
      this.handleInactivityDetected();
    }, this.INACTIVITY_THRESHOLD);

    console.log('Inactivity timer reset - next check in 1 minute');
  }

  /**
   * Handle when inactivity threshold is reached
   */
  private handleInactivityDetected(): void {
    if (!this.isTracking || !this.mainWindow) {
      return;
    }

    console.log('Inactivity detected - showing pause modal');
    
    // Send event to renderer to show inactivity modal
    this.mainWindow.webContents.send('show-inactivity-modal');
    
    // Emit event for other services to listen
    this.emit('inactivity-detected');
  }

  /**
   * Get the last typing timestamp
   */
  getLastTypingTimestamp(): number {
    return this.lastTypingTimestamp;
  }

  /**
   * Check if currently tracking
   */
  isCurrentlyTracking(): boolean {
    return this.isTracking;
  }
}

// Export singleton instance
export const inactivityService = new InactivityService();
