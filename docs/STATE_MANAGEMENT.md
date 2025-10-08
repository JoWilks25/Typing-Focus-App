# State Management Architecture

## Overview

The Typing Focus App uses a sophisticated hybrid state management approach that combines local state for immediate UI feedback with strategic backend persistence. This architecture ensures responsive user experience while maintaining data integrity and preventing editor focus loss.

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
│  │ 2 seconds       │ │ 45 seconds      │ │ 1 second        │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend Persistence                          │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │ Storage API     │ │ Session API     │ │ Animation State │   │
│  │ (Content)       │ │ (Progress)      │ │ (UI Feedback)   │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## State Management Layers

### 1. Local Editor State (Immediate UI Updates)

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

### 2. Session Context (Backend Persistence)

**Location**: `src/renderer/src/context/SessionContext.tsx`

**Responsibilities**:
- Session lifecycle management (create, update, delete)
- Local session state management
- Progress state coordination
- Backend persistence coordination

**Update Strategies**:
- **Content**: Debounced (2 seconds) via Editor component
- **Progress**: Timed intervals (45 seconds) via Editor component
- **Session State**: Immediate local updates, debounced backend persistence (30 seconds)
- **Critical State**: Immediate + backup

**Key Design**: Acts as a coordinator between local state and backend, not a direct persistence layer

### 3. Animation Context (UI Feedback)

**Location**: `src/renderer/src/context/AnimationContext.tsx`

```typescript
interface AnimationContextValue {
  animationState: 'idle' | 'low' | 'medium' | 'high' | 'complete';
  hasReached33: boolean;
  hasReached67: boolean;
  hasReached100: boolean;
  setProgressThresholds: (thresholds: { 33: boolean; 67: boolean; 100: boolean }) => void;
  onThresholdCrossed: (threshold: number) => void;
}
```

**Purpose**: Manages visual feedback and animation states based on progress thresholds
**Update Frequency**: Event-driven (on threshold crossings)
**Performance Impact**: Minimal (UI state only, no backend calls)
**Key Design**: Completely separate from backend persistence to prevent editor interference

## Update Strategies

### Content Updates (Debounced)

**Strategy**: Wait for typing pause, then update backend only
**Delay**: 2 seconds
**Trigger**: User stops typing
**Data**: Editor content (HTML)
**Implementation**: Editor component with contentRef pattern

```typescript
// Editor.tsx - Content update pattern
const debouncedUpdateSession = useDebounce(
  useCallback(() => {
    const content = contentRef.current; // Use ref, not React state
    if (activeSession) {
      // Direct backend update via Storage API - NO React state changes
      const api = getElectronAPI();
      api.storage.set({
        key: 'active-session',
        value: { ...activeSession, content, updatedAt: new Date().toISOString() }
      }).catch((error) => {
        console.warn('Failed to save session to backend:', error);
      });
    }
  }, [activeSession]),
  2000 // 2 seconds - prevents editor focus loss
);
```

**Key Design Decisions**:
- **ContentRef Pattern**: Stores content in ref, not React state, to prevent re-renders
- **Direct Backend Updates**: Bypasses React state to avoid editor interference
- **No Session Context Updates**: Prevents cascading re-renders that cause focus loss

**Pros**:
- Eliminates editor focus loss issues
- Reduces API calls significantly
- Better performance
- Natural user experience

**Cons**:
- Data loss risk if app crashes before debounce
- Delayed persistence
- More complex implementation

### Progress Updates (Timed Intervals)

**Strategy**: Regular intervals with threshold calculation and backend persistence
**Interval**: 45 seconds
**Trigger**: Time-based
**Data**: Word count, time elapsed, progress thresholds
**Implementation**: Editor component with direct Session API calls

```typescript
// Editor.tsx - Progress update pattern
useEffect(() => {
  if (!activeSession) return;

  const progressInterval = globalThis.setInterval(() => {
    if (localState.wordCount > 0) {
      const progressThresholds = activeSession.progressThresholds || { 33: false, 67: false, 100: false };
      const timeElapsed = activeSession.startTime ? Date.now() - activeSession.startTime : 0;
      
      // Calculate current progress and update thresholds
      const goalValue = activeSession.goalValue || 500;
      const goalType = activeSession.goalType || 'word';
      const currentProgress = goalType === 'word'
        ? Math.min(100, Math.floor((localState.wordCount / goalValue) * 100))
        : Math.min(100, Math.floor((timeElapsed / (goalValue * 60 * 1000)) * 100));

      const newThresholds = { ...progressThresholds };
      if (currentProgress >= 33 && !newThresholds[33]) newThresholds[33] = true;
      if (currentProgress >= 67 && !newThresholds[67]) newThresholds[67] = true;
      if (currentProgress >= 100 && !newThresholds[100]) newThresholds[100] = true;

      // Direct backend update via Session API - NO React state changes
      const api = getElectronAPI();
      (api.session as any).updateProgress({
        sessionId: activeSession.id,
        currentWords: localState.wordCount,
        timeElapsed,
        progressThresholds: newThresholds
      }).catch((error) => {
        console.warn('Failed to update progress:', error);
      });
    }
  }, 45000); // 45 seconds

  return () => globalThis.clearInterval(progressInterval);
}, [activeSession, localState.wordCount]);
```

