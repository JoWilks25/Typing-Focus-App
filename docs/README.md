# Typing Focus App - Documentation

## State Management Overview

The Typing Focus App implements a sophisticated state management system that balances real-time user experience with efficient backend persistence. This document provides a comprehensive overview of how different state elements are managed across the editor and progress tracking system.

## Quick Reference

### Update Frequencies
- **Word Count**: Real-time (local state)
- **Timer Display**: 1 second (display only)
- **Content Persistence**: 2.5 seconds (debounced)
- **Progress Persistence**: 45 seconds (timed intervals)
- **Threshold Animations**: Event-driven (immediate)

### Key Components
- **Local Editor State**: Immediate UI feedback
- **Session Context**: Backend persistence
- **Animation Context**: Visual feedback
- **Timer Hook**: Display-only time tracking

## State Management Architecture

### 1. Local Editor State
**Purpose**: Instant UI feedback without backend delays
**Location**: `Editor.tsx`
**Updates**: Real-time on every keystroke

```typescript
interface LocalEditorState {
  content: string;        // HTML content
  text: string;          // Plain text
  wordCount: number;     // Current words
  characterCount: number; // Current characters
  lastUpdated: number;   // Timestamp
}
```

### 2. Session Context
**Purpose**: Backend persistence and session management
**Location**: `SessionContext.tsx`
**Updates**: Debounced content (2.5s) + timed progress (45s)

### 3. Animation Context
**Purpose**: Visual feedback and progress animations
**Location**: `AnimationContext.tsx`
**Updates**: Event-driven on threshold crossings

### 4. Timer Hook
**Purpose**: Real-time time display
**Location**: `useTimer.ts`
**Updates**: 1-second intervals (display only)

## Update Strategies

### Content Updates (Debounced)
- **Delay**: 2.5 seconds after typing stops
- **Purpose**: Persist editor content to backend
- **Performance**: Reduces API calls by ~80%

### Progress Updates (Timed Intervals)
- **Interval**: 45 seconds
- **Purpose**: Persist progress and threshold states
- **Performance**: Minimal backend load

### Timer Display (Real-time)
- **Frequency**: 1 second
- **Purpose**: Smooth time display
- **Performance**: No backend impact

## Performance Characteristics

| Component | Update Frequency | Backend Calls | UI Impact | Data Safety |
|-----------|------------------|---------------|-----------|-------------|
| Word Count | Real-time | None | None | N/A |
| Timer | 1s | None | None | N/A |
| Content | 2.5s debounce | Low | Low | Medium |
| Progress | 45s interval | Very Low | None | High |
| Thresholds | Event-driven | None | None | High |

## Key Design Principles

1. **Separation of Concerns**: Each state layer has a specific responsibility
2. **Performance Optimization**: Balance between responsiveness and efficiency
3. **Data Safety**: Regular persistence without user interference
4. **User Experience**: Instant feedback with reliable persistence

## Troubleshooting

### Common Issues
- **Content Clearing**: Usually from aggressive state updates
- **Timer Interference**: Multiple update paths causing conflicts
- **Performance Issues**: Too frequent backend updates

### Solutions
- Separate display from persistence logic
- Single responsibility for each hook
- Optimize debounce delays and intervals

## Files Overview

### Core State Management
- `Editor.tsx` - Local state and update coordination
- `SessionContext.tsx` - Backend persistence
- `AnimationContext.tsx` - Visual feedback
- `useSessionProgress.ts` - Progress tracking coordination

### Supporting Hooks
- `useTimer.ts` - Time tracking (display only)
- `useProgress.ts` - Progress calculations
- `useDebounce.ts` - Debouncing utility
- `useAnimation.ts` - Animation state access

### Components
- `SessionStats.tsx` - Progress display using local state
- `Editor.tsx` - Main editor with state management

## Development Guidelines

### Adding New State
1. Determine if it needs immediate UI feedback
2. Choose appropriate update strategy (real-time, debounced, or interval)
3. Implement in appropriate layer (local, context, or hook)
4. Add proper error handling and logging

### Performance Considerations
- Use local state for immediate UI feedback
- Debounce frequent updates
- Use intervals for background persistence
- Avoid unnecessary re-renders

### Testing Strategy
- Unit tests for individual state updates
- Integration tests for state synchronization
- Performance tests for update frequencies
- Error scenario testing

## Future Enhancements

### Potential Optimizations
- Adaptive debouncing based on typing speed
- Smart intervals based on activity level
- Batch updates for multiple state changes
- Offline support with update queuing

### Scalability Considerations
- Support for multiple concurrent sessions
- State isolation to prevent interference
- Modular design for easy extension
- Performance monitoring and optimization

---

For detailed technical documentation, see [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md)