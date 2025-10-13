# v2

# User Stories & Acceptance Criteria - Draft Tree V1

## 1. Writing Session & Goal Setting

### User Story

As a writer, I want to set a word count or time goal before a session so that I can track my progress and feel accomplished when I hit my targets.

### Acceptance Criteria

- The app displays a session setup screen on launch or when starting a new session
- User must choose between two goal types:
    - **Word Count Goal**: Input field for target word count (e.g., 500 words)
    - **Time Goal**: Input field for target duration (e.g., 30 minutes)
- Goal type selection is mutually exclusive (toggle or tab interface)
- Recommended ranges are displayed: "15-30 min or 250-500 words for focused sessions"
- "Start Writing" button is disabled until a valid goal is entered
- Upon clicking "Start Writing", the session immediately begins
- Word count and/or timer displays update live during the session based on goal type
- On reaching the goal:
    - Tree displays at full mature state
    - Celebration animation plays (if implemented)
    - Session automatically marked as "completed"
    - Statistics dashboard updates with session data
- The session end status (completed/incomplete) is persisted to local storage
- All session data is immediately visible on the dashboard after session ends

---

## 2. Tree Animation - Growth During Session

### User Story

As a writer, I want to see my tree grow gradually as I make progress toward my goal so that I feel motivated and can visualize my advancement.

### Acceptance Criteria

- Tree animation is visible in the sidebar/panel during active writing session
- Tree has **three distinct growth states**:
    - **Seedling** (0-33% progress): Small sprout emerging from ground
    - **Small Tree** (34-66% progress): Young tree with visible trunk and branches
    - **Mature Tree** (67-100% progress): Full healthy tree with complete foliage
- Growth is calculated based on goal type:
    - **Word Count Goal**: Progress = (current word count / target word count) × 100
    - **Time Goal**: Progress = (elapsed time / target time) × 100
