# v2

# Product Goals

- Incentivize focused writing sessions on Mac desktop
- Visually represent concentration and progress with a tree animation that grows during writing and wilts/dies when sessions are abandoned
- Deter premature session exits before goal completion
- Reinforce goal completion with positive animation and penalize incomplete sessions with wilt/death animation

## Target Users

- Writers, students, and creators working on first drafts
- Users who benefit from gamification for deep work
- Individuals seeking accountability tools for focused writing sessions

## Key Features

### Writing Sessions

- Distraction-free editor with live word count and timer display
- Selectable session goals (word count or time-based)
- Save/export drafts locally as plain text (.txt files)
- Autosave functionality with automatic recovery on app restart
- Import existing plain text files to continue writing

### Session Goal Setup

- Users must set a goal before starting a writing session
- Two goal types available:
    - **Word Count Goal**: Target number of words to write (e.g., 500 words)
    - **Time Goal**: Target duration for writing session (e.g., 30 minutes)
- Recommended ranges: 15-30 minutes or 250-500 words for focused sessions
- Session cannot start until a goal is selected

### Tree Animation System

**Growth States (3 stages):**

- **Seedling** (0-33% progress): Small sprout emerging from ground
- **Small Tree** (34-66% progress): Young tree with visible trunk and initial branches
- **Mature Tree** (67-100% progress): Full healthy tree with complete foliage

**Growth Behavior:**

- Tree grows incrementally and gradually during active writing session
- Growth rate tied to progress toward goal:
    - Word count goals: grows based on words written
    - Time goals: grows based on time elapsed
- Smooth animated transitions between growth stages (0.5-1 second transitions)

**Completion Animation:**

- Upon reaching goal, tree displays at full mature state
- Celebration animation/visual feedback for successful completion
- Session marked as "completed" in statistics

**Penalty Animation (Wilt/Death):**

- Triggered only when session ends before goal completion
- Gradual animated sequence (2-3 seconds):
    - Current tree state → wilting leaves/drooping branches → complete death (bare branches or fallen tree)
- Applies to both manual early ending and abandonment after distraction warning

### Inactivity Detection

**Purpose:** Session management, not penalty-based

**Behavior:**

- Monitor typing activity during active writing sessions
- If no typing detected for **3 minutes**, trigger inactivity modal
- **Inactivity modal displays:**
    - Pause icon
    - "Session Paused" heading
    - Message: "We noticed you haven't typed for a while. Your timer has been paused to keep your session time accurate. Ready to continue?"
    - Subtext: "Your progress is safe—no penalties applied."
    - Display: current word count, time elapsed, and small tree icon showing current state
    - Two action buttons:
        - **"Resume Writing"** (primary action)
        - **"End Session"** (secondary action)
    - Note: "Taking a thinking break is normal! Press Space or Enter to resume quickly."

**Important:** Inactivity does NOT cause tree wilting or penalties. Session timer pauses to maintain accuracy.

### Focus Monitoring and Distraction Warning

**Trigger:** User attempts to switch away from app, minimize window, or navigate to another application during active session

**Distraction Warning Modal:**

- Warning icon
- "Stay Focused?" heading
- Message: "You are about to leave your writing session. If you switch away before reaching your goal, your progress will be marked as incomplete and your tree will wilt."
- Countdown timer: "Return within **10 seconds** to keep your progress."
- Small tree icon showing current growth state (at risk)
- Two action buttons:
    - **"Return to Session"** (primary action)
    - **"End Session Anyway"** (secondary action)

**Behavior:**

- 10-second countdown begins when distraction detected
- If user returns to app within 10 seconds: warning dismissed, session continues normally, no penalty
- If user does NOT return within 10 seconds and remains away: session is abandoned
- Abandoned sessions trigger wilt/death animation when app is next opened or session officially ended

### Goal Enforcement

- Users cannot begin writing until a goal is set
- Only completing the set goal triggers full tree growth and completion status
- Ending session before goal completion (manually or via abandonment) results in:
    - Session marked as "incomplete"
    - Wilt/death animation displayed
    - Statistics reflect incomplete session

