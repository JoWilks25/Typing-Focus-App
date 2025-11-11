# App Features & Validation Rules

This document describes the core features and validation rules for Draft Tree.

## Writing Sessions

The app supports two types of writing goals:

### 1. Word Count Goals
- **Minimum**: 100 words
- **Maximum**: 10,000 words
- **Recommended**: 250-500 words for focused sessions
- **Default**: 500 words

### 2. Time Duration Goals
- **Minimum**: 5 minutes
- **Maximum**: 480 minutes (8 hours)
- **Recommended**: 15-30 minutes for focused sessions
- **Default**: 30 minutes

## Validation Rules

### Goal Validation
- All goals are validated both in the renderer (for immediate feedback) and in the main process (for data integrity)
- Invalid goals will disable the "Start Writing" button
- Session creation will fail if validation rules are not met

### Input Sanitization
- Non-numeric characters are automatically removed from goal inputs
- Decimal values are supported for time durations
- Negative values are rejected
- Empty inputs default to 0

## Session Management

### Session Creation
- Sessions are created via `window.api.session.start(filePath, name, title, goalType, goalValue, initialContent)`
- Each session gets a unique ID and timestamp
- Session data is persisted to user-selected .txt file (autosave every 10 seconds)
- Session state tracked in AppContext and localStorage
- Validation occurs in the main process before session creation

### Session Data Structure
```typescript
interface Session {
  id: string;
  name: string;
  title?: string;
  content?: string;
  filePath: string;              // Required: Path to .txt file
  lastSavedToFile?: string;      // ISO timestamp of last file save
  goalType: GoalType;            // 'word' | 'time'
  goalValue: number;
  startTime: number;
  endTime?: number;
  status: 'active' | 'stopped' | 'abandoned' | 'completed' | 'incomplete';
  createdAt: string;             // ISO string
  updatedAt: string;             // ISO string
  currentWords?: number;
  timeElapsed?: number;
  progressPercentage?: number;
  isPaused?: boolean;
  pauseStartTime?: number;
  totalPauseTime?: number;       // Accumulated pause time in ms
  distractionCount?: number;
  isAbandoned?: boolean;
  initialWordCount?: number;     // Word count of loaded file (baseline)
}
```

## User Interface

### Session Setup
- Goal type selection (Word Count vs Time Duration)
- File path selection (new file or existing file)
- Input validation with real-time feedback
- Recommended ranges displayed to users: "15-30 min or 250-500 words for focused sessions"
- Keyboard shortcuts (Enter to submit)
- Session setup via modal or dedicated setup view

### Session States
- **active**: Currently writing, timer running
- **stopped**: Manually stopped by user
- **completed**: Goal reached successfully
- **incomplete**: Ended before goal completion (distraction timeout)
- **abandoned**: User explicitly chose to end early

### Error Handling
- Validation errors shown through UI state (disabled buttons)
- IPC communication errors are logged to console
- Graceful fallbacks for storage errors
- Non-blocking error handling in editor

## Word Count & Typing Activity

### Word Count Calculation
- **Function**: `calculateWordCount()` in `src/renderer/src/utils/wordCount.ts`
- **Algorithm**: Splits text by whitespace and filters empty strings
- **Edge Cases Handled**:
  - Empty strings and whitespace-only text
  - Symbols and punctuation (e.g., "hello-world", "test@example.com")
  - Unicode characters and emojis
  - Numbers and alphanumeric combinations
  - Mixed whitespace types (tabs, newlines, spaces)
  - Very long documents (10k+ words) with performance optimization
- **Performance**: Handles 10k+ word documents efficiently (< 100ms)

### Typing Activity Tracking
- **Implementation**: 
  - Immediate word count: Direct `calculateWordCount()` call in Editor's `handleUpdate` callback
  - Local state updates: Instant UI feedback via `setLocalState()`
  - Debounced content save: 2-second debounce via `debouncedUpdateSession()`
  - Progress updates: 5-second intervals via `updateProgressInBackground()`
- **IPC Integration**: 
  - `activity.recordTyping()`: Called on every keystroke (immediate, not debounced) for inactivity tracking
  - `session.updateContent()`: Called after 2-second typing pause
  - `session.updateProgress()`: Called every 5 seconds with word count, time elapsed, and progress percentage
- **Performance Strategy**:
  - Word count display: Immediate (local state, no React overhead)
  - Content persistence: 2s debounce (prevents editor focus loss)
  - Progress tracking: 5s intervals (reduces IPC overhead)
  - File autosave: 10s intervals (backend, via SessionManager)
- **ContentRef Pattern**: Content stored in ref instead of React state to prevent editor focus loss

### SessionStats Component
- **Location**: `src/renderer/src/components/Editor/SessionStats.tsx`
- **Features**:
  - Real-time word count display from local state
  - Goal progress bar with percentage
  - Timer display (1-second updates)
  - Goal type and value display
- **Integration**: Displayed above editor in active sessions

## Technical Implementation

### Validation Layers
1. **Shared Validation** (`src/shared/types/validation.ts`)
   - Shared constants: `VALIDATION_RANGES`, `RECOMMENDED_RANGES`, `DEFAULT_VALUES`
   - Word goals: 100-10,000 words
   - Time goals: 5-480 minutes

2. **Renderer Validation** (`src/renderer/src/utils/validation.ts`)
   - Immediate UI feedback
   - Input sanitization
   - Real-time validation
   - Uses shared validation constants

3. **Main Process Validation** (`src/main/utils/validation.ts`)
   - Data integrity enforcement
   - Uses shared validation constants
   - Consistent with renderer rules

### Session Flow
1. User clicks "New Session" or triggers session setup
2. SessionSetupModal appears with goal configuration
3. User selects file path (new or existing)
4. User configures goal type and value
5. Renderer validates input and updates UI
6. Form submission calls `startSession()` from AppContext
7. AppContext calls `window.api.session.start(filePath, name, title, goalType, goalValue, initialContent)`
8. Main process validates goal and creates session
9. SessionManager creates session and starts autosave
10. Session returned to renderer and stored in AppContext
11. User navigated to editor view
12. Editor loads session content and starts local state management

### State Persistence
1. **Session State**: Persisted to localStorage (activeSessionId, sessions array) with 30s debounce
2. **App State**: Persisted to localStorage (currentView, lastView) immediately
3. **Session Files**: Autosaved to user-selected .txt file every 10 seconds
4. **Session History**: Completed sessions saved to `session-history.json`

## Testing

All validation rules are thoroughly tested:
- Unit tests for validation functions
- Integration tests for session creation
- Component tests for UI behavior
- Edge case testing for boundary values

See `tests/` directory for complete test coverage.
