## Typing Focus App — User Stories and Acceptance Criteria (UAT)

This document consolidates end-to-end user stories with concrete, testable acceptance criteria. Stories are grouped by feature area to streamline manual testing and align with current code behavior.

Note: Where the current implementation and prior docs diverge, this file reflects the behavior in code. Clarifying questions at the end highlight decisions needed to finalize behavior and docs consistency.

### 1) Application Load & Navigation

- As a user, I want to see navigation with clear entry points when the app opens.
  - Acceptance:
    - App shows `New Session` and `Editor View` buttons in the navbar.
    - `Editor View` is disabled when there is no active session.
    - Clicking `New Session` shows the session setup view when not in an active editor session.
    - Attempting to access the editor without an active session routes back to `Session Setup`.

### 2) Session Setup — New File

- As a user, I want to configure a new session and save location before writing.
  - Acceptance:
    - Goal type selection is available: `Word` or `Time`.
    - For `Word` goals: input validated against min 100 and max 10,000 words.
    - For `Time` goals: input validated against min 5 and max 480 minutes.
    - Invalid goals disable the `Start Writing` button.
    - Filename can be customized and must end with `.txt` (renderer validation). Start button disabled when invalid.
    - Save directory can be selected; default directory loads on mount.
    - On submit with valid inputs, a new session is created, initial file written (empty content), and user is routed to the editor.
    - The chosen file path is used for subsequent saves.

### 3) Session Setup — Load Existing File

- As a user, I want to continue writing in an existing `.txt` file.
  - Acceptance:
    - Recent files list is shown (if any).
    - Selecting a recent file loads initial content and calculates initial word count.
    - Alternatively, choosing a file via dialog allows selecting a valid `.txt` file.
    - On successful selection, a session starts with `initialWordCount` equal to the loaded file’s word count; editor opens with that content.
    - Goal progress for word goals counts only new words written beyond `initialWordCount`.
    - Autosaved files are discoverable via Load Existing and can be opened like any other `.txt` file.

### 4) Editor View — Core Editing & Display

- As a user, I want an editor with immediate feedback on words, time, and progress.
  - Acceptance:
    - Editor loads current session content and focuses if content is empty.
    - Word count updates live as the user types.
    - Session timer shows total duration since start; updates every second while active.
    - Pause indicator behavior: timer indicator shown only when editor is focused and session is active.
    - Goal display shows selected goal and numeric target.
    - Progress bar reflects goal completion percentage:
      - For word goals: based on new words only (total − initialWordCount, min 0).
      - For time goals: based on elapsed time vs goal minutes.

### 5) Editor View — Time Goal Behavior (Added)

- As a user with a time-based goal, I want progress and completion determined by elapsed time.
  - Acceptance:
    - Progress increases with elapsed time and caps at 100% at `goalValue` minutes.
    - Completion is achieved when elapsed time ≥ goal minutes, independent of word count.
    - Completion modal appears (first time only) with elapsed time and goal minutes displayed.

### 6) Autosave & Manual Save

- As a user, I want my work to be saved reliably.
  - Acceptance:
    - Typing triggers debounced backend content updates (after short inactivity window).
    - `Cmd+S` manually saves current content to the active file path.
    - Ending a session saves final content to the file path.

### 7) Tree Animation & Progress Visualization

- As a user, I want visual feedback that represents my progress.
  - Acceptance:
    - Tree starts from initial state (no trees/seedling) at 0%.
    - Tree growth corresponds to progress percentage.
    - At 100%, tree shows fully grown state.

### 8) Completion Modal (Word or Time Goal)

- As a user, I want positive feedback and options when I reach my goal.
  - Acceptance:
    - Completion modal appears exactly once the first time 100% is reached in a session.
    - Modal shows: current word count, elapsed time, and the configured goal value and type.
    - `Keep Writing` dismisses the modal and leaves the session active.
    - `End Session` saves content and routes to Session Summary.
    - Note: Time-goal specific copy differences (vs word-goal) are a future enhancement.

### 9) Inactivity Modal

- As a user, I want the app to pause the session timer when I stop typing for a period.
  - Acceptance:
    - Inactivity threshold is 1 minute of no typing (current code).
    - When threshold is reached, the inactivity modal shows and the session timer pauses.
    - `Resume Writing` dismisses the modal, resumes the session, and resets inactivity tracking.
    - `End Session` ends the session and routes to summary.
    - No penalty animations occur due to inactivity alone.

### 10) Distraction Warning (Focus Loss)

