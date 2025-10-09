/**
 * Generate HTML string directly for floating modal content
 * This is more reliable for floating modals since they need plain HTML
 */
export function generateFloatingModalHtml(
  secondsRemaining: number,
  wordCount: number,
  timeElapsed: string,
  modalId: string
): string {
  return `
    <div class="floating-distraction-warning">
      <!-- Warning Icon -->
      <div class="icon-container">
        <div class="warning-icon">⚠️</div>
      </div>

      <!-- Heading -->
      <h2 class="heading">Stay Focused?</h2>

      <!-- Main Message -->
      <p class="message">
        You are about to leave your writing session. If you switch away before reaching your goal, your progress will be marked as incomplete and your tree will wilt.
      </p>

      <!-- Countdown Timer -->
      <div class="countdown-container">
        <div class="countdown-label">Return within</div>
        <div class="countdown-timer">
          <span class="countdown-number">${typeof secondsRemaining === 'number' ? secondsRemaining : 10}</span>
          <span class="countdown-unit">seconds</span>
        </div>
        <div class="countdown-label">to keep your progress</div>
      </div>

      <!-- Current Stats -->
      <div class="stats-container">
        <div class="stat">
          <span class="stat-label">Words:</span>
          <span class="stat-value">${wordCount}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Time:</span>
          <span class="stat-value">${timeElapsed}</span>
        </div>
      </div>

      <!-- Tree Icon Placeholder -->
      <div class="tree-container">
        <div class="tree-icon">🌱</div>
      </div>

      <!-- Action Buttons -->
      <div class="button-container">
        <button id="return-button" class="return-button" onclick="handleReturn()">
          Return to Session
        </button>
        <button id="end-button" class="end-button" onclick="handleEndSession()">
          End Session Anyway
        </button>
      </div>
    </div>

    <style>
      .floating-distraction-warning {
        text-align: center;
        color: #f9fafb;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        padding: 8px;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      .icon-container {
        margin-bottom: 8px;
      }

      .warning-icon {
        font-size: 32px;
        display: inline-block;
        filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.3));
        animation: pulse 2s infinite;
      }

      @keyframes pulse {
        0%, 100% {
          transform: scale(1);
          filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.3));
        }
        50% {
          transform: scale(1.05);
          filter: drop-shadow(0 0 12px rgba(245, 158, 11, 0.5));
        }
      }

      .heading {
        color: #f9fafb;
        font-size: 20px;
        font-weight: 600;
        margin: 0 0 8px 0;
      }

      .message {
        color: #d1d5db;
        font-size: 14px;
        line-height: 1.4;
        margin: 0 0 16px 0;
      }

      .countdown-container {
        margin-bottom: 16px;
        padding: 12px;
        background-color: #374151;
        border-radius: 8px;
        border: 1px solid #f59e0b;
      }

      .countdown-label {
        color: #9ca3af;
        font-size: 14px;
        margin-bottom: 8px;
      }

      .countdown-timer {
        display: flex;
        align-items: baseline;
        justify-content: center;
        gap: 4px;
        margin: 12px 0;
      }

      .countdown-number {
        color: #f59e0b;
        font-size: 28px;
        font-weight: 700;
        text-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
      }

      .countdown-unit {
        color: #f59e0b;
        font-size: 18px;
        font-weight: 500;
      }

      .stats-container {
        display: flex;
        justify-content: center;
        gap: 24px;
        margin-bottom: 16px;
        padding: 12px;
        background-color: #374151;
        border-radius: 8px;
      }

      .stat {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
      }

      .stat-label {
        color: #9ca3af;
        font-size: 12px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .stat-value {
        color: #f9fafb;
        font-size: 18px;
        font-weight: 600;
      }

      .tree-container {
        margin-bottom: 16px;
      }

      .tree-icon {
        font-size: 24px;
        display: inline-block;
        filter: drop-shadow(0 0 4px rgba(245, 158, 11, 0.3));
      }

      .button-container {
        display: flex;
        gap: 12px;
        margin-bottom: 8px;
      }

      .return-button {
        flex: 1;
        background-color: #f59e0b;
        color: #1f2937;
        border: none;
        border-radius: 8px;
        padding: 12px 24px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 2px 4px rgba(245, 158, 11, 0.2);
      }

      .return-button:hover {
        background-color: #d97706;
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(245, 158, 11, 0.3);
      }

      .end-button {
        flex: 1;
        background-color: transparent;
        color: #9ca3af;
        border: 1px solid #4b5563;
        border-radius: 8px;
        padding: 12px 24px;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }

      .end-button:hover {
        background-color: #374151;
        color: #d1d5db;
        border-color: #6b7280;
      }
    </style>


    <script>
      function handleReturn() {
        // Send message to main window to handle return action
        window.api?.send('distraction-warning:return', '${modalId}');
      }

      function handleEndSession() {
        // Send message to main window to handle end session action
        window.api?.send('distraction-warning:end-session', '${modalId}');
      }
    </script>
  `;
}
