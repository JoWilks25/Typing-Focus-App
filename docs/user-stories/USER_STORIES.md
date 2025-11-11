# User Stories & Acceptance Criteria

Comprehensive user stories and acceptance criteria for Draft Tree, consolidated from multiple sources and aligned with current implementation.

## 1. Application Navigation & Setup

### User Story
As a user, I want clear navigation and setup options when the app opens so that I can easily start writing or continue existing work.

### Acceptance Criteria
- App opens with navigation showing "New Session" and "Editor View" buttons
- "Editor View" is disabled when no active session exists
- Clicking "New Session" shows session setup view
- Attempting to access editor without active session redirects to session setup
- Clear visual indicators for available vs disabled options

## 2. Session Setup - New File

### User Story
As a writer, I want to configure a new writing session with clear goals and file management so that I can start focused writing.

### Acceptance Criteria
- **Goal Configuration:**
  - Choose between "Word Count" or "Time" goals
  - Word goals: 100-10,000 words (validated in real-time)
  - Time goals: 5-480 minutes (validated in real-time)
  - Invalid goals disable "Start Writing" button
  - Recommended ranges displayed: "15-30 min or 250-500 words for focused sessions"

- **File Management:**
  - Customizable filename (must end with `.txt`)
  - Selectable save directory with default location
  - Invalid filename disables start button
  - Success message shows goal and file path on session start

- **Session Creation:**
  - Valid inputs create new session and route to editor
  - Initial empty file created at chosen path
  - File path used for all subsequent saves

## 3. Session Setup - Load Existing File

### User Story
As a writer, I want to continue working on existing documents so that I can maintain continuity in my writing projects.

### Acceptance Criteria
- **Recent Files:**
  - List of recently opened files displayed
  - Selecting recent file loads content and calculates initial word count
  - Success message shows word count and full path

- **File Selection:**
  - "Choose File" opens native file dialog
  - Only `.txt` files selectable
  - Loaded content appears in editor
  - Initial word count calculated and stored

- **Progress Tracking:**
  - Goal progress counts only new words written
  - Initial word count displayed separately (grayed out)
  - Session tracks delta from imported content

## 4. Writing Interface & Real-time Feedback

### User Story
As a writer, I want immediate feedback on my progress and a distraction-free writing environment.

### Acceptance Criteria
- **Editor Interface:**
  - Plain text editor with Tiptap integration
  - Placeholder text: "Start writing... Let your thoughts flow freely."
  - Editor focuses automatically when content is empty
  - Minimal UI with essential elements only

- **Live Statistics:**
  - Word count updates immediately as user types
  - Session timer shows total duration (updates every second)
  - Goal display shows selected goal type and target
  - Progress bar reflects completion percentage

- **Progress Calculation:**
  - Word goals: based on new words only (total - initialWordCount)
  - Time goals: based on elapsed time vs goal minutes
  - Progress updates smoothly and responsively

## 5. Tree Animation & Visual Progress

### User Story
As a writer, I want visual feedback that represents my progress through a growing tree so that I feel motivated and can see my advancement.

### Acceptance Criteria
- **Animation States:**
  - Tree starts at initial state (seedling) at 0% progress
  - Three growth stages: seedling (0-33%), small tree (34-66%), mature tree (67-100%)
  - Smooth transitions between states (0.5-1 second)
  - Tree growth corresponds directly to progress percentage

- **Visual Feedback:**
  - Animation updates responsively to writing activity
  - No lag or blocking during typing
  - Tree state persists when navigating within app
  - At 100% progress, tree shows fully grown state

## 6. Session Completion & Success

### User Story
As a writer, I want positive feedback and clear options when I reach my goal so that I can celebrate my achievement and decide how to continue.

### Acceptance Criteria
- **Completion Detection:**
  - Word goals: completion when target word count reached
  - Time goals: completion when target time elapsed
  - Completion modal appears exactly once per session

- **Success Modal:**
  - Shows current word count and elapsed time
  - Displays configured goal value and type
  - "Keep Writing" dismisses modal, session continues
  - "End Session" saves content and routes to summary
  - Tree shows fully grown state

## 7. Inactivity Management

### User Story
As a writer, I want the app to pause my session timer when I stop typing so that my session time remains accurate.

### Acceptance Criteria
- **Inactivity Detection:**
  - Monitors keyboard input during active sessions
  - Triggers after 1 minute of no typing activity
  - Session timer pauses when modal appears

- **Inactivity Modal:**
  - "Session Paused" heading with pause icon
  - Message: "We noticed you haven't typed for a while..."
  - Shows current session stats (word count, time elapsed)
  - "Resume Writing" (primary) and "End Session" (secondary) buttons
  - Hint: "Taking a thinking break is normal!"

- **Resume Behavior:**
  - "Resume Writing" dismisses modal and resumes timer
  - Session continues normally with no penalty
  - Tree remains at current growth state
  - No penalty animations from inactivity alone

## 8. Distraction Warning & Focus Management

### User Story
As a writer, I want to be warned if I try to leave the app during my session so that I stay focused and understand the consequences.

### Acceptance Criteria
- **Focus Detection:**
  - Detects when user switches to another application
  - Detects window minimization or navigation away
  - Triggers immediately during active sessions

- **Distraction Warning Modal:**
  - "Stay Focused?" heading with warning icon
  - Message: "You are about to leave your writing session..."
  - 10-second countdown timer (updates every second)
  - "Return to Session" (primary) and "End Session Anyway" (secondary) buttons

