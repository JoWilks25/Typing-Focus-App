# State Management Architecture

## Overview

Draft Tree uses a consolidated React Context-based state management approach that combines application state and session state in a single `AppContext`. This architecture ensures responsive user experience while maintaining data integrity through strategic backend persistence.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Editor Component                         │
├─────────────────────────────────────────────────────────────────┤
│  Local State (Immediate UI Updates)                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • content: string (HTML)                               │   │
│  │ • text: string (plain text)                            │   │
│  │ • wordCount: number                                    │   │
│  │ • characterCount: number                               │   │
│  │ • lastUpdated: timestamp                               │   │
│  └─────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│  Update Strategies                                              │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │ Content Updates │ │ Progress Updates│ │ Timer Display   │   │
│  │ (Debounced)     │ │ (Timed Intervals│ │ (Real-time)     │   │
│  │ 2 seconds       │ │ 5 seconds       │ │ 1 second        │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AppContext (React Context)                   │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │ App State       │ │ Session State   │ │ Navigation      │   │
│  │ (appState)      │ │ (sessions)      │ │ (currentView)   │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend Persistence                          │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │ Session API     │ │ File Manager    │ │ Storage API     │   │
│  │ (via IPC)       │ │ (autosave)      │ │ (localStorage)  │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## State Management Layers

### 1. AppContext (Consolidated State Management)

**Location**: `src/renderer/src/context/AppContext.tsx`

```typescript
interface AppState {
  currentView: View;
  lastView: View | null;
}

interface AppContextValue {
  // App state
  appState: AppState;
  setView: (view: View) => void;
  
  // Session state
  sessions: Session[];
  activeSession: Session | null;
  
  // Session actions
  startSession: (filePath: string, name?: string, title?: string, goalType?: GoalType, goalValue?: number, initialContent?: string) => Promise<Session>;
  endSession: (sessionId: string, finalContent: string, finalWordCount: number) => Promise<Session>;
  updateSession: (session: Session) => void;
  updateProgress: (currentWords: number, timeElapsed: number, progressPercentage: number) => Promise<void>;
  // ... other session methods
}
```

**Key Features**:
- **Consolidated Management**: Single context for app state and session state
- **Persistent State**: App state persists to localStorage (`appStorage.ts`)
- **Session State**: Session state persists to localStorage (`sessionStorage.ts`)
- **Validation**: Validates active session on startup against backend
- **Debounced Persistence**: Session state persists with 30-second debounce

### 2. Local Editor State (Immediate UI Updates)

**Location**: `src/renderer/src/components/Editor/Editor.tsx`

```typescript
interface LocalEditorState {
  content: string;        // HTML content from Tiptap editor
  text: string;          // Plain text for word counting (HTML stripped)
  wordCount: number;     // Current word count (real-time)
  characterCount: number; // Current character count (real-time)
  lastUpdated: number;   // Timestamp of last update
}
```

**Purpose**: Provides instant UI feedback without backend delays or React re-renders
**Update Frequency**: Real-time on every keystroke
**Performance Impact**: Minimal (local state only, no backend calls)
**Key Design**: Separates display state from persistence to prevent editor focus loss

### 3. Backend Integration

**Location**: Multiple services in `src/main/services/`

**Services**:
- **SessionManager**: Session lifecycle and progress tracking
- **FileManager**: File I/O and autosave (every 10 seconds)
- **InactivityService**: Inactivity detection (1 minute threshold)
- **FocusMonitorService**: Window focus detection for distraction warnings
- **FloatingModalService**: Floating modal window management

## Data Flow

### User Typing Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Types    │───▶│  Local State    │───▶│  UI Updates     │
│   in Editor     │    │  (Immediate)    │    │  (Instant)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │ ContentRef      │
                       │ (No React State)│
                       └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │ Debounced Update│
                       │ (2 seconds)     │
                       └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │ Session API     │
                       │ (updateContent) │
                       └─────────────────┘
```

**Key Points**:
- Local state updates immediately for UI feedback
- Content stored in ref to prevent React re-renders
- Backend update via `session.updateContent()` after user stops typing
- No editor focus loss due to separation of concerns

### Progress Tracking Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Local State    │───▶│ Progress Calc   │───▶│ UI Progress Bar │
│  (Word Count)   │    │ (Real-time)     │    │ (Immediate)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │ Timed Interval  │
                       │ (5 seconds)     │
                       └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │ Session API     │
                       │ (updateProgress)│
                       └─────────────────┘
```

**Key Points**:
- Progress calculated from local state for immediate UI feedback
- Backend updates happen independently via 5-second intervals
- Progress percentage calculation includes both word and time-based goals

## Update Strategies

### Content Updates (Debounced)

**Strategy**: Wait for typing pause, then update backend
**Delay**: 2 seconds
**Trigger**: User stops typing
**Data**: Editor content (HTML)
**Implementation**: Editor component with contentRef pattern

```typescript
// Editor.tsx - Content update pattern
const debouncedUpdateSession = useDebounce(
  useCallback(async () => {
    const content = contentRef.current;
    const currentActiveSession = activeSessionRef.current;
    if (currentActiveSession) {
      try {
        // Update session content via API
        const updatedSession = await window.api.session.updateContent(
          currentActiveSession.id,
          content
        );
        
        // Update AppContext with new session data
        updateSession(updatedSession);
      } catch (error) {
        console.error('Failed to update session content:', error);
      }
    }
  }, [updateSession]),
  2000 // 2 second delay
);
```

**Key Design Decisions**:
- **ContentRef Pattern**: Stores content in ref, not React state, to prevent re-renders
- **Direct Backend Updates**: Uses `session.updateContent()` IPC call
- **Context Sync**: Updates AppContext after successful backend update
- **Error Handling**: Non-blocking errors, continues operation

**Pros**:
- Eliminates editor focus loss issues
- Reduces API calls significantly
- Better performance
- Natural user experience

### Progress Updates (Timed Intervals)

**Strategy**: Regular intervals with progress calculation and backend persistence
**Interval**: 5 seconds
**Trigger**: Time-based
**Data**: Word count, time elapsed, progress percentage
**Implementation**: Editor component with context-based progress updates

```typescript
// Editor.tsx - Progress update pattern
const updateProgressInBackground = useCallback(() => {
  if (!activeSession) return;
  
  // Calculate time elapsed for progress tracking
  const timeElapsed = activeSession.startTime 
    ? Date.now() - activeSession.startTime 
    : 0;

  // Calculate current progress percentage
  const goalValue = activeSession.goalValue || 500;
  const goalType = activeSession.goalType || 'word';
  
  const currentProgress = goalType === 'word'
    ? Math.min(100, Math.floor((localState.wordCount / goalValue) * 100))
    : Math.min(100, Math.floor((timeElapsed / (goalValue * 60 * 1000)) * 100));

  // Show completion modal when reaching 100%
  if (currentProgress >= 100 && !hasShownCompletionModal) {
    setShowCompletionModal(true);
    setHasShownCompletionModal(true);
  }

  // Update progress via AppContext
  updateProgress(localState.wordCount, timeElapsed, currentProgress);
}, [activeSession, hasShownCompletionModal, localState.wordCount, updateProgress]);

useEffect(() => {
  if (!activeSession) return;
  
  const progressInterval = globalThis.setInterval(() => {
    if (localState.wordCount > 0) {
      updateProgressInBackground();
    }
  }, 5000); // 5 seconds

  return () => globalThis.clearInterval(progressInterval);
}, [activeSession, updateProgressInBackground, localState.wordCount]);
```

**Key Design Decisions**:
- **Context-based Updates**: Uses AppContext's `updateProgress()` method
- **Simple Progress Model**: Single percentage value instead of thresholds
- **Modal Triggers**: Direct percentage-based completion modal logic
- **Pause Handling**: Progress updates respect pause state

**Pros**:
- Simpler data model than threshold-based approach
- Cleaner logic
- Better performance
- More flexible for milestone handling

### Timer Display (Real-time)

**Strategy**: Continuous updates for display only with focus awareness
**Frequency**: 1 second
**Trigger**: Time-based with focus state management
**Data**: Formatted time, running state, focus-aware elapsed time
**Implementation**: useTimer hook with focus tracking

```typescript
// useTimer.ts - Timer display pattern
const timerState = useTimer({
  sessionStartTime: activeSession?.startTime,
  isSessionActive: activeSession?.status === 'active',
  isFocused, // Pauses when editor loses focus
});

// Timer calculation with pause handling
const calculateElapsedTime = useCallback((): number => {
  if (!sessionStartTime || !isSessionActive) {
    return 0;
  }

  const now = Date.now();
  const totalElapsed = now - sessionStartTime;
  const currentPauseTime = pauseStartRef.current 
    ? now - pauseStartRef.current 
    : 0;
  
  return Math.max(0, totalElapsed - totalPauseTimeRef.current - currentPauseTime);
}, [sessionStartTime, isSessionActive]);
```

**Key Design Decisions**:
- **Focus Awareness**: Timer pauses when editor loses focus, resumes when focused
- **Display Only**: No backend updates, purely for UI display
- **Pause Tracking**: Accumulates pause time for accurate active typing time
- **Independent Updates**: Timer updates don't affect editor state or backend

## Performance Characteristics

| Update Type | Frequency | Backend Calls | UI Impact | Data Safety | Editor Impact |
|-------------|-----------|---------------|-----------|-------------|---------------|
| **Word Count** | Real-time | None | None | N/A | None |
| **Timer Display** | 1s | None | None | N/A | None |
| **Content** | 2s debounce | Low | None | Medium | None (ContentRef) |
| **Progress** | 5s interval | Very Low | None | High | None (Direct API) |
| **Autosave** | 10s (backend) | Very Low | None | High | None |

## Key Design Decisions

### 1. Consolidated Context

- **Single AppContext**: Combines app state and session state
- **No Separate Contexts**: No SessionContext or AnimationContext
- **Simpler Architecture**: Easier to maintain and understand
- **Clear Data Flow**: Single source of truth for app and session data

### 2. Update Frequency Optimization

- **Content**: 2s debounce (prevents editor focus loss)
- **Progress**: 5s intervals (data safety without excessive calls)
- **Timer**: 1s real-time (smooth display, focus-aware)
- **Autosave**: 10s backend (file-based persistence)

### 3. Editor Focus Preservation

- **ContentRef Pattern**: Stores content in ref, not React state
- **Direct API Calls**: Bypasses React state for backend updates
- **No Cascading Updates**: Prevents re-render chains that cause focus loss
- **Separation of Display and Persistence**: UI updates independent of backend

### 4. Simple Progress Model

- **Percentage-Based**: Single progress percentage (0-100)
- **No Threshold System**: Simplified from complex threshold tracking
- **Direct Calculation**: Progress calculated on demand
- **Flexible Milestones**: Can add milestone triggers as needed

## Backend Integration Patterns

### 1. Session API (Progress and Content)

**Usage**: All session-related operations
**Location**: Editor component and AppContext
**Pattern**: IPC calls via `window.api.session.*`

```typescript
// Update content
const updatedSession = await window.api.session.updateContent(
  sessionId, 
  content
);

// Update progress
const updatedSession = await window.api.session.updateProgress(
  sessionId,
  currentWords,
  timeElapsed,
  progressPercentage
);
```

**Benefits**:
- Type-safe IPC communication
- Structured session updates
- Comprehensive error handling
- Consistent API surface

### 2. Storage API (Key-Value Persistence)

**Usage**: Application-level storage
**Location**: appStorage.ts and sessionStorage.ts
**Pattern**: localStorage for renderer-side caching

```typescript
// App state persistence
export function saveAppState(state: AppState): void {
  localStorage.setItem(APP_STATE_KEY, JSON.stringify(state));
}

// Session state persistence
export function saveSessionState(state: SessionState): void {
  localStorage.setItem(SESSION_STATE_KEY, JSON.stringify(state));
}
```

**Benefits**:
- Fast renderer-side caching
- Instant app state restoration
- Debounced for performance
- Validated on startup

### 3. File Manager (Autosave)

**Usage**: Automatic file persistence
**Location**: Backend SessionManager service
**Pattern**: 10-second interval autosave

**Benefits**:
- Transparent to user
- Prevents data loss
- File-based persistence
- Error resilient

## Error Handling

### Content Update Failures
- Graceful degradation (UI continues to work)
- Console warnings for debugging
- No retry mechanism (prevents editor interference)
- Fallback to next debounced update

### Progress Update Failures
- Non-blocking (UI continues to work)
- Logging for debugging
- Automatic retry on next interval (5s)
- No impact on user experience

### API Communication Failures
- Non-blocking error handling
- Console warnings for debugging
- Graceful degradation
- User experience unaffected

## State Persistence

### localStorage (Renderer)
- **App State**: `app-state` key
- **Session State**: `session-state` key (activeSessionId, sessions array)
- **Debounced**: 30-second debounce for session state
- **Validation**: Active session validated against backend on startup

### Backend Persistence
- **Session Files**: User-selected .txt file paths
- **Storage**: JSON key-value storage (`storage.json`)
- **Session History**: Completed sessions (`session-history.json`)
- **Autosave**: Every 10 seconds via FileManager

## Testing Strategy

### Unit Tests
- Local state updates
- Debounce timing
- Progress calculations
- Timer accuracy

### Integration Tests
- State synchronization
- Backend persistence
- Error scenarios
- Context validation

### Performance Tests
- Memory usage
- CPU impact
- Network efficiency
- Editor responsiveness

## Conclusion

This React Context-based state management approach provides:

### Core Benefits
- **Responsive UI**: Instant feedback through local state without backend delays
- **Editor Stability**: No focus loss through ContentRef pattern and direct API calls
- **Data Safety**: Regular persistence through strategic intervals and debouncing
- **Performance**: Optimized update frequencies with minimal backend calls
- **Maintainability**: Clear separation of concerns between display and persistence
- **Simplicity**: Single consolidated context instead of multiple contexts

### Key Innovations
- **ContentRef Pattern**: Prevents React re-renders that cause editor focus loss
- **Direct API Integration**: Bypasses React state for backend updates
- **Simple Progress Model**: Percentage-based instead of complex thresholds
- **Consolidated Context**: Single AppContext for app and session state
- **Strategic Debouncing**: 2s for content, 5s for progress, 1s for display

### Architecture Strengths
- **Editor Focus Preservation**: Solves the critical issue of editor focus loss
- **Separation of Concerns**: Display, persistence, and calculation are independent
- **Error Resilience**: Non-blocking error handling with graceful degradation
- **Performance Optimization**: Minimal backend calls with maximum user experience
- **Scalability**: Architecture supports future enhancements

The architecture successfully balances user experience, data integrity, system performance, and editor stability while remaining flexible for future enhancements.

---

For related information, see:
- [Architecture Overview](./OVERVIEW.md)
- [Session Lifecycle](../guides/SESSION_LIFECYCLE.md)
- [Animation System](../guides/ANIMATION_SYSTEM.md)
- [Project Structure](./PROJECT_STRUCTURE.md)