**Key Design Decisions**:
- **Direct API Calls**: Bypasses React state to prevent editor interference
- **Threshold Calculation**: Updates progress thresholds based on current progress
- **Independent of UI**: Progress updates don't trigger React re-renders

**Pros**:
- Predictable updates
- Data safety
- No editor interference
- Comprehensive progress tracking

**Cons**:
- Unnecessary updates when no changes
- Resource usage
- Complex threshold logic

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
  // No onTimeUpdate callback - display only, no backend updates
});

// Timer calculation with pause handling
const calculateElapsedTime = useCallback((): number => {
  if (!sessionStartTime || !isSessionActive) {
    return 0;
  }

  const now = Date.now();
  const totalElapsed = now - sessionStartTime;
  const currentPauseTime = pauseStartRef.current ? now - pauseStartRef.current : 0;
  
  return Math.max(0, totalElapsed - totalPauseTimeRef.current - currentPauseTime);
}, [sessionStartTime, isSessionActive]);
```

**Key Design Decisions**:
- **Focus Awareness**: Timer pauses when editor loses focus, resumes when focused
- **Display Only**: No backend updates, purely for UI display
- **Pause Tracking**: Accumulates pause time to provide accurate active typing time
- **Independent Updates**: Timer updates don't affect editor state or backend

**Purpose**: UI display only, no backend updates
**Performance**: Minimal impact (display state only, no API calls)

## State Flow

### 1. User Types

```
User Input → Local State Update → UI Feedback (Instant)
           ↓
           ContentRef Update → Debounced Backend Update (2s) → Storage API
```

**Key Points**:
- Local state updates immediately for UI feedback
- Content stored in ref to prevent React re-renders
- Backend update bypasses React state completely
- No editor focus loss due to separation of concerns

### 2. Progress Tracking

```
Local State → Progress Calculation → Animation Context (Immediate)
           ↓
           Timed Progress Update (45s) → Session API → Backend
```

**Key Points**:
- Progress calculated from local state for immediate UI feedback
- Animation context updated immediately for visual feedback
- Backend updates happen independently via intervals
- Threshold calculations include both word and time-based goals

### 3. Threshold Crossings

```
Progress Calculation → Threshold Detection → Animation Context (Immediate)
                    ↓
                    Logging Only (No Backend Update)
                    ↓
                    Backend Update (45s interval) → Session API
