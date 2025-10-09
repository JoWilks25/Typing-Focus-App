/**
 * Test Configuration
 * 
 * This file contains configuration values that can be easily changed for testing purposes.
 * After making changes, restart the application for the changes to take effect.
 */

export const TEST_CONFIG = {
  /**
   * Distraction Warning Countdown Duration (in seconds)
   * 
   * This controls how long the user has to return to the app before the session is abandoned.
   * 
   * Examples:
   * - 5: 5 seconds (for quick testing)
   * - 10: 10 seconds (default)
   * - 30: 30 seconds (for slower testing)
   * - 60: 1 minute (for very slow testing)
   */
  DISTRACTION_COUNTDOWN_DURATION: 10,
  
  /**
   * Inactivity Timeout (in minutes)
   * 
   * This controls how long the user can be inactive before the inactivity modal appears.
   * 
   * Examples:
   * - 0.5: 30 seconds (for quick testing)
   * - 3: 3 minutes (default)
   * - 5: 5 minutes (for slower testing)
   */
  INACTIVITY_TIMEOUT_MINUTES: 3,
} as const;

/**
 * Helper function to get countdown duration in milliseconds
 */
export function getCountdownDurationMs(): number {
  return TEST_CONFIG.DISTRACTION_COUNTDOWN_DURATION * 1000;
}

/**
 * Helper function to get inactivity timeout in milliseconds
 */
export function getInactivityTimeoutMs(): number {
  return TEST_CONFIG.INACTIVITY_TIMEOUT_MINUTES * 60 * 1000;
}
