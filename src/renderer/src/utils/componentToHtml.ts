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
    <div class="text-center text-gray-50 font-sans p-2 h-full flex flex-col justify-between">
      <!-- Warning Icon -->
      <div class="mb-2">
        <div class="text-3xl inline-block drop-shadow-[0_0_8px_rgba(245,158,11,0.3)] animate-pulse">⚠️</div>
      </div>

      <!-- Heading -->
      <h2 class="text-gray-50 text-xl font-semibold mb-2">Stay Focused?</h2>

      <!-- Main Message -->
      <p class="text-gray-300 text-sm leading-snug mb-4">
        You are about to leave your writing session. If you switch away before reaching your goal, your progress will be marked as incomplete and your tree will wilt.
      </p>

      <!-- Countdown Timer -->
      <div class="mb-4 p-3 bg-gray-700 rounded-lg border border-amber-500">
        <div class="text-gray-400 text-sm mb-2">Return within</div>
        <div class="flex items-baseline justify-center gap-1 my-3">
          <span class="countdown-number text-amber-500 text-3xl font-bold drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">${typeof secondsRemaining === 'number' ? secondsRemaining : 10}</span>
          <span class="text-amber-500 text-lg font-medium">seconds</span>
        </div>
        <div class="text-gray-400 text-sm">to keep your progress</div>
      </div>

      <!-- Current Stats -->
      <div class="flex justify-center gap-6 mb-4 p-3 bg-gray-700 rounded-lg">
        <div class="flex flex-col items-center gap-1">
          <span class="text-gray-400 text-xs font-medium uppercase tracking-wider">Words:</span>
          <span class="text-gray-50 text-lg font-semibold">${wordCount}</span>
        </div>
        <div class="flex flex-col items-center gap-1">
          <span class="text-gray-400 text-xs font-medium uppercase tracking-wider">Time:</span>
          <span class="text-gray-50 text-lg font-semibold">${timeElapsed}</span>
        </div>
      </div>

      <!-- Tree Icon Placeholder -->
      <div class="mb-4">
        <div class="text-2xl inline-block drop-shadow-[0_0_4px_rgba(245,158,11,0.3)]">🌱</div>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-3 mb-2">
        <button id="return-button" class="flex-1 bg-amber-500 text-gray-800 border-none rounded-lg py-3 px-6 text-base font-semibold cursor-pointer transition-all duration-200 shadow-[0_2px_4px_rgba(245,158,11,0.2)] hover:bg-amber-600 hover:-translate-y-0.5 hover:shadow-[0_4px_8px_rgba(245,158,11,0.3)]" onclick="handleReturn()">
          Return to Session
        </button>
        <button id="end-button" class="flex-1 bg-transparent text-gray-400 border border-gray-600 rounded-lg py-3 px-6 text-base font-medium cursor-pointer transition-all duration-200 hover:bg-gray-700 hover:text-gray-300 hover:border-gray-500" onclick="handleEndSession()">
          End Session Anyway
        </button>
      </div>
    </div>


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