- As a user, I want a warning if I navigate away during a session.
  - Acceptance:
    - When the app window loses focus during an active session, a distraction warning modal appears.
    - A 10-second countdown begins immediately and is visible to the user.
    - `Return to Session` dismisses the warning and increments distraction count.
    - If the user selects `End Session Anyway`, the session ends immediately and is marked as `abandoned`.
    - If the countdown expires without returning, the session ends and is marked as `incomplete`, then routes to summary.

### 11) Session End & Summary

- As a user, I want a clear summary of my session after I finish or abandon it.
  - Acceptance:
    - Ending the session (via completion modal, inactivity modal, or explicit End) saves final content.
    - Summary view shows: completion status (`completed`, `incomplete`, or `abandoned`), progress %, elapsed time, and distraction count.
    - For loaded files with initial content, `new words` are reflected in stats and completion.

### 12) File I/O & Validation

- As a user, I want file operations to be safe and predictable.
  - Acceptance:
    - New sessions write a `.txt` file at the chosen path; subsequent saves write to the same path.
    - Loading an existing file reads content and computes initial word count.
    - Renderer prevents starting with invalid filename or path.
    - (Recommendation) Main process validates that the file path ends with `.txt` before writing.

### 13) Notifications & Messages

- As a user, I want clear confirmation when important actions succeed.
  - Acceptance:
    - On starting a session from an existing file, show a success message including word count and full path.
    - On starting a new file session, show a success message indicating goal and path.
    - On manual save, show a short toast indicating the file was saved and where.

### 14) Error Handling

- As a user, I want graceful handling of invalid inputs or system errors.
  - Acceptance:
    - Invalid goals disable the Start button and do not create sessions.
    - If session creation fails (IPC error), an error is logged and the user remains on setup.
    - If saving fails, an error is logged; the user can retry.

### 15) Accessibility & Shortcuts (Future)

- Not in MVP scope. Basic hints like `Cmd+S` may be shown, but expanded shortcuts (e.g., Esc to close modals) are future enhancements.

---

## Test Checklists by Category

Use these for quick manual validation.

### A) Navigation & Load
- App opens with `New Session` highlighted; `Editor View` disabled with tooltip.
- Without active session, navigating to `Editor View` redirects to `Session Setup`.

### B) Session Setup — New
- Word goal: try 99 (blocked), 100 (ok), 10,001 (blocked), 10,000 (ok).
- Time goal: try 4 (blocked), 5 (ok), 481 (blocked), 480 (ok).
- Invalid filename (no `.txt`) disables Start.
- Valid filename and directory starts session and opens editor.

### C) Session Setup — Existing
- Choose recent file: loads and shows content in editor; progress counts new words only.
- Choose via dialog: only `.txt` selectable; loaded content set; progress based on new words.

### D) Editor & Progress
- Typing increments word count immediately.
- Timer ticks every second while active; indicator shows when focused.
- Word goal progress reflects new words; time goal progress reflects elapsed time.

### E) Completion
- On first reaching 100%, completion modal appears once; Keep Writing vs End Session behaviors verified.

### F) Inactivity
- Stop typing for 60 seconds: inactivity modal appears; timer pauses; Resume resumes timer.

### G) Distraction Warning
- Alt-tab away: distraction warning shows; countdown updates; Return increments distraction count.
- Let countdown expire: session ends; check status is `incomplete` and summary displays.

### H) Saving
- Type, wait: content autosaves (no user-visible toast by default).
- Press `Cmd+S`: content is saved; (recommended) show toast.
- End session: content saved; summary view shows.

---

## Known Behavior vs Documentation Mismatches

- Word goal minimum: code enforces min 10; UAT standard is min 100 (update needed in code + tests).
- Inactivity threshold: code uses 1 minute; a tech spec mentions 3 minutes.
- Distraction outcomes: code marks countdown expiry as `abandoned`; UAT requires `incomplete` (update needed in code).
- Backend file extension enforcement: renderer validates `.txt`; backend does not currently enforce.
- Notifications/toasts: UAT requires confirmations; code currently logs TODOs (implementation needed).

## Decisions Locked (Product Choices Reflected Here)

- Word goal minimum: 100 words (max 10,000). Update code and tests to align.
- Inactivity threshold: 1 minute.
- Distraction outcomes: End Anyway = `abandoned`; countdown expiry without user action = `incomplete`.
- Backend `.txt` enforcement: keep renderer-only for MVP (main process may be added later).
- Notifications: add success toasts for start (new/existing) and manual save.
- Time goal modal copy: future enhancement; current modal is shared.
- Session restore: no auto-restore on restart; users can load autosaved files via Load Existing.
- Penalty animation: shown for both manual early end and distraction countdown expiry.
- Accessibility: advanced shortcuts not in MVP.
