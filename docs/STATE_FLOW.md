# State Flow Diagrams

## User Typing Flow

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
                       │ Storage API     │
                       │ (Direct Backend)│
                       └─────────────────┘
```

**Key Points**:
- Local state updates immediately for UI feedback
- Content stored in ref to prevent React re-renders
- Backend update bypasses React state completely
- No editor focus loss due to separation of concerns

## Progress Tracking Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Local State    │───▶│ Progress Calc   │───▶│ Animation State │
│  (Word Count)   │    │ (Real-time)     │    │ (Immediate)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │ Timed Interval  │
                       │ (45 seconds)    │
                       └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │ Session API     │
                       │ (Progress Data) │
                       └─────────────────┘
```

**Key Points**:
- Progress calculated from local state for immediate UI feedback
- Animation context updated immediately for visual feedback
- Backend updates happen independently via intervals
- Threshold calculations include both word and time-based goals

## Timer Display Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Session Start  │───▶│  Timer Hook     │───▶│  Display Only   │
│  Time           │    │  (1 second)     │    │  (No Backend)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │ Focus Awareness │
                       │ (Pause/Resume)  │
                       └─────────────────┘
```

**Key Points**:
- Timer updates every second for smooth display
- Pauses when editor loses focus, resumes when focused
- No backend updates - purely for UI display
- Accumulates pause time for accurate active typing time

## Threshold Crossing Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Progress >= 33% │───▶│ Animation State │───▶│ Visual Feedback │
│ 67% or 100%     │    │ (Immediate)     │    │ (Immediate)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │ Logging Only    │
                       │ (No Backend)    │
                       └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │ Backend Update  │
                       │ (45s interval)  │
                       └─────────────────┘
```

**Key Points**:
- Threshold crossings trigger immediate animation state changes
- No direct backend updates on threshold crossings
- Backend persistence happens via scheduled intervals
- Prevents editor interference while maintaining functionality

## Complete State Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Editor Component                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ Local State     │  │ Session Context │  │ Animation       │  │
│  │ (Immediate)     │  │ (Coordination)  │  │ Context         │  │
│  │                 │  │                 │  │ (Visual)        │  │
│  │ • content       │  │ • session mgmt  │  │ • animation     │  │
│  │ • text          │  │ • lifecycle     │  │   state         │  │
│  │ • wordCount     │  │ • coordination  │  │ • thresholds    │  │
│  │ • charCount     │  │ • local state   │  │ • callbacks     │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│  Update Strategies                                              │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │ Content         │ │ Progress        │ │ Timer           │   │
│  │ 2s debounce     │ │ 45s interval    │ │ 1s display      │   │
│  │ ContentRef      │ │ Direct API      │ │ Focus-aware     │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend APIs                                 │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │ Storage API     │ │ Session API     │ │ Animation State │   │
│  │ (Content)       │ │ (Progress)      │ │ (UI Only)       │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

**Key Architecture Changes**:
- **ContentRef Pattern**: Content stored in ref, not React state
- **Direct API Calls**: Backend updates bypass React state
- **Session Context**: Acts as coordinator, not direct persistence layer
- **Animation Context**: Completely independent of backend
- **Focus-Aware Timer**: Pauses when editor loses focus

## Performance Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ High Frequency  │    │ Medium Frequency│    │ Low Frequency   │
│ (Real-time)     │    │ (Debounced)     │    │ (Intervals)     │
│                 │    │                 │    │                 │
│ • Word Count    │    │ • Content       │    │ • Progress      │
│ • Timer Display │    │ • Storage API   │    │ • Session API   │
│ • UI Updates    │    │ • 2s debounce   │    │ • 45s interval  │
│ • Animation     │    │ • ContentRef    │    │ • Thresholds    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ No Backend      │    │ Backend Calls   │    │ Backend Calls   │
│ Impact          │    │ (Reduced)       │    │ (Minimal)       │
│ No Editor Impact│    │ No Editor Impact│    │ No Editor Impact│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

**Performance Benefits**:
- **No Editor Interference**: All backend updates bypass React state
- **Optimized Frequencies**: Strategic timing prevents unnecessary calls
- **Focus Preservation**: ContentRef pattern eliminates focus loss
- **Independent Updates**: Display and persistence are completely separate

## Error Handling Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Backend Update  │───▶│ Error Detection │───▶│ Graceful        │
│ Attempt         │    │ & Logging       │    │ Degradation     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │ Continue        │
                       │ Operation       │
                       └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │ Next Update     │
                       │ (Automatic)     │
                       └─────────────────┘
```

**Error Handling Strategy**:
- **Non-blocking**: Errors don't interrupt user experience
- **Graceful Degradation**: UI continues to work despite backend failures
- **Automatic Retry**: Next scheduled update attempts to recover
- **Console Logging**: Errors logged for debugging without user impact

## Data Safety Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ User Input      │───▶│ Local State     │───▶│ Immediate UI    │
│                 │    │ (Always Saved)  │    │ (Never Lost)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │ ContentRef      │
                       │ (Persistent)    │
                       └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │ Backend Sync    │
                       │ (Eventually)    │
                       └─────────────────┘
```

**Data Safety Strategy**:
- **Immediate Local State**: User input always saved to local state
- **ContentRef Backup**: Content stored in ref for additional safety
- **Eventual Consistency**: Backend sync happens asynchronously
- **No Data Loss**: Multiple layers of persistence prevent data loss

This architecture ensures:
- **Immediate feedback** for user interactions
- **Data safety** through multiple persistence strategies
- **Performance optimization** through intelligent update frequencies
- **Reliability** through error handling and fallback mechanisms
- **Editor stability** through separation of display and persistence