### Progress and Statistics Dashboard

**Dashboard displays:**

- Current day streak
- Weekly word count total
- Session completion rate (percentage)
- Last session summary (word count, duration, completion status)
- Visual progress tree showing current state

**Session data persisted:**

- Session start and end timestamps
- Goal type and target value
- Words written during session
- Time elapsed
- Completion status (completed vs incomplete)
- Distraction events count
- Final tree animation state

### File Management

- Local-only storage (no cloud sync in V1)
- Plain text (.txt) file format only
- Autosave every 30 seconds during active session
- Automatic recovery of unsaved work on app restart
- Basic export: save current draft to user-selected location
- Basic import: open existing .txt file to continue writing

## Design Principles

- **Clean, minimalist interface**: Primary focus on writing area and tree animation
- **Distraction-free environment**: No unnecessary UI elements during active session
- **Clear visual feedback**: Tree animation provides immediate, intuitive progress representation
- **Non-punitive inactivity handling**: Pausing for thought is encouraged; only abandonment is penalized
- **Action-oriented modals**: Clear options with primary/secondary button hierarchy

## Technical Requirements

### Tech Stack

- **Platform**: Electron (macOS primary target, Windows/Linux compatibility)
- **Frontend**: React with TypeScript
- **Text Editor**: Tiptap (rich text editor configured for plain text)
- **State Management**: React Context API
- **Animation**: Lottie + SVG renderer (recommended for V1)
- **Persistence**: Node.js filesystem APIs for local file operations
- **Testing**: Jest for unit testing (no E2E for MVP)

### Animation Specifications

**Format:** Lottie JSON with SVG rendering

**Asset Requirements:**

- 3 growth state animations (seedling, small tree, mature tree)
- 1 wilt/death sequence animation
- 1 completion celebration animation (optional enhancement)

**Technical Constraints:**

- Individual animation file size: < 500KB each
- Total animation package: < 2MB
- Dimensions: 512x512px (1:1 aspect ratio)
- Frame rate: 30fps minimum for smooth playback
- DPI: 72 (standard screen display)

**Performance:**

- Animations must not block UI or session functionality
- Smooth transitions without lag
- Bundled with app (no online fetching)

### Application Architecture

- Modular design to support future features (cloud sync, mobile, multi-user)
- Electron main process handles file I/O, session persistence, and system-level focus detection
- React renderer handles UI, editor, and animation display
- Preload scripts provide secure context bridge between main and renderer

## Out of Scope for V1

- Cross-device sync (iCloud or cloud storage)
- Mobile apps (iPad/iPhone)
- Customizable visual themes (tree type, colors)
- Customizable inactivity threshold
- Multiple penalty levels or scaling consequences
- Advanced text formatting (markdown, rich text)
- Collaboration features
- Browser extension or web version

## Risks & Challenges

- **False positive distraction detection**: May frustrate users if focus detection is overly sensitive
- **User perception of "punishment"**: Wilt animation may feel too harsh; messaging must emphasize completion reward over penalty
- **Animation asset creation**: Quality animations require design resources and testing
- **Performance**: Ensuring smooth animation playback on various hardware configurations
- **Balancing encouragement vs pressure**: Avoid creating anxiety around incomplete sessions

## Success Metrics

- **60%+ session completion rate**: Majority of started sessions reach their goal
- **Average session length**: 20+ minutes for time goals, 400+ words for word goals
- **Inactivity modal engagement**: 85%+ users choose "Resume Writing" vs "End Session"
- **Distraction warning return rate**: 70%+ users return within countdown after distraction warning
- **Daily active usage**: Users start 2+ sessions per day on average
- **Retention**: 40%+ of users return for 5+ consecutive days (streak building)

---

**Document Version:** 2.0 (Updated October 7, 2025)

**Status:** Ready for JIRA Ticket Creation

**Next Steps:** Generate Tech Spec V2 and User Stories V2 to align with updated PRD