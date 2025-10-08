# v2

```markdown
## Overview

Focus Writer V1 is a Mac desktop application built with Electron that enables focused writing sessions with goal-tracking, distraction detection, inactivity management, autosave/recovery, and gamified tree animations. Designed as a local-only, single-user application, the architecture is modular to support future extensions for cloud sync, mobile platforms, and multi-user features.

---

## Tech Stack

### Core Technologies
- **Platform**: Electron (v28+)
- **Target OS**: macOS (primary), with Windows/Linux compatibility
- **Node.js**: v20.19+ or v22.12+ (LTS recommended)
- **Package Manager**: npm

### Frontend
- **UI Framework**: React 18+ with TypeScript
- **Text Editor**: Tiptap (headless rich text editor configured for plain text)
- **State Management**: React Context API
- **Styling**: CSS Modules or Styled Components (TBD based on team preference)

### Backend/Logic
- **Main Process**: Electron main process (Node.js)
- **Persistence**: Node.js filesystem APIs (`fs/promises`)
- **IPC**: Electron IPC for main ↔ renderer communication
- **Context Bridge**: Preload scripts for secure API exposure

### Animation
- **Format**: Lottie JSON animations
- **Renderer**: SVG rendering via `lottie-web` or `react-lottie`
- **Assets**: Bundled with app (no online fetching)

### Development Tools
- **Build System**: electron-vite
- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier
- **Testing**: Jest for unit tests (no E2E in V1)
- **Type Checking**: TypeScript strict mode

---

## Architecture

### Project Structure

```

focus-writer/
├── src/
│   ├── main/                    \# Electron main process
│   │   ├── index.ts             \# Main entry point
│   │   ├── services/            \# Business logic services
│   │   │   ├── SessionService.ts
│   │   │   ├── FileService.ts
│   │   │   ├── StorageService.ts
│   │   │   └── FocusMonitor.ts
│   │   ├── handlers/            \# IPC handlers
│   │   │   ├── sessionHandlers.ts
│   │   │   ├── fileHandlers.ts
│   │   │   └── storageHandlers.ts
│   │   ├── utils/               \# Utility functions
│   │   └── types/               \# TypeScript types
│   │
│   ├── preload/                 \# Preload scripts
│   │   └── index.ts             \# Context bridge setup
│   │
│   └── renderer/                \# React application
│       ├── src/
│       │   ├── App.tsx          \# Root component
│       │   ├── components/      \# React components
│       │   │   ├── Editor/
│       │   │   │   ├── Editor.tsx
│       │   │   │   ├── WordCounter.tsx
│       │   │   │   └── TimerDisplay.tsx
│       │   │   ├── Session/
│       │   │   │   ├── SessionSetup.tsx
│       │   │   │   ├── SessionStats.tsx
│       │   │   │   └── SessionSummary.tsx
│       │   │   ├── Modals/
│       │   │   │   ├── InactivityModal.tsx
│       │   │   │   ├── DistractionWarning.tsx
│       │   │   │   └── RecoveryModal.tsx
│       │   │   ├── Animation/
│       │   │   │   ├── TreeAnimation.tsx
│       │   │   │   └── AnimationController.tsx
│       │   │   └── Dashboard/
│       │   │       ├── Dashboard.tsx
│       │   │       ├── StatsPanel.tsx
│       │   │       └── SessionHistory.tsx
│       │   ├── context/         \# React Context providers
│       │   │   ├── SessionContext.tsx
│       │   │   └── AppContext.tsx
│       │   ├── hooks/           \# Custom React hooks
│       │   │   ├── useSession.ts
│       │   │   ├── useWordCount.ts
│       │   │   ├── useTimer.ts
│       │   │   └── useFocusDetection.ts
│       │   ├── utils/           \# Frontend utilities
│       │   ├── types/           \# TypeScript interfaces
│       │   └── styles/          \# Global styles
│       └── assets/              \# Static assets
│           └── animations/      \# Lottie JSON files
│               ├── seedling.json
│               ├── small-tree.json
│               ├── mature-tree.json
│               └── wilt-death.json
│
├── electron.vite.config.ts      \# Build configuration
├── package.json
├── tsconfig.json
└── README.md

```

### Process Architecture

**Main Process (Node.js):**
- Window management and lifecycle
- File system operations (read/write/import/export)
- Local database/storage management
- Focus/blur event monitoring
- IPC message handling
- Autosave scheduling

**Renderer Process (React):**
- UI rendering and user interactions
- Text editor (Tiptap integration)
- Animation playback and state management
- Timer and word count display
- Modal management
- IPC requests to main process

**Preload Script:**
- Secure context bridge between main and renderer
- Exposes limited IPC API to renderer
- Type-safe API definitions

---

## Core Features Implementation

### 1. Session Goals & Tracking

**Data Model:**
```