- Tree smoothly transitions between growth stages with animated interpolation (0.5-1 second transition)
- Animation updates are responsive to writing activity (no lag or blocking)
- Tree growth is incremental and continuous (not discrete jumps)
- When goal is reached (100% progress), tree displays at full mature state
- Tree state persists if user navigates within app (doesn't reset unless session ends)

---

## 3. Inactivity Detection & Session Pause

### User Story

As a writer, I want to be notified if I stop typing for too long so that my session timer remains accurate and I can decide whether to continue or end my session.

### Acceptance Criteria

- App monitors keyboard input during active writing sessions
- If **no typing detected for 3 consecutive minutes**, inactivity modal is triggered
- Session timer automatically pauses when inactivity modal appears
- **Inactivity Modal displays:**
    - Pause icon (visual indicator)
    - Heading: "Session Paused"
    - Message: "We noticed you haven't typed for a while. Your timer has been paused to keep your session time accurate. Ready to continue?"
    - Subtext: "Your progress is safe—no penalties applied."
    - Current session stats: word count, time elapsed
    - Small tree icon showing current growth state (unchanged)
    - "Paused for [X] minutes" counter
    - Two action buttons:
        - **"Resume Writing"** (primary, dark button)
        - **"End Session"** (secondary, outlined button)
    - Bottom hint: "Taking a thinking break is normal! Press Space or Enter to resume quickly."
- If user clicks **"Resume Writing"** or presses Space/Enter or starts typing:
    - Modal dismisses immediately
    - Session timer resumes from paused point
    - Session continues normally with no penalty
    - Tree remains at current growth state
- If user clicks **"End Session"**:
    - Session ends immediately
    - If goal was NOT reached: session marked as "incomplete" and wilt/death animation plays
    - If goal WAS reached: session marked as "completed" (normal ending)
- **No tree wilting occurs from inactivity alone**
- Inactivity threshold is hardcoded at 3 minutes (not user-configurable in V1)
- Multiple inactivity pauses can occur in a single session without penalty

---

## 4. Focus Monitoring & Distraction Warning

### User Story

As a writer, I want to receive a warning if I try to leave the app during my session so that I stay focused and understand the consequences of abandoning my work.

### Acceptance Criteria

- App detects when user attempts to:
    - Switch to another application
    - Minimize the app window
    - Navigate away from the app (Cmd+Tab, clicking outside window, etc.)
- When focus loss is detected during active session, **Distraction Warning Modal** appears immediately
- Background dims/blurs to emphasize modal
- **Distraction Warning Modal displays:**
    - Warning icon (⚠️ or similar)
    - Heading: "Stay Focused?"
    - Message: "You are about to leave your writing session. If you switch away before reaching your goal, your progress will be marked as incomplete and your tree will wilt."
    - Countdown timer: "Return within **10 seconds** to keep your progress."
    - Small tree icon showing current growth state (visual "at risk" indicator)
    - Live countdown: "10 seconds remaining" → "9 seconds remaining" → etc.
    - Two action buttons:
        - **"Return to Session"** (primary, dark button)
        - **"End Session Anyway"** (secondary, outlined button)
- **10-second countdown** begins immediately when modal appears
- Countdown is displayed prominently and updates every second
- If user clicks **"Return to Session"** OR returns focus to app before countdown ends:
    - Modal dismisses
    - Session continues normally
    - No penalty applied
    - Tree remains at current growth state
    - No record of distraction event in session data
- If user clicks **"End Session Anyway"**:
    - Session ends immediately
    - Wilt/death animation plays (since goal not reached)
    - Session marked as "incomplete"
- If countdown reaches zero (user did not return):
    - Session is marked as "abandoned"
    - When app regains focus or is next opened, wilt/death animation plays
    - Session data recorded with "abandoned" status
- Warning appears every time focus is lost (no cooldown or "don't show again" option in V1)

---

## 5. Penalty Animation - Tree Wilt/Death

### User Story

As a writer, I want to see my tree wilt and die if I end a session before completing my goal so that I'm motivated to follow through on my commitments.

### Acceptance Criteria

- Wilt/death animation is triggered **only when session ends before goal completion**
- Animation triggers in two scenarios:
    1. User manually ends session before reaching goal (via "End Session" button in any modal)
    2. User abandons session after distraction warning countdown expires
- **Wilt/Death Animation Sequence:**
    - Duration: 2-3 seconds total
    - Gradual animated transition from current tree state
    - Visual progression: healthy leaves → wilting/drooping → browning → bare branches OR fallen tree
    - Animation is smooth and emotionally impactful (not abrupt)
- Animation plays in full before showing session summary or returning to dashboard
- Animation cannot be skipped or closed early (user must see consequence)
- After animation completes:
    - Session marked as "incomplete" in database
    - Dashboard shows wilted/dead tree icon for that session
    - Session summary displays with completion status: "Goal not reached"
- **No wilt animation occurs** if:
    - User completes goal before ending session
    - User pauses due to inactivity (only ending early triggers penalty)
- Wilt/death animation assets are pre-loaded to ensure smooth playback
- Animation state is persisted (doesn't replay if user reopens app after seeing it once)

---

## 6. Text Editor & Writing Interface

### User Story

As a writer, I want a distraction-free editor that lets me focus solely on writing with minimal UI elements during my session.

### Acceptance Criteria

- Editor takes up majority of screen real estate (main content area)
- Plain text input only (no rich text formatting in V1)
- Editor uses Tiptap configured for plain text editing
- Placeholder text: "Start writing... Let your thoughts flow freely."
- **Live Session Stats Panel** (right sidebar or top-right corner):
    - **Words**: Current word count updates live as user types
    - **Time**: Elapsed time in MM:SS format (updates every second)
    - **Goal**: Displays goal type and target (e.g., "500 words" or "30 minutes")
    - Progress bar visualization (fills as progress increases)
- **Autosave Indicator** (bottom-left):
    - "Auto-save enabled" with green dot
    - "Last saved: X minutes ago" timestamp
- **Tree Animation Panel** (bottom-right or side panel):
    - Displays current tree growth state
    - Updates smoothly as progress increases
    - "Focus Tree" heading above animation
- Minimal header bar with:
    - App name/logo
    - View toggle (eye icon for hiding/showing UI elements)
    - Dark mode toggle (moon icon)
    - Settings gear icon
- No distracting notifications, pop-ups, or UI changes during active writing
- Editor supports basic keyboard shortcuts:
    - Cmd/Ctrl+S: Manual save
    - Cmd/Ctrl+Q: Quit/End session (triggers end session flow)

---

## 7. Session Setup & Configuration Screen

### User Story

As a writer, I want an intuitive setup screen where I can configure my session goal and see my progress history before starting.

### Acceptance Criteria

- Session setup screen displays when:
    - App first launches (no active session)
    - User navigates back from completed session
    - User clicks "Start New Session" from dashboard
- **Left Panel - Goal Configuration:**
    - Heading: "Ready to Write?"
    - Subheading: "Set your goal and let's grow something great together"
    - Section: "Choose your goal type"
    - Two toggle buttons:
        - **"Word Count Goal"** (book icon)
        - **"Time Goal"** (clock icon)
    - Input field:
        - Word Count Goal: "500 words" (editable number input)
        - Time Goal: Minutes selector or time picker
    - Help text: "Recommended: 15-30 min or 250-500 words for focused sessions"
    - Expandable "Advanced Options" (collapsed by default, for future features)
    - **"Start Writing"** button (prominent, dark, full-width)
        - Disabled state if no goal selected
        - Shows "Press Enter ↵" hint when enabled
- **Right Panel - Progress Dashboard:**
    - Day streak counter (large number in circle)
    - "Day Streak" label
    - "Keep it going!" motivational text
    - **This Week Stats:**
        - Total words written (e.g., "1,247 words")
        - Completion rate percentage with progress bar (e.g., "85%")
    - **Last Session Summary:**
        - Words and time (e.g., "523 words in 22 min")
        - Checkmark icon if completed
    - **Tree visualization:**
        - Shows tree in current state based on overall progress/streak
        - "Your progress tree" label
        - Motivational text: "You're on fire!" 🔥
- Back arrow button (top-left) to return to main menu/dashboard if implemented
- Settings gear icon (top-right) for app preferences

---

## 8. Autosave & File Recovery

### User Story

As a writer, I want my work to be automatically saved so that I never lose progress even if the app crashes or I forget to manually save.

### Acceptance Criteria

- Autosave triggers automatically every **30 seconds** during active writing session
- Autosave occurs silently in background (no interruption to typing)
- Visual indicator updates after each save: "Last saved: X seconds/minutes ago"
- Autosave status indicator shows green dot when autosave is active
- If app crashes or is force-quit:
    - Unsaved work is preserved in temporary recovery file
    - On next app launch, recovery modal appears:
        - "Unsaved Work Found"
        - Shows timestamp of crashed session
        - Shows word count of recovered content
        - Two options:
            - **"Recover Session"** (primary) - loads content into editor
            - **"Discard"** (secondary) - deletes recovery file
- If user chooses "Recover Session":
    - Editor loads recovered content
    - Session is NOT automatically resumed (user must set new goal)
    - Word count from recovered content is displayed but not counted toward new goal
- Recovery file is deleted after successful recovery or manual discard
- Autosave writes to dedicated temp directory (not overwriting existing saved files)
- Autosave includes:
    - Editor content (plain text)
    - Session metadata (start time, goal type, goal value)
    - Current progress (word count, time elapsed)

---

## 9. File Import & Export

### User Story

As a writer, I want to import existing text files to continue working on them and export my drafts when finished so that I can manage my writing outside the app.

### Acceptance Criteria

**Import Functionality:**

- User can import files via:
    - Menu: File → Open (Cmd/Ctrl+O)
    - Welcome screen: "Open Existing File" button
    - Drag-and-drop .txt file onto app window
- Only **.txt (plain text)** files are supported in V1
- Non-.txt files show error: "Only plain text (.txt) files are supported"
- When file is successfully imported:
    - File content loads into editor
    - File name displayed in header or title area
    - Initial word count calculated and stored
    - User must still set a session goal before starting new session
    - Imported word count does NOT count toward session goal (goal tracks NEW words written)
- If imported file is empty, editor shows with placeholder text
- Import replaces current editor content (warning modal if unsaved changes exist)

**Export Functionality:**

- User can export/save via:
    - Menu: File → Save As (Cmd/Ctrl+Shift+S)
    - Menu: File → Export
    - "Save Draft" button in session end summary
- Export triggers native system file picker dialog
- Default filename: "Draft Tree - [Date].txt" (e.g., "Draft Tree - Oct 7 2025.txt")
- User can choose:
    - Custom filename
    - Save location
    - File format (only .txt available in V1)
- Export saves current editor content as plain text file
- After successful export:
    - Confirmation message: "Draft saved successfully"
    - File path displayed (truncated if too long)
- Export does not end current session (writing can continue)
- Editor content remains unchanged after export (no clearing)

---

## 10. Progress Dashboard & Statistics

### User Story

As a writer, I want to view my writing history, streaks, and statistics so that I can track my progress and stay motivated.

### Acceptance Criteria

- Dashboard is accessible via:
    - App launch (if no active session)
    - Session setup screen (right panel)
    - Menu: View → Dashboard
- **Dashboard displays:**
    - **Day Streak Counter:**
        - Large number showing consecutive days with completed sessions
        - Fire icon 🔥 if streak is active
        - "Day Streak" label
        - Motivational text: "Keep it going!" or "You're on fire!"
    - **Weekly Summary:**
        - Total words written this week (e.g., "1,247 words")
        - Number of sessions completed this week
        - Completion rate percentage (e.g., "85%")
        - Visual progress bar for completion rate
    - **Last Session:**
        - Word count and duration (e.g., "523 words in 22 min")
        - Completion status icon (✓ or ✗)
        - Tree state icon (mature tree or wilted tree)
        - Timestamp: "2 hours ago" or specific date/time
    - **Tree Visualization:**
        - Visual representation of progress tree
        - Reflects overall streak/progress health
        - "Your progress tree" label
        - Shows current tree state based on recent performance
- **Session History List** (if space allows or in separate view):
    - Chronological list of past sessions
    - Each entry shows:
        - Date and time
        - Goal type and target
        - Words written
        - Duration
        - Completion status (completed/incomplete/abandoned)
        - Tree state icon
- All statistics calculate from local session data
- Dashboard refreshes automatically when returning from completed session
- No cloud sync in V1 (all data local only)

---

## 11. Session End & Summary

### User Story

As a writer, I want to see a summary of my session when I finish so that I understand my accomplishment and how it affects my progress.

### Acceptance Criteria

- Session end is triggered by:
    - Reaching goal (automatic completion)
    - Clicking "End Session" button in any modal
    - Abandoning session (countdown expiry)
- **Session Summary Modal displays:**
    - Completion status heading:
        - "Goal Reached!" (if completed) with celebration icon
        - "Session Ended Early" (if incomplete) with neutral icon
    - **Session Statistics:**
        - Words written: "[X] words"
        - Time elapsed: "[X] minutes"
        - Goal: "[original goal type and value]"
        - Completion percentage (e.g., "achieved 95%" or "completed 100%")
    - Tree animation result:
        - If completed: mature tree displayed (static or subtle animation)
        - If incomplete: wilt/death animation plays before summary appears
    - **Action Buttons:**
        - **"View Dashboard"** - navigates to progress dashboard
        - **"Start New Session"** - navigates to session setup
        - **"Save Draft"** (optional) - triggers export dialog
- Session data is saved to local database before summary appears:
    - Session ID (unique)
    - Start timestamp
    - End timestamp
    - Duration (seconds)
    - Goal type (word/time)
    - Goal value (target number)
    - Words written
    - Completion status (completed/incomplete/abandoned)
    - Distraction events count
    - Inactivity pauses count
    - Final tree state
- Summary cannot be dismissed without choosing an action
- Statistics on dashboard update immediately to reflect new session data

---

**Document Version:** 2.0 (Updated October 7, 2025)

**Status:** Aligned with PRD V2

**Next Steps:** Generate Tech Spec V2 and begin JIRA ticket creation

---

## Out of Scope for V1

The following user stories from the original document are **NOT included in V1 MVP**:

- ~~Cross-device sync and focus enforcement~~
- ~~Multi-device notification system~~
- ~~Customizable penalty severity settings~~
- ~~Customizable inactivity thresholds~~
- ~~Grace period configuration~~
- ~~Sound effects for animations~~
- ~~Advanced streak recovery mechanics~~
- ~~Exportable statistics reports~~
- ~~Cloud storage integration~~