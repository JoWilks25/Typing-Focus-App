// src/main/services/FocusMonitorService.ts
// Purpose: Monitor window focus/blur events and trigger distraction warnings

import { EventEmitter } from 'events';
import type { BrowserWindow } from 'electron';
import type { SessionManager } from './sessionManager';

export class FocusMonitorService extends EventEmitter {
  private mainWindow: BrowserWindow | null = null;
  private sessionManager: SessionManager | null = null;
  private isMonitoring: boolean = false;
  private countdownTimer: NodeJS.Timeout | null = null;
  private countdownInterval: NodeJS.Timeout | null = null;
  private readonly COUNTDOWN_DURATION = 10; // 10 seconds
  private currentCountdown: number = 0;

  /**
   * Set the main window reference for monitoring focus events
   */
  setMainWindow(window: BrowserWindow): void {
    this.mainWindow = window;
  }

  /**
   * Set the session manager reference for checking active sessions
   */
  setSessionManager(sessionManager: SessionManager): void {
    this.sessionManager = sessionManager;
  }

  /**
   * Start monitoring window focus/blur events
   */
  startMonitoring(): void {
    if (!this.mainWindow || this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;
    
    // Attach event listeners
    this.mainWindow.on('blur', this.handleBlur.bind(this));
    this.mainWindow.on('focus', this.handleFocus.bind(this));
    
    console.log('Focus monitoring started');
  }

  /**
   * Stop monitoring window focus/blur events
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;
    this.clearCountdown();
    
    if (this.mainWindow) {
      this.mainWindow.removeListener('blur', this.handleBlur.bind(this));
      this.mainWindow.removeListener('focus', this.handleFocus.bind(this));
    }
    
    console.log('Focus monitoring stopped');
  }

  /**
   * Handle window blur event - start distraction countdown
   */
  private handleBlur(): void {
    if (!this.isMonitoring || !this.mainWindow) {
      return;
    }

    // Check if there's an active session before triggering distraction warning
    if (!this.sessionManager || !this.sessionManager.getActiveSession()) {
      console.log('Window blur detected but no active session - ignoring');
      return;
    }

    console.log('Window blur detected - starting distraction countdown');
    
    // Start 10-second countdown
    this.startCountdown();
    
    // Send event to renderer to show distraction warning
    console.log('Sending show-distraction-warning event to renderer');
    this.mainWindow.webContents.send('show-distraction-warning');
    
    // Emit event for other services to listen
    this.emit('distraction-detected');
  }

  /**
   * Handle window focus event - clear distraction countdown
   */
  private handleFocus(): void {
    if (!this.isMonitoring || !this.mainWindow) {
      return;
    }

    console.log('Window focus detected - clearing distraction countdown');
    
    // Clear countdown
    this.clearCountdown();
    
    // Send event to renderer to dismiss distraction warning
    console.log('Sending dismiss-distraction-warning event to renderer');
    this.mainWindow.webContents.send('dismiss-distraction-warning');
    
    // Emit event for other services to listen
    this.emit('distraction-cleared');
  }

  /**
   * Start the 10-second countdown
   */
  private startCountdown(): void {
    this.clearCountdown(); // Clear any existing countdown
    
    this.currentCountdown = this.COUNTDOWN_DURATION;
    
    // Send initial countdown value
    if (this.mainWindow) {
      this.mainWindow.webContents.send('update-countdown', this.currentCountdown);
    }
    
    // Set up countdown interval (update every second)
    this.countdownInterval = setInterval(() => {
      this.currentCountdown--;
      
      if (this.mainWindow) {
        this.mainWindow.webContents.send('update-countdown', this.currentCountdown);
      }
      
      if (this.currentCountdown <= 0) {
        this.handleCountdownExpired();
      }
    }, 1000);
    
    // Set up main countdown timer (backup)
    this.countdownTimer = setTimeout(() => {
      this.handleCountdownExpired();
    }, this.COUNTDOWN_DURATION * 1000);
  }

  /**
   * Clear the countdown timer and interval
   */
  private clearCountdown(): void {
    if (this.countdownTimer) {
      clearTimeout(this.countdownTimer);
      this.countdownTimer = null;
    }
    
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
    
    this.currentCountdown = 0;
  }

  /**
   * Handle when countdown expires - session is abandoned
   */
  private handleCountdownExpired(): void {
    if (!this.isMonitoring) {
      return;
    }

    console.log('Distraction countdown expired - session abandoned');
    
    this.clearCountdown();
    
    // Send event to renderer that session is abandoned
    if (this.mainWindow) {
      this.mainWindow.webContents.send('session-abandoned');
    }
    
    // Emit event for other services to listen
    this.emit('session-abandoned');
  }

  /**
   * Check if currently monitoring
   */
  isCurrentlyMonitoring(): boolean {
    return this.isMonitoring;
  }

  /**
   * Get current countdown value
   */
  getCurrentCountdown(): number {
    return this.currentCountdown;
  }
}

// Export singleton instance
export const focusMonitorService = new FocusMonitorService();