interface Session {
id: string;                    // UUID
startTime: number;             // Unix timestamp
endTime?: number;              // Unix timestamp
goalType: 'word' | 'time';
goalValue: number;             // Words or minutes
wordsWritten: number;
initialWordCount: number;      // For imported files
timeElapsed: number;           // Seconds
status: 'active' | 'completed' | 'incomplete' | 'abandoned';
distractionCount: number;
inactivityPauseCount: number;
treeState: 'seedling' | 'small' | 'mature' | 'wilted' | 'dead';
}

```

**Implementation:**
- **SessionService** (main process) manages session lifecycle
- Session state persisted to local JSON file every 30 seconds
- Progress calculation:
  - Word goal: `progress = (wordsWritten - initialWordCount) / goalValue × 100`
  - Time goal: `progress = timeElapsed / (goalValue × 60) × 100`
- Progress updates trigger tree animation state changes via IPC

**Storage Location:**
- macOS: `~/Library/Application Support/focus-writer/sessions/`
- Active session: `active-session.json`
- Session history: `session-history.json` (array of completed sessions)

---

### 2. Text Editing & Import/Export

**Tiptap Configuration:**
```

const editor = useEditor({
extensions: [
Document,
Paragraph,
Text,
HardBreak,
],
content: '',
autofocus: true,
editable: true,
onUpdate: ({ editor }) => {
// Trigger word count update
// Trigger autosave
// Update session progress
},
});

```

**Word Count Calculation:**
- Splits text on whitespace: `text.trim().split(/\s+/).filter(word => word.length > 0).length`
- Updates on every editor change (debounced for performance)
- Tracks delta from initial import count

**Import Flow:**
1. User selects file via native dialog (`dialog.showOpenDialog`)
2. FileService reads file content (`fs.readFile`)
3. Content loaded into Tiptap editor
4. Initial word count calculated and stored
5. User prompted to set session goal (imported words don't count toward goal)

**Export Flow:**
1. User triggers export (`File → Save As`)
2. Native save dialog appears (`dialog.showSaveDialog`)
3. FileService writes editor content to selected path
4. Confirmation shown to user
5. Session continues (not ended by export)

**Supported Format:**
- Plain text (.txt) only in V1
- UTF-8 encoding

---

### 3. Inactivity Detection & Session Pause

**Implementation:**
- **FocusMonitor** service (main process) tracks last typing event
- Typing events sent from renderer via IPC on editor `onUpdate`
- Inactivity threshold: **3 minutes** (hardcoded)
- Timer resets on any typing activity

**Inactivity Flow:**
```

// Main process
let lastTypingTimestamp = Date.now();
let inactivityTimer: NodeJS.Timeout;

function resetInactivityTimer() {
clearTimeout(inactivityTimer);
lastTypingTimestamp = Date.now();

inactivityTimer = setTimeout(() => {
if (sessionState.isActive) {
// Pause session timer
sessionState.isPaused = true;
sessionState.pauseStartTime = Date.now();

      // Trigger inactivity modal in renderer
      mainWindow.webContents.send('show-inactivity-modal');
    }
    }, 3 * 60 * 1000); // 3 minutes
}

// Renderer sends typing event
ipcRenderer.send('typing-activity');

```

**Modal Behavior:**
- Session timer pauses immediately when modal appears
- "Resume Writing" button:
  - Dismisses modal
  - Resumes session timer from paused point
  - Resets inactivity timer
- "End Session" button:
  - Ends session
  - Triggers wilt/death animation if goal not reached
  - Shows session summary

**Key Point:** Inactivity does NOT trigger tree wilting—only session pause.

---

### 4. Focus Monitoring & Distraction Warning

**Implementation:**
- Main process listens to window `blur` events
- Blur event triggers distraction warning modal (if session active)
- 10-second countdown begins immediately

**Focus Detection:**
```

// Main process
mainWindow.on('blur', () => {
if (sessionState.isActive \&\& !sessionState.isPaused) {
sessionState.distractionCount++;
mainWindow.webContents.send('show-distraction-warning');
startDistractionCountdown();
}
});

mainWindow.on('focus', () => {
if (distractionCountdownActive) {
clearTimeout(distractionCountdown);
mainWindow.webContents.send('dismiss-distraction-warning');
}
});