- **Warning Outcomes:**
  - "Return to Session": dismisses warning, session continues, distraction count incremented
  - "End Session Anyway": session ends immediately, marked as "abandoned"
  - Countdown expiry: session ends, marked as "incomplete"

## 9. Penalty Animation & Consequences

### User Story
As a writer, I want to see visual consequences if I end my session before completing my goal so that I'm motivated to follow through.

### Acceptance Criteria
- **Penalty Triggers:**
  - Manual session end before goal completion
  - Distraction warning countdown expiry
  - "End Session" selection in any modal

- **Wilt Animation:**
  - 2-3 second animated sequence
  - Gradual transition from current tree state to wilted/dead
  - Visual progression: healthy → wilting → browning → bare branches
  - Animation cannot be skipped or closed early

- **No Penalty Cases:**
  - Goal completion before session end
  - Inactivity pauses (only early ending triggers penalty)
  - Session completion through normal flow

## 10. Autosave & Data Protection

### User Story
As a writer, I want my work to be automatically saved so that I never lose progress from crashes or unexpected shutdowns.

### Acceptance Criteria
- **Autosave Behavior:**
  - Triggers every 30 seconds during active sessions
  - Also triggers on content changes (debounced)
  - Saves silently in background without interrupting typing
  - Visual indicator shows "Last saved: X minutes ago"

- **Data Persistence:**
  - Saves editor content and session metadata
  - Includes current progress (word count, time elapsed)
  - Writes to dedicated autosave directory
  - Includes session ID and timestamp

- **Recovery System:**
  - Detects autosave files on app startup
  - Shows recovery modal for recent unsaved work
  - "Recover Session" loads content and prompts for new goal
  - "Discard" deletes autosave files
  - Recovery doesn't auto-resume previous session

## 11. File Import & Export

### User Story
As a writer, I want to import existing files and export my work so that I can manage my writing outside the app.

### Acceptance Criteria
- **Import Functionality:**
  - Support for `.txt` files only
  - File dialog with proper filtering
  - Content loads into editor with initial word count
  - Success message shows word count and file path
  - Imported words don't count toward session goal

- **Export Functionality:**
  - "Save As" triggers native save dialog
  - Default filename: "Draft Tree - [Date].txt"
  - User can choose custom filename and location
  - Success confirmation with file path
  - Export doesn't end current session

## 12. Session Summary & Statistics

### User Story
As a writer, I want to see a summary of my session when I finish so that I understand my accomplishment and progress.

### Acceptance Criteria
- **Summary Display:**
  - Completion status: "Goal Reached!" or "Session Ended Early"
  - Session statistics: words written, time elapsed, goal details
  - Completion percentage and progress visualization
  - Tree animation result (mature or wilted)

- **Action Options:**
  - "View Dashboard" navigates to progress overview
  - "Start New Session" navigates to session setup
  - "Save Draft" triggers export dialog (optional)

- **Data Persistence:**
  - Session data saved to local database
  - Includes all session metadata and statistics
  - Dashboard updates immediately with new data

## 13. Error Handling & Validation

### User Story
As a writer, I want clear error messages and validation so that I understand what went wrong and how to fix it.

### Acceptance Criteria
- **Input Validation:**
  - Real-time validation for goal inputs
  - Clear error messages for invalid ranges
  - Disabled buttons when inputs are invalid
  - File extension validation for imports/exports

- **System Error Handling:**
  - Graceful handling of file I/O errors
  - Clear error messages for system failures
  - Retry options for transient errors
  - Fallback behaviors for critical failures

- **User Feedback:**
  - Success messages for important actions
  - Error notifications with actionable guidance
  - Loading states for async operations
  - Confirmation dialogs for destructive actions

## 14. Accessibility & Usability

### User Story
As a writer, I want the app to be accessible and easy to use so that I can focus on writing without technical barriers.

### Acceptance Criteria
- **Keyboard Navigation:**
  - Tab navigation through interface elements
  - Enter key to submit forms and confirm actions
  - Escape key to close modals
  - Cmd/Ctrl+S for manual save

- **Visual Design:**
  - High contrast text and backgrounds
  - Clear visual hierarchy and typography
  - Consistent button and interaction patterns
  - Responsive layout for different screen sizes

- **User Experience:**
  - Intuitive navigation and workflow
  - Clear visual feedback for all actions
  - Minimal cognitive load during writing
  - Consistent behavior across all features

## Testing Checklists

### Quick Validation Tests

**Navigation & Setup:**
- [ ] App opens with correct navigation state
- [ ] New Session button works, Editor View disabled without session
- [ ] Invalid inputs disable start button appropriately

**Session Management:**
- [ ] Word goals: 99 (blocked), 100 (ok), 10,001 (blocked), 10,000 (ok)
- [ ] Time goals: 4 (blocked), 5 (ok), 481 (blocked), 480 (ok)
- [ ] File operations work correctly (new and existing)

**Editor & Progress:**
- [ ] Word count updates immediately while typing
- [ ] Timer increments every second while active
- [ ] Progress bar reflects correct completion percentage
- [ ] Tree animation progresses with completion

**Modals & Interactions:**
- [ ] Completion modal appears once at 100%
- [ ] Inactivity modal after 1 minute of no typing
- [ ] Distraction warning on focus loss with 10-second countdown
- [ ] All modal actions work as expected

**Data Persistence:**
- [ ] Autosave works every 30 seconds
- [ ] Manual save (Cmd+S) works correctly
- [ ] Session data persists across app restarts
- [ ] Recovery system works for unsaved work

---

**Document Version:** 1.0 (Consolidated)
**Status:** Aligned with current implementation
**Last Updated:** December 2024