```

**Key Points**:
- Threshold crossings trigger immediate animation state changes
- No direct backend updates on threshold crossings
- Backend persistence happens via scheduled intervals
- Prevents editor interference while maintaining functionality

## Performance Characteristics

| Update Type | Frequency | Backend Calls | UI Impact | Data Safety | Editor Impact |
|-------------|-----------|---------------|-----------|-------------|---------------|
| **Word Count** | Real-time | None | None | N/A | None |
| **Timer Display** | 1s | None | None | N/A | None |
| **Content** | 2s debounce | Low | None | Medium | None (ContentRef) |
| **Progress** | 45s interval | Very Low | None | High | None (Direct API) |
| **Thresholds** | Event-driven | None | None | High | None (Animation only) |
| **Animation** | Event-driven | None | Minimal | N/A | None |

## Key Design Decisions

### 1. Separation of Concerns

- **Local State**: Immediate UI feedback (Editor component)
- **Session Context**: Session lifecycle and coordination (not direct persistence)
- **Animation Context**: Visual feedback (completely independent)
- **Timer Hook**: Display only (focus-aware, no backend calls)
- **Backend APIs**: Direct persistence (Storage API, Session API)

### 2. Update Frequency Optimization

- **Content**: 2s debounce (prevents editor focus loss)
- **Progress**: 45s intervals (data safety without excessive calls)
- **Timer**: 1s real-time (smooth display, focus-aware)
- **Animation**: Event-driven (immediate visual feedback)

### 3. Editor Focus Preservation

- **ContentRef Pattern**: Stores content in ref, not React state
- **Direct API Calls**: Bypasses React state for backend updates
- **No Cascading Updates**: Prevents re-render chains that cause focus loss
- **Separation of Display and Persistence**: UI updates independent of backend

### 4. Threshold Management

- **Immediate**: Animation state updates (UI feedback)
- **Delayed**: Backend persistence via progress intervals
- **Independent**: Animation context completely separate from backend
- **Rationale**: Prevents editor interference while maintaining functionality

## Backend Integration Patterns

### 1. Storage API (Content Persistence)

**Usage**: Direct content persistence without React state changes
**Location**: Editor component debounced updates
**Pattern**: ContentRef → Storage API

```typescript
// Direct backend update pattern
const api = getElectronAPI();
api.storage.set({
  key: 'active-session',
  value: { ...activeSession, content, updatedAt: new Date().toISOString() }
}).catch((error) => {
  console.warn('Failed to save session to backend:', error);
});
```

**Benefits**:
- No React re-renders
- No editor focus loss
- Direct persistence
- Error handling built-in

### 2. Session API (Progress Persistence)

**Usage**: Progress and threshold updates via dedicated API
**Location**: Editor component interval updates
**Pattern**: Local State → Session API

```typescript
// Progress update pattern
(api.session as any).updateProgress({
  sessionId: activeSession.id,
  currentWords: localState.wordCount,
  timeElapsed,
  progressThresholds: newThresholds
}).catch((error) => {
  console.warn('Failed to update progress:', error);
});
```

**Benefits**:
- Structured progress tracking
- Threshold management
- Session-specific updates
- Comprehensive error handling

### 3. API Error Handling

**Strategy**: Non-blocking with graceful degradation
**Implementation**: Try-catch with console warnings
**Fallback**: Continue operation, log errors for debugging

```typescript
// Error handling pattern
.catch((error) => {
  console.warn('Failed to update backend:', error);
  // Continue operation - don't block UI
});
```

## Error Handling

### Content Update Failures
- Graceful degradation (UI continues to work)
- Console warnings for debugging
- No retry mechanism (prevents editor interference)
- Fallback to next debounced update

### Progress Update Failures
- Non-blocking (UI continues to work)
- Logging for debugging
- Automatic retry on next interval (45s)
- No impact on user experience

### Timer Failures
- Fallback to static display
- No impact on core functionality
- Focus state preserved
- Independent of backend state

### API Communication Failures
- Non-blocking error handling
- Console warnings for debugging
- Graceful degradation
- User experience unaffected

## Testing Strategy

### Unit Tests
- Local state updates
- Debounce timing
- Threshold calculations
- Timer accuracy

### Integration Tests
- State synchronization
- Backend persistence
- Error scenarios

### Performance Tests
- Memory usage
- CPU impact
- Network efficiency

## Future Considerations

### Potential Optimizations
1. **Adaptive Debouncing**: Adjust delay based on typing speed
2. **Smart Intervals**: Vary progress update frequency based on activity
3. **Batch Updates**: Combine multiple state changes
4. **Offline Support**: Queue updates when offline

### Scalability
- Current architecture supports multiple concurrent sessions
- State isolation prevents cross-session interference
- Modular design allows easy extension

## Troubleshooting

### Common Issues

1. **Content Clearing**: Usually caused by aggressive state updates
   - **Solution**: Separate display from persistence logic

2. **Timer Interference**: Multiple update paths causing conflicts
   - **Solution**: Single responsibility principle for each hook

3. **Performance Issues**: Too frequent backend updates
   - **Solution**: Optimize debounce delays and intervals

### Debug Tools

- Console logging for threshold crossings
- Progress update logging
- State change tracking
- Performance monitoring

## Conclusion

This sophisticated hybrid state management approach provides:

### Core Benefits
- **Responsive UI**: Instant feedback through local state without backend delays
- **Editor Stability**: No focus loss through ContentRef pattern and direct API calls
- **Data Safety**: Regular persistence through strategic intervals and debouncing
- **Performance**: Optimized update frequencies with minimal backend calls
- **Maintainability**: Clear separation of concerns between display and persistence

### Key Innovations
- **ContentRef Pattern**: Prevents React re-renders that cause editor focus loss
- **Direct API Integration**: Bypasses React state for backend updates
- **Focus-Aware Timer**: Pauses when editor loses focus for accurate typing time
- **Independent Animation State**: Visual feedback without backend interference
- **Strategic Debouncing**: 2s for content, 45s for progress, 1s for display

### Architecture Strengths
- **Editor Focus Preservation**: Solves the critical issue of editor focus loss
- **Separation of Concerns**: Display, persistence, and animation are completely independent
- **Error Resilience**: Non-blocking error handling with graceful degradation
- **Performance Optimization**: Minimal backend calls with maximum user experience
- **Scalability**: Architecture supports multiple concurrent sessions and future enhancements

The architecture successfully balances user experience, data integrity, system performance, and editor stability while remaining flexible for future enhancements. The key innovation is the complete separation of display state from persistence state, ensuring that backend updates never interfere with the user's typing experience.