function startDistractionCountdown() {
let secondsRemaining = 10;

distractionCountdown = setInterval(() => {
secondsRemaining--;
mainWindow.webContents.send('update-countdown', secondsRemaining);

    if (secondsRemaining === 0) {
      clearInterval(distractionCountdown);
      // Mark session as abandoned
      sessionState.status = 'abandoned';
      // Will trigger wilt animation when app regains focus
    }
    }, 1000);
}

```

**Modal Actions:**
- "Return to Session": Dismisses modal, session continues
- "End Session Anyway": Ends session immediately, triggers wilt animation
- Countdown expires: Session marked as abandoned, wilt animation plays on next app focus

---

### 5. Tree Animation System

**Animation States & Assets:**

| Tree State | Progress Range | File | Duration | Trigger |
|-----------|---------------|------|----------|---------|
| Seedling | 0-33% | `seedling.json` | Loop | Session start, 0-33% progress |
| Small Tree | 34-66% | `small-tree.json` | Loop | 34-66% progress |
| Mature Tree | 67-100% | `mature-tree.json` | Loop | 67-100% progress, goal completion |
| Wilt/Death | N/A | `wilt-death.json` | 2-3s | Session ended before goal completion |

**Animation Controller:**
```

interface TreeAnimationState {
currentState: 'seedling' | 'small' | 'mature' | 'wilting';
progress: number; // 0-100
isTransitioning: boolean;
}

function updateTreeAnimation(progress: number) {
let newState: TreeState;

if (progress < 34) {
newState = 'seedling';
} else if (progress < 67) {
newState = 'small';
} else {
newState = 'mature';
}

if (newState !== currentState) {
// Smooth transition (0.5-1 second)
transitionToState(newState);
}
}

function triggerWiltAnimation() {
// Play wilt-death animation (non-looping)
playAnimation('wilt-death', {
loop: false,
duration: 2500, // 2.5 seconds
onComplete: () => {
// Show session summary
}
});
}

```

**Animation Integration:**
- Uses `lottie-web` or `react-lottie` library
- SVG renderer for quality and compatibility
- Animations pre-loaded on app launch (no lazy loading)
- Smooth interpolation between states
- Non-blocking (runs on separate rendering thread)

**Asset Specifications:**
- Format: Lottie JSON (exported from After Effects or similar)
- Max file size: 500KB per animation
- Dimensions: 512x512px (1:1 aspect ratio)
- Frame rate: 30fps
- Color space: RGB
- Compression: Optimized JSON (remove unnecessary keyframes)

---

### 6. Autosave & Recovery

**Autosave Implementation:**
```

// Autosave interval: 30 seconds
setInterval(() => {
if (sessionState.isActive) {
saveSessionState();
saveEditorContent();
}
}, 30 * 1000);

// Also trigger on editor updates (debounced)
const debouncedSave = debounce(() => {
saveEditorContent();
}, 5000); // 5 seconds after last edit

editor.on('update', () => {
debouncedSave();
});

```

**Storage:**
- Active session state: `~/Library/Application Support/focus-writer/autosave/active-session.json`
- Editor content: `~/Library/Application Support/focus-writer/autosave/editor-content.txt`
- Timestamp: `~/Library/Application Support/focus-writer/autosave/last-save.txt`

**Recovery Flow:**
1. On app launch, check for autosave files
2. Compare `last-save` timestamp with current time
3. If unsaved data exists (recent timestamp, no matching completed session):
   - Show recovery modal
   - Display: timestamp, word count, preview of content
   - Options: "Recover Session" or "Discard"
4. If "Recover Session":
   - Load content into editor
   - Calculate initial word count
   - Prompt user to set new goal (previous session is lost)
5. If "Discard":
   - Delete autosave files
   - Start fresh

**Edge Cases:**
- Corrupted autosave file: Catch JSON parse errors, discard silently
- Multiple crashes: Always show most recent autosave
- Manual save: Autosave continues independently

---

### 7. Progress Dashboard & Statistics

**Data Persistence:**
```

interface DashboardData {
totalSessions: number;
completedSessions: number;
currentStreak: number;
longestStreak: number;
totalWordsWritten: number;
totalTimeSpent: number; // seconds
weeklyStats: {
weekStart: string; // ISO date
wordsWritten: number;
sessionsCompleted: number;
completionRate: number; // percentage
};
lastSession: Session | null;
sessionHistory: Session[]; // Last 100 sessions
}

