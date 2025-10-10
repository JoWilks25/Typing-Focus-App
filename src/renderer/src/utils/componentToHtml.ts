/**
 * Helper function to get tree emoji based on progress
 */
function getTreeEmoji(progress: number): string {
  if (progress < 34) return '🌱'; // Seedling
  if (progress < 67) return '🌿'; // Small tree
  return '🌳'; // Mature tree
}

/**
 * Helper function to get tree stage label based on progress
 */
function getTreeStageLabel(progress: number): string {
  if (progress < 34) return 'Seedling Stage';
  if (progress < 67) return 'Growing Tree';
  return 'Mature Tree';
}

/**
 * Generate HTML string directly for floating modal content
 * This is more reliable for floating modals since they need plain HTML
 */
export function generateFloatingModalHtml(
  secondsRemaining: number,
  wordCount: number,
  timeElapsed: string,
  modalId: string,
  treeProgress: number = 0
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

      <!-- Tree Progress Display -->
      <div class="tree-container">
        <div class="tree-progress">
          <div class="tree-icon-large">${getTreeEmoji(treeProgress)}</div>
          <div class="progress-label">${getTreeStageLabel(treeProgress)}</div>
          <div class="progress-bar-container">
            <div class="progress-bar-fill" style="width: ${Math.min(treeProgress, 100)}%"></div>
          </div>
          <div class="progress-percentage">${Math.floor(treeProgress)}% complete</div>
        </div>
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
        padding: 16px;
        background-color: rgba(55, 65, 81, 0.6);
        border-radius: 8px;
      }

      .tree-progress {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
      }

      .tree-icon-large {
        font-size: 48px;
        display: inline-block;
        filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.4));
        animation: treeGrow 0.5s ease-out;
      }

      @keyframes treeGrow {
        0% { transform: scale(0.9); opacity: 0.8; }
        100% { transform: scale(1); opacity: 1; }
      }

      .progress-label {
        color: #10b981;
        font-size: 14px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .progress-bar-container {
        width: 100%;
        height: 8px;
        background-color: rgba(55, 65, 81, 0.8);
        border-radius: 4px;
        overflow: hidden;
      }

      .progress-bar-fill {
        height: 100%;
        background: linear-gradient(90deg, #10b981, #34d399);
        border-radius: 4px;
        transition: width 0.3s ease-out;
      }

      .progress-percentage {
        color: #d1d5db;
        font-size: 12px;
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
      console.log('Modal: Script starting...');
      
      let countdownTimer = null;
      let countdownValue = ${typeof secondsRemaining === 'number' ? secondsRemaining : 10};
      
      console.log('Modal: Initial countdown value:', countdownValue);
      console.log('Modal: Document ready state:', document.readyState);
      
      // Start countdown timer when page loads
      function startCountdown() {
        try {
          console.log('Modal: Starting countdown timer');
          const countdownElement = document.querySelector('.countdown-number');
          console.log('Modal: Countdown element found:', !!countdownElement);
          
          if (!countdownElement) {
            console.error('Modal: Countdown element not found!');
            return;
          }
          
          console.log('Modal: Setting up interval timer');
          countdownTimer = setInterval(() => {
            try {
              countdownValue--;
              console.log('Modal: Countdown tick:', countdownValue);
              countdownElement.textContent = countdownValue;
              
              if (countdownValue <= 0) {
                console.log('Modal: Countdown expired, ending session');
                clearInterval(countdownTimer);
                // Auto-end session when countdown reaches 0
                handleEndSession();
              }
            } catch (error) {
              console.error('Modal: Error in countdown tick:', error);
            }
          }, 1000);
        } catch (error) {
          console.error('Modal: Error in startCountdown:', error);
        }
      }
      
      function handleReturn() {
        // Clear countdown timer
        if (countdownTimer) {
          clearInterval(countdownTimer);
          countdownTimer = null;
        }
        
        // Get modal ID from global variable or use the one from template
        const modalId = window.currentModalId || '${modalId}';
        console.log('Modal: Sending return action with modalId:', modalId);
        if (window.api && window.api.send) {
          window.api.send('distraction-warning:return', modalId);
        } else {
          console.error('Modal: window.api.send not available');
        }
      }

      function handleEndSession() {
        // Clear countdown timer
        if (countdownTimer) {
          clearInterval(countdownTimer);
          countdownTimer = null;
        }
        
        // Get modal ID from global variable or use the one from template
        const modalId = window.currentModalId || '${modalId}';
        console.log('Modal: Sending end session action with modalId:', modalId);
        if (window.api && window.api.send) {
          window.api.send('distraction-warning:end-session', modalId);
        } else {
          console.error('Modal: window.api.send not available');
        }
      }
      
      // Start countdown when DOM is ready
      try {
        console.log('Modal: Document ready state:', document.readyState);
        
        if (document.readyState === 'loading') {
          console.log('Modal: Document still loading, waiting for DOMContentLoaded');
          document.addEventListener('DOMContentLoaded', startCountdown);
        } else {
          console.log('Modal: Document already loaded, starting countdown immediately');
          startCountdown();
        }
        
        // Also try starting after a short delay as backup
        setTimeout(() => {
          console.log('Modal: Backup countdown start attempt');
          if (!countdownTimer) {
            startCountdown();
          }
        }, 500);
      } catch (error) {
        console.error('Modal: Error in countdown initialization:', error);
      }
    </script>
  `;
}