```

**Storage:**
- Location: `~/Library/Application Support/focus-writer/dashboard.json`
- Updates after every session completion
- Streak logic:
  - Streak increments if session completed today and yesterday (or earlier streak day)
  - Streak resets if no completed sessions for 24+ hours
  - Only completed sessions count toward streak (incomplete/abandoned do not break streak, but don't increment)

**Calculations:**
- Completion rate: `(completedSessions / totalSessions) × 100`
- Weekly stats: Filter sessions by `startTime` within last 7 days
- Tree visualization: Based on current streak health (higher streak = healthier tree appearance)

---

## Data Models

### Session Data Structure
```

interface Session {
id: string;
startTime: number;
endTime?: number;
goalType: 'word' | 'time';
goalValue: number;
wordsWritten: number;
initialWordCount: number;
timeElapsed: number;
status: 'active' | 'completed' | 'incomplete' | 'abandoned';
distractionCount: number;
inactivityPauseCount: number;
inactivityPauseDuration: number; // Total seconds paused
treeState: 'seedling' | 'small' | 'mature' | 'wilted' | 'dead';
filePath?: string; // If imported or saved
}

```

### App Configuration
```

interface AppConfig {
version: string;
inactivityThreshold: number; // Hardcoded 180 seconds (3 min)
distractionCountdown: number; // Hardcoded 10 seconds
autosaveInterval: number; // Hardcoded 30 seconds
animationEnabled: boolean; // Default true
darkMode: boolean; // Default false (system preference in future)
}

```

---

## IPC API

### Renderer → Main

```

// Session management
window.api.session.start(goalType: 'word' | 'time', goalValue: number): Promise<void>
window.api.session.end(): Promise<SessionSummary>
window.api.session.pause(): Promise<void>
window.api.session.resume(): Promise<void>
window.api.session.getActive(): Promise<Session | null>

// File operations
window.api.file.import(): Promise<{ content: string, path: string }>
window.api.file.export(content: string): Promise<string>
window.api.file.getRecent(): Promise<string[]>

// Storage operations
window.api.storage.getDashboard(): Promise<DashboardData>
window.api.storage.getSessionHistory(): Promise<Session[]>
window.api.storage.clearData(): Promise<void>

// Typing activity
window.api.activity.recordTyping(): Promise<void>

```

### Main → Renderer

```

// Modals
window.api.on('show-inactivity-modal', callback: () => void)
window.api.on('show-distraction-warning', callback: () => void)
window.api.on('show-recovery-modal', callback: (data: RecoveryData) => void)
window.api.on('dismiss-distraction-warning', callback: () => void)

// Countdown updates
window.api.on('update-countdown', callback: (seconds: number) => void)

// Session updates
window.api.on('session-updated', callback: (session: Session) => void)

```

---

## Testing Strategy

### Unit Testing (Jest)

**Test Coverage Requirements:**
- 100% coverage for business logic (services, utilities)
- Focus areas:
  - Session lifecycle management
  - Progress calculation (word/time goals)
  - Tree state transitions
  - Word count calculation
  - Autosave/recovery logic
  - Streak calculation
  - File import/export
  - Inactivity detection logic
  - Distraction countdown logic

**Example Test Cases:**
```

describe('SessionService', () => {
test('calculates progress correctly for word goal', () => {
const session = {
goalType: 'word',
goalValue: 500,
wordsWritten: 250,
initialWordCount: 0
};
expect(calculateProgress(session)).toBe(50);
});

test('pauses timer on inactivity', async () => {
// Test implementation
});

test('marks session as abandoned after countdown expires', async () => {
// Test implementation
});
});

```

### Manual Testing

**Test Scenarios:**
1. **Happy Path**: Start session, write to goal completion, see mature tree
2. **Inactivity**: Stop typing for 3+ minutes, verify pause modal, resume successfully
3. **Distraction**: Switch away from app, see warning, return within 10s, continue
4. **Abandonment**: Switch away, let countdown expire, verify wilt animation
5. **Early End**: Manually end session before goal, verify wilt animation
6. **Import**: Import .txt file, verify word count doesn't count toward goal
7. **Export**: Export mid-session, verify session continues
8. **Autosave**: Write content, force quit app, relaunch, verify recovery modal
9. **Dashboard**: Complete multiple sessions, verify stats update correctly
10. **Streak**: Complete sessions on consecutive days, verify streak increments

**Edge Cases:**
- Window close during active session
- App crash during autosave
- Corrupted session data file
- Import empty file
- Export with no content
- Multiple rapid focus/blur events
- Typing during countdown
- Pausing at 99% progress

### Performance Testing

**Metrics to Monitor:**
- Editor responsiveness (no lag when typing)
- Animation frame rate (maintain 30fps)
- Memory usage (< 200MB typical)
- Autosave performance (non-blocking)
- App launch time (< 3 seconds)

---

## Deployment

### Build Configuration

```

// electron-builder configuration
{
"appId": "com.focuswriter.app",
"productName": "Focus Writer",
"directories": {
"output": "dist"
},
"mac": {
"target": ["dmg", "zip"],
"category": "public.app-category.productivity",
"minimumSystemVersion": "10.15.0",
"icon": "build/icon.icns"
},
"dmg": {
"title": "Focus Writer Installer",
"icon": "build/icon.icns"
}
}

```

### Build Commands

```

# Development

npm run dev           \# Start dev server with hot reload

# Production build

npm run build         \# Build renderer and main process
npm run build:mac     \# Build macOS .dmg installer
npm run build:win     \# Build Windows installer (future)
npm run build:linux   \# Build Linux AppImage (future)

# Testing

npm run test          \# Run Jest unit tests
npm run test:coverage \# Generate coverage report
npm run lint          \# Run ESLint
npm run typecheck     \# Run TypeScript type checking

```

### Distribution

**V1 Distribution:**
- macOS .dmg installer
- Manual download from GitHub Releases or website
- No auto-updater in V1
- No code signing (future enhancement)

---

## Non-Functional Requirements

### Performance
- Editor typing latency: < 16ms (60fps)
- Animation frame rate: 30fps minimum
- App launch time: < 3 seconds
- Memory usage: < 200MB typical, < 500MB peak
- Autosave: Non-blocking, < 50ms

### Reliability
- Autosave every 30 seconds (no data loss beyond 30s)
- Crash recovery: 100% recovery of last autosaved state
- File operations: Atomic writes (prevent corruption)

### Usability
- Keyboard-driven workflow (minimal mouse required)
- Clear visual feedback for all actions
- No modal can block critical functionality
- Accessible error messages

### Maintainability
- Modular architecture (easy to add features)
- TypeScript strict mode (type safety)
- ESLint + Prettier (code consistency)
- Comprehensive unit test coverage

---

## Security Considerations

### V1 Security Measures
- Preload script context isolation enabled
- No remote content loading
- Node integration disabled in renderer
- Content Security Policy (CSP) enforced
- File system access limited to user data directory

### Data Privacy
- All data stored locally (no telemetry)
- No network requests (offline-first)
- No analytics or crash reporting
- User data never leaves device

---

## Out of Scope for V1

### Features Not Included
- Cloud sync or backup
- Mobile apps (iOS/Android)
- Browser extension
- Collaborative editing
- Advanced text formatting (markdown, rich text)
- Customizable themes or animations
- Keyboard shortcuts configuration
- Native system notifications
- Global hotkeys
- Tray/menu bar integration
- Auto-updater
- Analytics or crash reporting
- Export to PDF, DOCX, or other formats
- Spell check or grammar tools
- Multiple simultaneous sessions
- User accounts or profiles

### Technical Debt Deferred
- E2E testing framework
- Code signing for macOS
- Windows/Linux builds
- Performance profiling tools
- Automated release pipeline
- Localization/internationalization

---

## Future Enhancements (V2+)

### Planned Features
- Cloud sync (iCloud, Dropbox, Google Drive)
- iOS and iPad apps with sync
- Customizable tree types (different plants)
- Sound effects for animations
- Configurable inactivity threshold
- Export to markdown, PDF
- Keyboard shortcuts customization
- Dark mode toggle
- Spell check integration
- Session templates (quick start goals)

### Technical Improvements
- Electron auto-updater
- Code signing and notarization
- E2E testing with Playwright
- Performance monitoring
- Sentry for error tracking
- CI/CD pipeline (GitHub Actions)
- Better animation compression
- WebAssembly for word counting (performance)

---

**Document Version:** 2.0 (Updated October 7, 2025)  
**Status:** Aligned with PRD V2 and User Stories V2  
**Next Steps:** Begin JIRA ticket creation for MVP implementation

---

## Dependencies

### Production Dependencies
```

{
"react": "^18.2.0",
"react-dom": "^18.2.0",
"@tiptap/react": "^2.1.0",
"@tiptap/starter-kit": "^2.1.0",
"lottie-web": "^5.12.0",
"uuid": "^9.0.0"
}

```

### Development Dependencies
```

{
"electron": "^28.0.0",
"electron-builder": "^24.0.0",
"electron-vite": "^2.0.0",
"typescript": "^5.3.0",
"@types/react": "^18.2.0",
"@types/node": "^20.0.0",
"eslint": "^8.55.0",
"prettier": "^3.1.0",
"jest": "^29.7.0",
"@testing-library/react": "^14.1.0"
}
```